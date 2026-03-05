package com.pos.customer.plugins;

import android.content.Context;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.sunmi.peripheral.printer.InnerPrinterCallback;
import com.sunmi.peripheral.printer.InnerPrinterException;
import com.sunmi.peripheral.printer.InnerPrinterManager;
import com.sunmi.peripheral.printer.SunmiPrinterService;

import woyou.aidlservice.jiuiv5.IWoyouService;

@CapacitorPlugin(name = "SunmiPrinter")
public class SunmiPrinterPlugin extends Plugin {
  private static final String TAG = "SunmiPrinterPlugin";

  private IWoyouService printerService;
  private boolean isBinding = false;
  private PluginCall pendingConnectCall;
  private PluginCall pendingPrintCall;

  private final InnerPrinterCallback printerCallback = new InnerPrinterCallback() {
    @Override
    protected void onConnected(SunmiPrinterService service) {
      // Cast or convert the SunmiPrinterService to IWoyouService
      printerService = IWoyouService.Stub.asInterface(service.asBinder());
      isBinding = false;

      if (pendingConnectCall != null) {
        JSObject ret = new JSObject();
        ret.put("connected", true);
        pendingConnectCall.resolve(ret);
        pendingConnectCall = null;
      }

      if (pendingPrintCall != null) {
        printNow(pendingPrintCall);
        pendingPrintCall = null;
      }
    }

    @Override
    protected void onDisconnected() {
      printerService = null;
      isBinding = false;
    }
  };

  @PluginMethod
  public void isAvailable(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("available", printerService != null);
    call.resolve(ret);
  }

  @PluginMethod
  public void connect(PluginCall call) {
    if (printerService != null) {
      JSObject ret = new JSObject();
      ret.put("connected", true);
      call.resolve(ret);
      return;
    }

    bindPrinter(call);
  }

  @PluginMethod
  public void printText(PluginCall call) {
    String text = call.getString("text", "").trim();
    if (text.isEmpty()) {
      call.reject("Text is required");
      return;
    }

    if (printerService == null) {
      pendingPrintCall = call;
      bindPrinter(null);
      return;
    }

    printNow(call);
  }

  private void printNow(@NonNull PluginCall call) {
    String text = call.getString("text", "");

    try {
      if (printerService == null) {
        call.reject("Printer is not connected");
        return;
      }

      printerService.printerInit(null);
      printerService.setAlignment(0, null);
      printerService.printText(text, null);
      printerService.lineWrap(3, null);

      JSObject ret = new JSObject();
      ret.put("printed", true);
      call.resolve(ret);
    } catch (RemoteException e) {
      Log.e(TAG, "Print failed", e);
      call.reject("Print failed: " + e.getMessage());
    }
  }

  private void bindPrinter(PluginCall connectCall) {
    if (connectCall != null) {
      pendingConnectCall = connectCall;
    }

    if (isBinding) {
      return;
    }

    isBinding = true;
    Context context = getContext().getApplicationContext();
    try {
      boolean result = InnerPrinterManager.getInstance().bindService(context, printerCallback);
      if (!result) {
        isBinding = false;
        rejectPendingCalls("Unable to bind Sunmi printer service");
      }
    } catch (InnerPrinterException e) {
      isBinding = false;
      Log.e(TAG, "Bind service failed", e);
      rejectPendingCalls("Bind service failed: " + e.getMessage());
    }
  }

  private void rejectPendingCalls(String message) {
    if (pendingConnectCall != null) {
      pendingConnectCall.reject(message);
      pendingConnectCall = null;
    }
    if (pendingPrintCall != null) {
      pendingPrintCall.reject(message);
      pendingPrintCall = null;
    }
  }

  @Override
  protected void handleOnDestroy() {
    super.handleOnDestroy();
    try {
      InnerPrinterManager.getInstance().unBindService(getContext().getApplicationContext(), printerCallback);
    } catch (Exception e) {
      Log.w(TAG, "Unbind failed", e);
    } finally {
      printerService = null;
      isBinding = false;
    }
  }
}

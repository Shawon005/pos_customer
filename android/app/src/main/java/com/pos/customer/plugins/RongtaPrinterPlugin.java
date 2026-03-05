package com.pos.customer.plugins;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Build;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
  name = "RongtaPrinter",
  permissions = {
    @Permission(alias = "bluetooth", strings = {Manifest.permission.BLUETOOTH_CONNECT})
  }
)
public class RongtaPrinterPlugin extends Plugin {
  private static final String TAG = "RongtaPrinterPlugin";
  private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

  private PluginCall pendingCall;
  private String pendingAction;
  private String pendingText;
  private String pendingAddress;
  private List<String> pendingKeywords;

  @PluginMethod
  public void isAvailable(PluginCall call) {
    BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
    JSObject ret = new JSObject();
    ret.put("available", adapter != null && adapter.isEnabled());
    call.resolve(ret);
  }

  @PluginMethod
  public void connect(PluginCall call) {
    String address = normalizeAddress(call.getString("address", ""));
    List<String> keywords = parseKeywords(call.getArray("nameKeywords"));

    if (!ensureBluetoothPermission(call, "connect", address, null, keywords)) {
      return;
    }

    runConnect(call, address, keywords);
  }

  @PluginMethod
  public void listPairedDevices(PluginCall call) {
    if (!ensureBluetoothPermission(call, "list", null, null, null)) {
      return;
    }

    runListPairedDevices(call);
  }

  @PluginMethod
  public void printText(PluginCall call) {
    String text = call.getString("text", "");
    if (text == null || text.trim().isEmpty()) {
      call.reject("Text is required");
      return;
    }

    String address = normalizeAddress(call.getString("address", ""));
    List<String> keywords = parseKeywords(call.getArray("nameKeywords"));

    if (!ensureBluetoothPermission(call, "print", address, text, keywords)) {
      return;
    }

    runPrint(call, text, address, keywords);
  }

  @PermissionCallback
  private void bluetoothPermissionCallback(PluginCall call) {
    if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
      rejectAndClearPending("Bluetooth permission is required for Rongta printing");
      return;
    }

    if (pendingCall == null) {
      return;
    }

    PluginCall callToProcess = pendingCall;
    String action = pendingAction;
    String address = pendingAddress;
    String text = pendingText;
    List<String> keywords = pendingKeywords;
    clearPending();

    if ("connect".equals(action)) {
      runConnect(callToProcess, address, keywords);
      return;
    }

    if ("list".equals(action)) {
      runListPairedDevices(callToProcess);
      return;
    }

    if ("print".equals(action)) {
      runPrint(callToProcess, text, address, keywords);
    }
  }

  private boolean ensureBluetoothPermission(
    @NonNull PluginCall call,
    @NonNull String action,
    String address,
    String text,
    List<String> keywords
  ) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true;
    }

    if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
      return true;
    }

    pendingCall = call;
    pendingAction = action;
    pendingAddress = address;
    pendingText = text;
    pendingKeywords = keywords;
    requestPermissionForAlias("bluetooth", call, "bluetoothPermissionCallback");
    return false;
  }

  private void runConnect(@NonNull PluginCall call, String address, List<String> keywords) {
    getBridge().execute(() -> {
      try {
        BluetoothDevice device = findTargetDevice(address, keywords);
        JSObject ret = new JSObject();
        ret.put("connected", device != null);
        call.resolve(ret);
      } catch (SecurityException e) {
        Log.e(TAG, "Bluetooth permission error", e);
        call.reject("Bluetooth permission denied");
      } catch (Exception e) {
        Log.e(TAG, "Rongta connect failed", e);
        call.reject("Rongta connect failed: " + e.getMessage());
      }
    });
  }

  private void runPrint(@NonNull PluginCall call, @NonNull String text, String address, List<String> keywords) {
    getBridge().execute(() -> {
      BluetoothSocket socket = null;
      try {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
          call.reject("Bluetooth is not supported on this device");
          return;
        }
        if (!adapter.isEnabled()) {
          call.reject("Bluetooth is disabled");
          return;
        }

        BluetoothDevice targetDevice = findTargetDevice(address, keywords);
        adapter.cancelDiscovery();
        socket = targetDevice.createRfcommSocketToServiceRecord(SPP_UUID);
        socket.connect();

        OutputStream outputStream = socket.getOutputStream();
        outputStream.write(new byte[] {0x1B, 0x40}); // ESC @
        outputStream.write((text.trim() + "\n\n").getBytes(StandardCharsets.UTF_8));
        outputStream.write(new byte[] {0x1D, 0x56, 0x00}); // GS V 0
        outputStream.flush();

        JSObject ret = new JSObject();
        ret.put("printed", true);
        call.resolve(ret);
      } catch (SecurityException e) {
        Log.e(TAG, "Bluetooth permission error", e);
        call.reject("Bluetooth permission denied");
      } catch (Exception e) {
        Log.e(TAG, "Rongta print failed", e);
        call.reject("Rongta print failed: " + e.getMessage());
      } finally {
        if (socket != null) {
          try {
            socket.close();
          } catch (Exception ignored) {
          }
        }
      }
    });
  }

  private void runListPairedDevices(@NonNull PluginCall call) {
    getBridge().execute(() -> {
      try {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
          call.reject("Bluetooth is not supported on this device");
          return;
        }
        if (!adapter.isEnabled()) {
          call.reject("Bluetooth is disabled");
          return;
        }

        Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
        JSObject ret = new JSObject();
        JSArray devices = new JSArray();
        if (bondedDevices != null && !bondedDevices.isEmpty()) {
          for (BluetoothDevice device : bondedDevices) {
            JSObject item = new JSObject();
            item.put("name", device.getName() == null ? "Unknown Device" : device.getName());
            item.put("address", device.getAddress() == null ? "" : device.getAddress());
            devices.put(item);
          }
        }
        ret.put("devices", devices);
        call.resolve(ret);
      } catch (SecurityException e) {
        Log.e(TAG, "Bluetooth permission error", e);
        call.reject("Bluetooth permission denied");
      } catch (Exception e) {
        Log.e(TAG, "List paired devices failed", e);
        call.reject("List paired devices failed: " + e.getMessage());
      }
    });
  }

  @SuppressLint("MissingPermission")
  private BluetoothDevice findTargetDevice(String requestedAddress, List<String> keywords) throws Exception {
    BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
    if (adapter == null) {
      throw new Exception("Bluetooth is not supported on this device");
    }
    if (!adapter.isEnabled()) {
      throw new Exception("Bluetooth is disabled");
    }

    Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
    if (bondedDevices == null || bondedDevices.isEmpty()) {
      throw new Exception("No paired Bluetooth printers found");
    }

    if (!TextUtils.isEmpty(requestedAddress)) {
      for (BluetoothDevice device : bondedDevices) {
        if (requestedAddress.equalsIgnoreCase(device.getAddress())) {
          return device;
        }
      }
      throw new Exception("Paired printer not found for address: " + requestedAddress);
    }

    List<String> safeKeywords = new ArrayList<>();
    if (keywords != null) {
      for (String keyword : keywords) {
        if (!TextUtils.isEmpty(keyword)) {
          safeKeywords.add(keyword.toUpperCase());
        }
      }
    }
    if (safeKeywords.isEmpty()) {
      safeKeywords.add("RONGTA");
      safeKeywords.add("RP58");
      safeKeywords.add("RP80");
      safeKeywords.add("RP302");
      safeKeywords.add("RP335");
      safeKeywords.add("RP");
    }

    for (BluetoothDevice device : bondedDevices) {
      String name = device.getName() == null ? "" : device.getName().toUpperCase();
      String address = device.getAddress() == null ? "" : device.getAddress().toUpperCase();
      for (String keyword : safeKeywords) {
        if (name.contains(keyword) || address.contains(keyword)) {
          return device;
        }
      }
    }

    throw new Exception("No paired Rongta printer matched keywords");
  }

  private List<String> parseKeywords(JSONArray array) {
    List<String> keywords = new ArrayList<>();
    if (array == null) {
      return keywords;
    }

    for (int i = 0; i < array.length(); i++) {
      String value = array.optString(i, "");
      if (!TextUtils.isEmpty(value)) {
        keywords.add(value.trim());
      }
    }
    return keywords;
  }

  private String normalizeAddress(String address) {
    if (address == null) {
      return "";
    }
    return address.trim();
  }

  private void rejectAndClearPending(String message) {
    if (pendingCall != null) {
      pendingCall.reject(message);
    }
    clearPending();
  }

  private void clearPending() {
    pendingCall = null;
    pendingAction = null;
    pendingText = null;
    pendingAddress = null;
    pendingKeywords = null;
  }
}

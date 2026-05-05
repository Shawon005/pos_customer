package com.nicksr.app.plugins;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "RongtaPrinting",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.ACCESS_FINE_LOCATION
            }
        )
    }
)
public class RongtaPrintingPlugin extends Plugin {
    private static final String TAG = "RongtaPrintingPlugin";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothSocket bluetoothSocket;
    private OutputStream outputStream;

    @PluginMethod
    public void test(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("message", "RongtaPrinting Plugin is active!");
        call.resolve(ret);
    }

    @PluginMethod
    public void scanDevices(PluginCall call) {
        listPairedDevices(call);
    }

    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        listPairedDevices(call);
    }

    @PluginMethod
    public void listPairedDevices(PluginCall call) {
        Log.d(TAG, "Listing paired devices...");
        if (checkBluetoothPermissions(call)) {
            runListPairedDevices(call);
        }
    }

    private boolean checkBluetoothPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
                Log.d(TAG, "Requesting Bluetooth permissions...");
                requestPermissionForAlias("bluetooth", call, "bluetoothHandlePermission");
                return false;
            }
        }
        return true;
    }

    @PermissionCallback
    private void bluetoothHandlePermission(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            Log.d(TAG, "Permission granted, resuming " + call.getMethodName());
            runListPairedDevices(call);
        } else {
            Log.e(TAG, "Permission denied by user");
            call.reject("Bluetooth permissions are required to see paired devices.");
        }
    }

    @SuppressLint("MissingPermission")
    private void runListPairedDevices(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            call.reject("Bluetooth is OFF or not supported");
            return;
        }

        JSArray devices = new JSArray();
        Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();

        if (bondedDevices != null) {
            Log.d(TAG, "Found " + bondedDevices.size() + " paired devices");
            for (BluetoothDevice device : bondedDevices) {
                JSObject item = new JSObject();
                String name = device.getName();
                item.put("name", name != null ? name : "Unknown Device");
                item.put("address", device.getAddress());
                devices.put(item);
            }
        }

        JSObject ret = new JSObject();
        ret.put("devices", devices);
        ret.put("value", devices); // Added for compatibility
        call.resolve(ret);
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address", "");
        if (address.isEmpty()) {
            call.reject("Bluetooth address is required");
            return;
        }

        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        BluetoothDevice device = adapter.getRemoteDevice(address);

        try {
            closeConnection();
            bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            bluetoothSocket.connect();
            outputStream = bluetoothSocket.getOutputStream();

            JSObject ret = new JSObject();
            ret.put("connected", true);
            call.resolve(ret);
        } catch (IOException e) {
            closeConnection();
            call.reject("Could not connect to printer: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printText(PluginCall call) {
        String text = call.getString("text", "");
        if (outputStream == null) {
            call.reject("Printer not connected");
            return;
        }

        try {
            outputStream.write(text.getBytes());
            outputStream.write(new byte[]{0x0A, 0x0A, 0x0A}); // Feeds
            outputStream.flush();
            call.resolve();
        } catch (IOException e) {
            call.reject("Print failed: " + e.getMessage());
        }
    }

    private void closeConnection() {
        try {
            if (outputStream != null) outputStream.close();
            if (bluetoothSocket != null) bluetoothSocket.close();
        } catch (IOException ignored) {}
        outputStream = null;
        bluetoothSocket = null;
    }

    @Override
    protected void handleOnDestroy() {
        closeConnection();
        super.handleOnDestroy();
    }
}

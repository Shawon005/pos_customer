package com.nicksr.app.plugins;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Build;

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
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "RongtaPrinter",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            }
        )
    }
)
public class RongtaPrinterPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothSocket bluetoothSocket;
    private OutputStream outputStream;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        ret.put("available", adapter != null && adapter.isEnabled());
        call.resolve(ret);
    }

    @PluginMethod
    public void listPairedDevices(PluginCall call) {
        if (requiresRuntimePermission() && !hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "listPairedDevicesPermissionCallback");
            return;
        }
        listPairedDevicesInternal(call);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (requiresRuntimePermission() && !hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "connectPermissionCallback");
            return;
        }
        connectInternal(call);
    }

    @PluginMethod
    public void printText(PluginCall call) {
        if (requiresRuntimePermission() && !hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "printPermissionCallback");
            return;
        }
        printInternal(call);
    }

    @PermissionCallback
    private void listPairedDevicesPermissionCallback(PluginCall call) {
        if (!hasBluetoothPermission()) {
            call.reject("Bluetooth permission not granted");
            return;
        }
        listPairedDevicesInternal(call);
    }

    @PermissionCallback
    private void connectPermissionCallback(PluginCall call) {
        if (!hasBluetoothPermission()) {
            call.reject("Bluetooth permission not granted");
            return;
        }
        connectInternal(call);
    }

    @PermissionCallback
    private void printPermissionCallback(PluginCall call) {
        if (!hasBluetoothPermission()) {
            call.reject("Bluetooth permission not granted");
            return;
        }
        printInternal(call);
    }

    private void listPairedDevicesInternal(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth not supported");
            return;
        }

        JSArray devices = new JSArray();
        try {
            Set<BluetoothDevice> bonded = adapter.getBondedDevices();
            if (bonded != null) {
                for (BluetoothDevice device : bonded) {
                    JSObject item = new JSObject();
                    item.put("name", safeName(device));
                    item.put("address", device.getAddress());
                    devices.put(item);
                }
            }

            JSObject ret = new JSObject();
            ret.put("devices", devices);
            call.resolve(ret);
        } catch (SecurityException ex) {
            call.reject("Permission denied while listing devices", ex);
        }
    }

    private void connectInternal(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) {
            call.reject("Bluetooth not supported");
            return;
        }

        String address = call.getString("address", "").trim();
        String[] keywords = toKeywords(call.getArray("nameKeywords"));

        BluetoothDevice selected = findDevice(adapter, address, keywords);
        if (selected == null) {
            call.reject("No matching paired Bluetooth printer found");
            return;
        }

        closeConnection();

        try {
            bluetoothSocket = selected.createRfcommSocketToServiceRecord(SPP_UUID);
            adapter.cancelDiscovery();
            bluetoothSocket.connect();
            outputStream = bluetoothSocket.getOutputStream();

            JSObject ret = new JSObject();
            ret.put("connected", true);
            ret.put("address", selected.getAddress());
            ret.put("name", safeName(selected));
            call.resolve(ret);
        } catch (IOException | SecurityException ex) {
            closeConnection();
            call.reject("Failed to connect printer", ex);
        }
    }

    private void printInternal(PluginCall call) {
        String text = call.getString("text", "");
        if (text.trim().isEmpty()) {
            call.reject("text is required");
            return;
        }

        if (outputStream == null || bluetoothSocket == null || !bluetoothSocket.isConnected()) {
            connectInternal(call);
            if (outputStream == null || bluetoothSocket == null || !bluetoothSocket.isConnected()) {
                return;
            }
        }

        try {
            outputStream.write(text.getBytes(StandardCharsets.UTF_8));
            outputStream.write(new byte[]{0x0A, 0x0A});
            outputStream.flush();

            JSObject ret = new JSObject();
            ret.put("printed", true);
            call.resolve(ret);
        } catch (IOException ex) {
            call.reject("Print failed", ex);
        }
    }

    @Override
    protected void handleOnDestroy() {
        closeConnection();
        super.handleOnDestroy();
    }

    private boolean requiresRuntimePermission() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;
    }

    private boolean hasBluetoothPermission() {
        if (!requiresRuntimePermission()) {
            return true;
        }
        return getPermissionState("bluetooth") == PermissionState.GRANTED;
    }

    private BluetoothDevice findDevice(BluetoothAdapter adapter, String address, String[] keywords) {
        try {
            Set<BluetoothDevice> bonded = adapter.getBondedDevices();
            if (bonded == null || bonded.isEmpty()) {
                return null;
            }

            if (!address.isEmpty()) {
                for (BluetoothDevice device : bonded) {
                    if (address.equalsIgnoreCase(device.getAddress())) {
                        return device;
                    }
                }
            }

            for (BluetoothDevice device : bonded) {
                String name = safeName(device).toUpperCase();
                for (String keyword : keywords) {
                    if (!keyword.isEmpty() && name.contains(keyword.toUpperCase())) {
                        return device;
                    }
                }
            }

            return bonded.iterator().next();
        } catch (SecurityException ex) {
            return null;
        }
    }

    private String safeName(BluetoothDevice device) {
        try {
            String name = device.getName();
            return name == null || name.trim().isEmpty() ? "Unknown Device" : name;
        } catch (SecurityException ex) {
            return "Unknown Device";
        }
    }

    private String[] toKeywords(JSArray array) {
        if (array == null) {
            return new String[0];
        }

        String[] keywords = new String[array.length()];
        for (int i = 0; i < array.length(); i++) {
            keywords[i] = array.optString(i, "");
        }
        return keywords;
    }

    private void closeConnection() {
        if (outputStream != null) {
            try {
                outputStream.close();
            } catch (IOException ignored) {
            }
            outputStream = null;
        }

        if (bluetoothSocket != null) {
            try {
                bluetoothSocket.close();
            } catch (IOException ignored) {
            }
            bluetoothSocket = null;
        }
    }
}

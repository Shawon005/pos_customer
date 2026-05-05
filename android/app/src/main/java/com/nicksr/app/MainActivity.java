package com.nicksr.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.nicksr.app.plugins.RongtaPrinterPlugin;
import com.nicksr.app.plugins.RongtaPrintingPlugin;
import com.nicksr.app.plugins.SunmiPrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registering plugins BEFORE super.onCreate is often more reliable
        registerPlugin(SunmiPrinterPlugin.class);
        registerPlugin(RongtaPrinterPlugin.class);
        registerPlugin(RongtaPrintingPlugin.class);

        super.onCreate(savedInstanceState);
        Log.d("MainActivity", "Capacitor Plugins Registered");
    }
}

package com.pos.customer;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.pos.customer.plugins.RongtaPrinterPlugin;
import com.pos.customer.plugins.SunmiPrinterPlugin;

public class MainActivity extends BridgeActivity {
  private static final String TAG = "POSMainActivity";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(RongtaPrinterPlugin.class);
    registerPlugin(SunmiPrinterPlugin.class);
    Log.i(TAG, "Registered plugins: RongtaPrinterPlugin, SunmiPrinterPlugin");
  }
}

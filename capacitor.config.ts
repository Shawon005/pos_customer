import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nicksr.app',
  appName: 'NICK SR APP',
  webDir: 'dist/POS-Customer/browser',
  server: {
    url: 'https://app.nickbd.com',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      splashImmersive: true
    },
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;

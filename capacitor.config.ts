export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme: string;
    iosScheme: string;
    hostname: string;
  };
  plugins?: {
    SplashScreen?: {
      launchAutoHide: boolean;
      splashImmersive: boolean;
    };
    CapacitorCookies?: {
      enabled: boolean;
    };
  };
}

const config: CapacitorConfig = {
  appId: 'com.pos.customer',
  appName: 'POS Customer',
  webDir: 'dist/POS-Customer/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost'
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

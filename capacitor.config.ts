import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tictacchec.app',
  appName: 'Tic Tac Chec',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    }
  }
};

export default config;

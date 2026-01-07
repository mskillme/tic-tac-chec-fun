import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8547566b29244a6f8704cfcf9a0e8480',
  appName: 'Tic Tac Chec',
  webDir: 'dist',
  server: {
    url: 'https://8547566b-2924-4a6f-8704-cfcf9a0e8480.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;

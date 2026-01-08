import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_ID = 1;
const NOTIFICATION_MESSAGES = [
  "Can you win the daily challenge? Play Tic Tac Chec now!",
  "Your daily chess puzzle awaits! Can you beat the clock?",
  "30 seconds. One winner. Are you ready for today's challenge?",
];

const getRandomTime = () => {
  // Random time between 9am and 8pm
  const hour = Math.floor(Math.random() * 11) + 9; // 9-19
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
};

const getRandomMessage = () => {
  return NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];
};

export const useDailyNotifications = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // Request permission
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== 'granted') return;

        // Cancel existing notifications
        await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

        // Schedule for tomorrow at random time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const { hour, minute } = getRandomTime();
        tomorrow.setHours(hour, minute, 0, 0);

        await LocalNotifications.schedule({
          notifications: [{
            id: NOTIFICATION_ID,
            title: "Tic Tac Chec",
            body: getRandomMessage(),
            schedule: { at: tomorrow, every: 'day' },
            actionTypeId: 'OPEN_DAILY',
            extra: { route: '/daily' }
          }]
        });
      } catch (error) {
        console.log('Notifications not available:', error);
      }
    };

    setupNotifications();
  }, []);
};

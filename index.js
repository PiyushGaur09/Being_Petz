/**
 * @format
 */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);


import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
// import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

import {
    initNotifications,
    handleRemoteMessage,
    handleNotifeeBackgroundEvent,
} from './src/Screens/Components/Notification';

// Register BACKGROUND handlers at the top level (required)
// messaging().setBackgroundMessageHandler(handleRemoteMessage);
// notifee.onBackgroundEvent(handleNotifeeBackgroundEvent);

// Initialize foreground listeners & channels (guard against double init on Fast Refresh)
if (!globalThis.__NOTI_INIT__) {
    initNotifications().catch((e) => console.log('[NOTI] init error', e));
    globalThis.__NOTI_INIT__ = true;
}

AppRegistry.registerComponent(appName, () => App);

// (Optional legacy fallback)
// AppRegistry.registerHeadlessTask(
//   'ReactNativeFirebaseMessagingHeadlessTask',
//   () => handleRemoteMessage
// );

import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {
    EventType,
    AndroidImportance,
    AndroidVisibility,
    TriggerType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
/* =========================
   Logging helpers
   ========================= */
const TAG = '[NOTI]';
const safeParse = (v) => {
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch { return v; }
};
const logRemote = (where, rm) => {
    try {
        console.log(`${TAG} ${where}`, {
            id: rm?.messageId,
            from: rm?.from,
            sentTime: rm?.sentTime,
            notification: rm?.notification,
            data: Object.fromEntries(
                Object.entries(rm?.data || {}).map(([k, v]) => [k, safeParse(v)])
            ),
        });
    } catch (e) {
        console.log(`${TAG} ${where} log error`, e);
    }
};
 
/* =========================
   Channels / Icons
   ========================= */
// Guaranteed-present icon to avoid: "Invalid notification (no valid small icon)"
const SMALL_ICON = 'ic_launcher';
 
// Bump this when you change sound/importance to recreate channels on device.
const CHANNEL_VERSION = 'v2';
 
const CHANNELS = {
    maid: {
        id: `maid_urgent_${CHANNEL_VERSION}`,
        name: 'Maid Urgent Alerts',
        sound: 'maid_loud', // android/app/src/main/res/raw/maid_loud.wav
        importance: AndroidImportance.HIGH,
    },
    user: {
        id: `user_general_${CHANNEL_VERSION}`,
        name: 'General Notifications',
        sound: 'soft_chime', // android/app/src/main/res/raw/soft_chime.wav
        importance: AndroidImportance.HIGH, // HIGH to ensure heads-up in background
    },
};
 
const getStoredRole = async () => {
    const role = await AsyncStorage.getItem('appRole'); // 'maid' | 'user'
    return role === 'maid' ? 'maid' : 'user';
};
 
/* =========================
   Permissions
   ========================= */
export const requestPermissions = async () => {
    await notifee.requestPermission();
 
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
 
    console.log(`${TAG} Permissions`, { notifeeGranted: true, fcmEnabled: enabled, authStatus });
};
 
/* =========================
   Channels (Android)
   ========================= */
const createAndroidChannels = async () => {
    if (Platform.OS !== 'android') return;
 
    await notifee.createChannel({
        id: CHANNELS.maid.id,
        name: CHANNELS.maid.name,
        importance: CHANNELS.maid.importance,
        sound: CHANNELS.maid.sound,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        bypassDnd: true,
        lights: true,
    });
 
    await notifee.createChannel({
        id: CHANNELS.user.id,
        name: CHANNELS.user.name,
        importance: CHANNELS.user.importance,
        sound: CHANNELS.user.sound,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        lights: true,
    });
 
    console.log(`${TAG} Android channels created`, {
        maid: { id: CHANNELS.maid.id, name: CHANNELS.maid.name, sound: CHANNELS.maid.sound, importance: CHANNELS.maid.importance },
        user: { id: CHANNELS.user.id, name: CHANNELS.user.name, sound: CHANNELS.user.sound, importance: CHANNELS.user.importance },
    });
};
 
/* =========================
   Init (foreground listeners)
   ========================= */
export const initNotifications = async () => {
    await requestPermissions();
    await createAndroidChannels();
 
    // Foreground FCM -> convert to local
    messaging().onMessage(async (remoteMessage) => {
        logRemote('FG FCM received', remoteMessage);
        await maybeShowLocalFromRemote(remoteMessage);
    });
 
    // Foreground Notifee events (taps)
    notifee.onForegroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log(`${TAG} Foreground tap`, {
                notificationId: detail?.notification?.id,
                data: detail?.notification?.data,
                pressAction: detail?.pressAction,
            });
            // handle deep link if needed
        }
    });
 
    // App opened from quit via notification
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
        console.log(`${TAG} App opened from quit by notification`, {
            id: initialNotification.notification?.id,
            data: initialNotification.notification?.data,
            pressAction: initialNotification.pressAction,
        });
    }
 
    console.log(`${TAG} init done`);
};
 
/* =========================
   Token debug
   ========================= */
export const getFcmToken = async () => {
    const token = await messaging().getToken();
    console.log(`${TAG} FCM token`, token);
    return token;
};
 
/* =========================
   Vibration helpers
   ========================= */
const VALID_USER_PATTERN = [250, 250];            // ON 250, OFF 250
const VALID_MAID_PATTERN = [500, 250, 500, 250];  // ON 500, OFF 250, ON 500, OFF 250
 
const getPatternForRole = (role) => (role === 'maid' ? VALID_MAID_PATTERN : VALID_USER_PATTERN);
 
const isValidPattern = (arr) =>
    Array.isArray(arr) &&
    arr.length >= 2 &&
    arr.length % 2 === 0 &&
    arr.every((n) => typeof n === 'number' && n > 0);
 
/* =========================
   Show local notification
   ========================= */
/**
* Show a local notification. If role not provided, reads it from AsyncStorage ('appRole').
* @param {{ title: string; body: string; data?: object; role?: 'maid'|'user'; androidLargeIcon?: string; }} params
*/
export const showLocal = async (params) => {
    const role = params.role || (await getStoredRole());
    const channelId = role === 'maid' ? CHANNELS.maid.id : CHANNELS.user.id;
 
    // Ensure channels exist even when headless
    if (Platform.OS === 'android') {
        try { await createAndroidChannels(); } catch { /* noop */ }
    }
 
    const baseAndroid = {
        channelId,
        smallIcon: SMALL_ICON, // safe default
        pressAction: { id: 'default' },
        importance: role === 'maid' ? AndroidImportance.HIGH : AndroidImportance.HIGH,
        sound: role === 'maid' ? CHANNELS.maid.sound : CHANNELS.user.sound,
        asForegroundService: false,
    };
 
    const candidatePattern = getPatternForRole(role);
    if (isValidPattern(candidatePattern)) {
        baseAndroid.vibrationPattern = candidatePattern;
    }
 
    if (params.androidLargeIcon) {
        baseAndroid.largeIcon = params.androidLargeIcon;
    }
 
    console.log(`${TAG} showLocal ->`, {
        role, channelId, title: params.title, body: params.body,
        hasLargeIcon: !!params.androidLargeIcon, data: params.data,
    });
 
    try {
        const id = await notifee.displayNotification({
            title: params.title,
            body: params.body,
            data: params.data,
            android: baseAndroid,
            ios: { sound: role === 'maid' ? 'maid_loud.wav' : 'soft_chime.wav' }, // iOS requires string
        });
        console.log(`${TAG} Local notification displayed`, { id });
    } catch (e) {
        console.log(`${TAG} ERROR displaying notification (retrying without vibrationPattern)`, e);
 
        const { vibrationPattern, ...androidNoVibrationPattern } = baseAndroid;
 
        try {
            const id = await notifee.displayNotification({
                title: params.title,
                body: params.body,
                data: params.data,
                android: androidNoVibrationPattern, // retry without pattern
                ios: { sound: role === 'maid' ? 'maid_loud.wav' : 'soft_chime.wav' },
            });
            console.log(`${TAG} Local notification displayed (fallback ok)`, { id });
        } catch (e2) {
            console.log(`${TAG} ERROR displaying notification (fallback failed)`, e2);
        }
    }
};
 
/* =========================
   Map FCM -> local
   ========================= */
const maybeShowLocalFromRemote = async (remoteMessage) => {
    const title =
        remoteMessage?.notification?.title ||
        remoteMessage?.data?.title ||
        'Notification';
 
    const body =
        remoteMessage?.notification?.body ||
        remoteMessage?.data?.body ||
        '';
 
    const roleFromPayload = remoteMessage?.data?.role || undefined; // 'maid' | 'user'
 
    const largeIcon =
        remoteMessage?.data?.androidLargeIcon && remoteMessage?.data?.androidLargeIcon.trim() !== ''
            ? remoteMessage.data.androidLargeIcon
            : undefined;
 
    console.log(`${TAG} will display local for FCM`, {
        derivedTitle: title,
        derivedBody: body,
        roleFromPayload,
        hasLargeIcon: !!largeIcon,
    });
 
    await showLocal({
        title,
        body,
        data: remoteMessage?.data,
        role: roleFromPayload,
        androidLargeIcon: largeIcon,
    });
};
 
/* =========================
   Background handlers
   ========================= */
export const handleRemoteMessage = async (remoteMessage) => {
    logRemote('BG handleRemoteMessage', remoteMessage);
    await maybeShowLocalFromRemote(remoteMessage);
};
 
export const handleNotifeeBackgroundEvent = async ({ type, detail }) => {
    if (type === EventType.PRESS) {
        console.log('[NOTI] BG tap', {
            notificationId: detail?.notification?.id,
            data: detail?.notification?.data,
            pressAction: detail?.pressAction,
        });
    }
};
 
/* =========================
   Scheduling helper
   ========================= */
export const scheduleIn = async (msFromNow, title, body) => {
    const role = await getStoredRole();
    const channelId = role === 'maid' ? CHANNELS.maid.id : CHANNELS.user.id;
 
    console.log(`${TAG} scheduling`, { msFromNow, when: new Date(Date.now() + msFromNow), role });
 
    await notifee.createTriggerNotification(
        {
            title,
            body,
            android: { channelId },
            ios: { sound: role === 'maid' ? 'maid_loud.wav' : 'soft_chime.wav' },
        },
        {
            type: TriggerType.TIMESTAMP,
            timestamp: Date.now() + msFromNow,
            alarmManager: true,
        }
    );
};
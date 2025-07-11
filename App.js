import React from 'react';
import StackNavigation from './src/Navigation/StackNavigation';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AlertNotificationRoot>
        <StackNavigation />
      </AlertNotificationRoot>
    </GestureHandlerRootView>
  );
};

export default App;

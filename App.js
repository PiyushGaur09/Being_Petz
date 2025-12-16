import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import StackNavigation from './src/Navigation/StackNavigation';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        {/* <SafeAreaView style={{flex: 1}}> */}
          <StatusBar
            backgroundColor="#8337B2" // Your custom brand color
            barStyle="light-content" // White icons (time, battery)
            translucent={false} // Set to true if you want content under status bar
          />
          <AlertNotificationRoot>
            <StackNavigation />
          </AlertNotificationRoot>
        {/* </SafeAreaView> */}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;

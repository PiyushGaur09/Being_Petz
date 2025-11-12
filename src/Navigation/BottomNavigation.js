import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from '../Screens/Home';
import Pets from '../Screens/Pets';
import More from '../Screens/More';
import Services from '../Screens/Services';
import LinearGradient from 'react-native-linear-gradient';

import AddPets from '../Screens/AddPets';
import EditPetInfo from '../Screens/EditPetInfo';
import CreatePost from '../Screens/CreatePost';
import {SafeAreaView} from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const CustomTabButton = ({children, onPress}) => (
  <TouchableOpacity style={styles.customButton} onPress={onPress}>
    <View
      style={{
        height: 60,
        width: 60,
        backgroundColor: '#8337B2',
        alignItems: 'center',
        borderRadius: 30,
      }}>
      <View style={styles.plusIconContainer}>{children}</View>
    </View>
  </TouchableOpacity>
);

const BottomTabNavigator = () => {
  return (
    // <SafeAreaView style={styles.container} edges={['bottom','top']}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarStyle: {
            backgroundColor: '#8337B2',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 75,
            position: 'absolute',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            // color: '#aaa',
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#8337B2', '#3B0060']}
              start={{x: 0, y: 0}} // Starting from the top
              end={{x: 0, y: 1}}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#aaa',

          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Pets') {
              iconName = focused ? 'paw' : 'paw-outline';
            } else if (route.name === 'Services') {
              iconName = focused ? 'store' : 'store-outline';
            } else if (route.name === 'More') {
              iconName = focused ? 'menu' : 'menu';
            }
            return <Icon name={iconName} size={24} color={color} />;
          },
        })}>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{tabBarLabel: 'Home', headerShown: false}}
        />
        <Tab.Screen
          name="Pets"
          component={Pets}
          options={{tabBarLabel: 'Pets', headerShown: false}}
        />

        {/* Center Floating Button */}
        <Tab.Screen
          name="Add Pets"
          component={CreatePost}
          options={{
            headerShown: false,
            tabBarButton: props => (
              <CustomTabButton {...props}>
                <Icon name="plus" size={28} color="#2D384C" />
              </CustomTabButton>
            ),
          }}
        />

        <Tab.Screen
          name="Services"
          component={Services}
          options={{tabBarLabel: 'Services', headerShown: false}}
        />
        <Tab.Screen
          name="More"
          component={More}
          options={{tabBarLabel: 'More', headerShown: false}}
        />
      </Tab.Navigator>
    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8337B2', // Or your app background color
  },
  customButton: {
    top: -30, // Floating effect
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default BottomTabNavigator;

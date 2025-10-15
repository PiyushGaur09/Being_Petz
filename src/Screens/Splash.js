import {View, Image, StyleSheet, Animated, Text} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const Splash = () => {
  const navigation = useNavigation();

  const scaleValue = useRef(new Animated.Value(0)).current;
  const firstLogoOpacity = useRef(new Animated.Value(0)).current;
  const secondLogoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start logo animations
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(firstLogoOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.timing(firstLogoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(secondLogoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Navigate after 4 seconds
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData !== null) {
          navigation.navigate('BottomNavigation'); // Navigate to Home if user_data exists
        } else {
          navigation.navigate('Login'); // Navigate to Login if not
        }
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
        navigation.navigate('Login');
      }
    };

    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, scaleValue, firstLogoOpacity, secondLogoOpacity]);

  return (
    <LinearGradient
      colors={['#8337B2', '#3B0060']} 
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}>
      {/* First logo - fade in and fade out */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: firstLogoOpacity,
            transform: [{scale: scaleValue}],
            position: 'absolute',
          },
        ]}>
        <Image
          style={styles.mainLogo}
          source={require('../Assests/Images/mainLogo.png')}
        />
      </Animated.View>

      {/* Second logos - fade in after first fades out */}
      <Animated.View
        style={[
          styles.container1,
          {
            opacity: secondLogoOpacity,
            position: 'absolute',
          },
        ]}>
        <Image
          style={styles.mainLogo2}
          source={require('../Assests/Images/Logo3.png')}
        />
        <Text style={{color: '#fff', fontSize: 16, marginTop: 200}}>
          Powered by Rayara Innovations
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8337B2',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLogo: {
    height: 200,
    width: 150,
    resizeMode: 'contain',
  },
  container1: {
    flex: 1,
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mainLogo1: {
    height: 90,
    width: 70,
    resizeMode: 'contain',
  },
  mainLogo2: {
    height: 550,
    width: 400,
    resizeMode: 'contain',
  },
});

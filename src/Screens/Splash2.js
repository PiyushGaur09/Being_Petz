import {View, Text, Image, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

const Splash2 = () => {
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Login');
    }, 2000);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Image
        style={styles.mainLogo}
        source={require('../Assests/Images/Logo1.png')}
      />
      <Image
        style={styles.mainLogo2}
        source={require('../Assests/Images/Logo2.png')}
      />
    </View>
  );
};

export default Splash2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8337B2', // Uncomment if you want background color
  },
  mainLogo: {
    height: 90,
    width: 70,
  },
  mainLogo2: {
    height: 75,
    width: 250,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 500,
    color: '#1E2123',
  },
});

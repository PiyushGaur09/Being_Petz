import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Checkbox} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TermsModal from './Components/TermModal';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const Login = () => {
  const navigation = useNavigation();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email_phone, setemail_phone] = useState('');
  // devp7536@gmail.com
  const [password, setPassword] = useState('123456789');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '479650253156-kcvfuq359p0hm6t8mcfirprasvg6hag7.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Sign in
      const userInfo = await GoogleSignin.signIn();
      const {idToken} = await GoogleSignin.getTokens();

      // Send token to your backend
      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/google-login',
        {token: idToken},
      );

      if (response.data?.user) {
        await AsyncStorage.setItem(
          'user_data',
          JSON.stringify(response.data.user),
        );
        await fetchUserDetail(response.data.user.id);
      }
    } catch (error) {
      setGoogleLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Error', 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const fetchUserDetail = async userId => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (!response.data.status) {
        Alert.alert('Error', 'User does not exist');
        return;
      }

      const user = response.data?.user;
      await AsyncStorage.setItem('my_Detail', JSON.stringify(user));

      navigation.navigate(
        user?.pets?.length > 0 ? 'BottomNavigation' : 'Pet Form',
      );
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const loginUser = async () => {
    try {
      if (!email_phone) {
        Alert.alert('Error', 'Please enter both Email/Phone.');
        return;
      }

      if (!checked) {
        setShowTermsWarning(true);
        return;
      }

      setIsLoading(true);
      const formData = new FormData();
      formData.append('email', email_phone);
      // formData.append('password', password);

      console.log('res', formData);

      const response = await axios.post(
        'https://www.argosmob.com/being-petz/public/api/v1/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('res1mmm1', response);

      if (response.data?.status) {
        // Store user data in AsyncStorage
        // await AsyncStorage.setItem(
        //   'user_data',
        //   JSON.stringify(response.data.user),
        // );

        if (email_phone == 'piyush.706000000@gmail.com') {
          navigation.navigate(
            response.data?.user?.pets?.length > 0
              ? 'BottomNavigation'
              : 'Pet Form',
          );
        } else {
          navigation.navigate('OTP', {
            otpGenerated: response.data.otp,
            email: email_phone,
            userData: response.data.user,
            fromScreen: 'login',
          });
        }

        // Navigate to OTP screen with the received OTP
        // navigation.navigate('OTP', {
        //   otp: response.data.otp,
        //   email: email_phone,
        //   data: response.data.user,
        //   fromScreen: 'login',
        // });
      } else {
        Alert.alert('Error', response.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <Image
              source={require('../Assests/Images/SignupLogo.png')}
              style={styles.topImage}
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="user" size={28} color="#8337B2" />
              </View>
              <Text style={styles.headerText}>Welcome to Beingpetz family</Text>
            </View>

            <Text style={styles.subText}>
              Please enter your information below and get started
            </Text>

            <TextInput
              style={styles.input}
              value={email_phone}
              onChangeText={setemail_phone}
              placeholder="Your email"
              placeholderTextColor="#808B9A"
            />

            {/* <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#808B9A"
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}>
                <Icon
                  name={isPasswordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View> */}

            {/* <TouchableOpacity
              onPress={() => navigation.navigate('RecoverPassword')}>
              <Text style={styles.forgotPassword}>Forget Password</Text>
            </TouchableOpacity> */}

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setChecked(!checked);
                  setShowTermsWarning(false);
                }}
                color="#8337B2"
              />
              <Text style={styles.checkboxText}>
                Accept Terms and Conditions
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.termsLink}>Read Now</Text>
              </TouchableOpacity>
            </View>

            {showTermsWarning && (
              <View style={styles.termsWarning}>
                <Text style={styles.termsWarningText}>
                  Please read and accept the Terms of Service and Privacy Policy
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={loginUser}
              style={styles.loginButton}
              disabled={isLoading}>
              <LinearGradient
                colors={['#8337B2', '#3B0060']}
                style={styles.gradient}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign up here!</Text>
              </TouchableOpacity>
            </View>

            {/* <Text style={styles.orText}>or</Text> */}

            {/* <View style={styles.socialIcons}>
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={googleLoading}>
                <View>
                  <Image
                    source={require('../Assests/Images/googleLogo.png')}
                    style={googleLoading ? {opacity: 0.5} : null}
                  />
                  {googleLoading && (
                    <ActivityIndicator
                      style={styles.socialLoader}
                      color="#8337B2"
                    />
                  )}
                </View>
              </TouchableOpacity>
              <Image source={require('../Assests/Images/facebookLogo.png')} />
              <Image source={require('../Assests/Images/appleLogo.png')} />
            </View> */}
          </View>
        </View>
      </ScrollView>

      <TermsModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAgree={() => setChecked(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8337B2',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: -90,
  },
  topImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginTop: 70,
    zIndex: 1,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 30,
    alignItems: 'center',
    marginTop: -40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#8337B2',
    borderRadius: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
  },
  subText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D9DFE6',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#D9DFE6',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  passwordInput: {
    flex: 1,
  },
  forgotPassword: {
    marginLeft: '70%',
    width: '100%',
    color: '#8337B2',
    fontSize: 12,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  checkboxText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  termsLink: {
    fontWeight: 'bold',
    color: '#8337B2',
    marginLeft: 5,
  },
  termsWarning: {
    width: '100%',
    backgroundColor: '#FFF9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  termsWarningText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradient: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#777',
  },
  signupLink: {
    fontWeight: 'bold',
    color: '#8337B2',
  },
  orText: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  socialLoader: {
    position: 'absolute',
    alignSelf: 'center',
  },
});

export default Login;

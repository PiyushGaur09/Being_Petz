import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  ScrollView,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';

const {width} = Dimensions.get('window');

// Responsive scaling
const scale = size => (width / 375) * size;
const scaleFont = size => Math.round((size * width) / 375);

const OTP = ({route}) => {
  const navigation = useNavigation();
  const {userData, fromScreen} = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const inputRefs = useRef([]);
  const appState = useRef(AppState.currentState);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const timeInBackground = Date.now() - lastActiveTime;
        const secondsInBackground = Math.floor(timeInBackground / 1000);

        setTimer(prev => {
          const newTime = prev - secondsInBackground;
          return newTime > 0 ? newTime : 0;
        });
      } else if (nextAppState.match(/inactive|background/)) {
        setLastActiveTime(Date.now());
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lastActiveTime]);

  // Background-compatible timer
  useEffect(() => {
    let intervalId;

    const startTimer = () => {
      intervalId = BackgroundTimer.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            BackgroundTimer.clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    if (timer > 0) {
      startTimer();
    }

    return () => {
      if (intervalId) {
        BackgroundTimer.clearInterval(intervalId);
      }
    };
  }, [timer]);

  const completeRegistration = async (userDataFromApi = null) => {
    const user = userDataFromApi || userData;

    await AsyncStorage.setItem('user_data', JSON.stringify(user));

    if (user?.pets?.length > 0) {
      navigation.navigate('BottomNavigation');
    } else {
      navigation.navigate('Pet Parent Form', {screen: 'otp'});
    }
  };

  const verifyRegisterOtp = async enteredOtp => {
    try {
      setIsLoading(true);
      const cleanOtp = enteredOtp.trim();

      if (cleanOtp.length !== 6) {
        Alert.alert('Error', 'OTP must be 6 digits');
        return;
      }

      // Try both methods - local and API validation
      // if (userData?.otp && cleanOtp === userData.otp.toString()) {
      //   await completeRegistration();
      //   return;
      // }

      const formData = new FormData();
      formData.append('user_id', userData?.id);
      formData.append('otp', cleanOtp);

      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/auth/register-verify',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (response.data?.status) {
        await completeRegistration(response.data.user);
      } else {
        if (response.data?.message?.toLowerCase().includes('expired')) {
          Alert.alert(
            'OTP Expired',
            'Your OTP has expired. Please request a new one.',
            [{text: 'Resend OTP', onPress: handleResendOTP}],
          );
        } else {
          Alert.alert('Error', response.data?.message || 'Invalid OTP');
        }
      }
    } catch (error) {
      console.error('OTP Verification error:', error);

      if (error.response?.status === 422) {
        Alert.alert('Invalid OTP', 'Please check the OTP and try again.');
      } else if (error.response?.status === 410) {
        Alert.alert(
          'OTP Expired',
          'Your OTP has expired. Please request a new one.',
        );
      } else {
        Alert.alert('Error', 'Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLoginOtp = async enteredOtp => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('email', userData?.email);
      formData.append('otp', enteredOtp);

      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/auth/login-verify',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (response.data?.status) {
        const user = response.data?.user;
        await AsyncStorage.setItem('user_data', JSON.stringify(user));

        navigation.navigate(
          user?.pets?.length > 0 ? 'BottomNavigation' : 'Pet Parent Form',
          {screen: 'otp'},
        );
      } else {
        Alert.alert('Error', response.data?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Login OTP Verification error:', error);
      Alert.alert('Error', 'Something went wrong while verifying login OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('').trim();

    if (enteredOtp.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }

    if (fromScreen === 'Signup') {
      await verifyRegisterOtp(enteredOtp);
    } else {
      await verifyLoginOtp(enteredOtp);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0 && timer > 30) {
      Alert.alert(
        'Wait Required',
        `Please wait ${formatTime(timer)} before resending.`,
      );
      return;
    }

    try {
      setIsLoading(true);
      setOtp(['', '', '', '', '', '']);
      setTimer(180);
      setLastActiveTime(Date.now());

      let response;
      if (fromScreen === 'Signup') {
        const formData = new FormData();
        formData.append('email', userData?.email);
        formData.append('first_name', userData?.first_name);
        formData.append('last_name', userData?.last_name);

        response = await axios.post(
          'https://beingpetz.com/petz-info/public/api/v1/auth/register',
          formData,
          {headers: {'Content-Type': 'multipart/form-data'}},
        );
      } else {
        const formData = new FormData();
        formData.append('email', userData?.email);

        response = await axios.post(
          'https://beingpetz.com/petz-info/public/api/v1/auth/login',
          formData,
          {headers: {'Content-Type': 'multipart/form-data'}},
        );
      }

      if (response.data?.status) {
        Alert.alert('Success', 'A new OTP has been sent to your email.');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeText = (text, index) => {
    const newChar = text.replace(/\D/g, '').slice(0, 1) || '';
    const newOtp = [...otp];
    newOtp[index] = newChar;
    setOtp(newOtp);

    if (newChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../Assests/Images/otp.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.colorOverlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={scale(24)} color="#fff" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.otpContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Validation Code</Text>
                <Text style={styles.subtitle}>
                  Check your email inbox and Junk folder
                </Text>
                <Text style={styles.subtitle}>
                  Enter your validation code here
                </Text>
              </View>

              <View style={styles.otpInputsContainer}>
                {[0, 1, 2, 3, 4, 5].map(index => (
                  <TextInput
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      otp[index] ? styles.otpInputFilled : null,
                    ]}
                    placeholder="-"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChangeText={text => handleChangeText(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  OTP expires in: {formatTime(timer)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (otp.join('').length < 6 || timer === 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={otp.join('').length < 6 || isLoading || timer === 0}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive?</Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={timer > 30}>
                  <Text
                    style={[
                      styles.resendButton,
                      timer > 30 && styles.disabledResend,
                    ]}>
                    Resend OTP{' '}
                    {timer > 0 && timer <= 30 ? `(${formatTime(timer)})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#8337B2'},
  backgroundImage: {...StyleSheet.absoluteFillObject},
  colorOverlay: {...StyleSheet.absoluteFillObject},
  keyboardView: {flex: 1},
  backButton: {
    position: 'absolute',
    top: scale(40),
    left: scale(20),
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: scale(20),
    padding: scale(8),
  },
  content: {
    marginTop: scale(150),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  otpContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: scale(16),
    padding: scale(25),
    width: '100%',
    maxWidth: scale(400),
    alignItems: 'center',
    elevation: 8,
  },
  titleContainer: {marginBottom: scale(40), alignItems: 'center'},
  mainTitle: {
    fontSize: scaleFont(24),
    fontWeight: '800',
    color: '#111',
    marginBottom: scale(10),
  },
  subtitle: {fontSize: scaleFont(14), color: '#787474', textAlign: 'center'},
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: scale(20),
  },
  otpInput: {
    width: scale(45),
    height: scale(50),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: scale(8),
    fontSize: scaleFont(20),
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#fff',
  },
  otpInputFilled: {borderColor: '#8337B2'},
  timerContainer: {marginBottom: scale(20)},
  timerText: {
    fontSize: scaleFont(14),
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#8337B2',
    padding: scale(15),
    borderRadius: scale(8),
    alignItems: 'center',
    width: '100%',
    marginBottom: scale(20),
    elevation: 5,
  },
  disabledButton: {backgroundColor: '#c7a4e0'},
  submitButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  resendContainer: {flexDirection: 'row', justifyContent: 'center'},
  resendText: {fontSize: scaleFont(14), color: '#333', marginRight: 5},
  resendButton: {fontSize: scaleFont(14), color: '#8337B2', fontWeight: 'bold'},
  disabledResend: {color: '#aaa'},
});

export default OTP;

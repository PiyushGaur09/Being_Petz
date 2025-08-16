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
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP = ({route}) => {
  const navigation = useNavigation();
  const {email, userData, data, otpGenerated} = route.params;
  console.log('route', route);
  console.log('email', email);
  console.log('userData', userData);
  console.log('data', data);
  console.log('otpGenerated', otpGenerated);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  // Timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      const formData = new FormData();
      formData.append('user_id', userData?.id || data?.id);
      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/register-verify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (response.data?.status) {
        Alert.alert('OTP Resent', 'New OTP has been sent to your email');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to resend OTP. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetail = async userId => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     setIsLoading(true);
  //     const enteredOtp = otp.join('').trim();

  //     if (enteredOtp.length < 6) {
  //       Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the OTP.');
  //       return;
  //     }

  //     // Step 1: Compare with userData?.otp
  //     if (userData?.otp && enteredOtp !== String(userData.otp)) {
  //       Alert.alert(
  //         'Incorrect OTP',
  //         'The OTP you entered does not match. Please check and try again.',
  //       );
  //       setIsLoading(false);
  //       return;
  //     }

  //     // Step 2: Only now, call the API (if check passes)
  //     const formData = new FormData();
  //     formData.append('user_id', userData?.id || data?.id);
  //     formData.append('otp', enteredOtp);

  //     const response = await axios.post(
  //       'https://argosmob.com/being-petz/public/api/v1/auth/register-verify',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       },
  //     );
  //     console.log('response', response.data);
  //     if (response.data?.status) {
  //       const userId = response.data?.user?.id || userData?.id;
  //       if (!userId) throw new Error('User ID not available');
  //       await fetchUserDetail(userId);
  //     } else {
  //       Alert.alert(
  //         'Invalid OTP',
  //         response.data?.message ||
  //           'The OTP you entered is incorrect. Please try again.',
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Submit error:', error);
  //     Alert.alert(
  //       'Error',
  //       error.response?.data?.message ||
  //         error.message ||
  //         'Something went wrong. Please try again.',
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const enteredOtp = otp.join('').trim();
      console.log('entered Password', enteredOtp);

      if (enteredOtp.length < 6) {
        Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the OTP.');
        setIsLoading(false);
        return;
      }

      // First verify against the OTP from userData (if available)
      if (data?.otp && enteredOtp !== String(otpGenerated)) {
        Alert.alert(
          'Incorrect OTP',
          'The OTP you entered does not match. Please check and try again.',
        );
        setIsLoading(false);
        return;
      }

      // If no userData.otp, or if it matches, then verify with API
      const formData = new FormData();
      formData.append('user_id', userData?.id || data?.id);
      formData.append('otp', enteredOtp);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/register-verify',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('API Response:', response.data);

      if (!response.data?.status) {
        Alert.alert(
          'Invalid OTP',
          response.data?.message || 'The OTP you entered is incorrect.',
        );
        setIsLoading(false);
        return;
      }

      // Only proceed if API verification succeeds
      const userId = response.data?.user?.id || data?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      await fetchUserDetail(userId);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.message ||
          'Something went wrong. Please try again.',
      );
      setIsLoading(false);
    }
  };

  const handleChangeText = (text, index) => {
    // allow only single character numerics
    const newChar = text.replace(/\D/g, '').slice(0, 1) || '';
    const newOtp = [...otp];
    newOtp[index] = newChar;
    setOtp(newOtp);

    if (newChar && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#8337B2" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>We just sent an OTP to</Text>
          <View style={styles.mobileNumberContainer}>
            <Text style={styles.mobileNumber}>{email || userData?.email}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter OTP</Text>
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
                  textContentType="oneTimeCode"
                  importantForAutofill="yes"
                />
              ))}
            </View>
          </View>
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive?</Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
              <Text
                style={[
                  styles.resendButton,
                  timer > 0 && styles.disabledResend,
                ]}>
                Resend OTP {timer > 0 ? `(${timer}s)` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            otp.join('').length < 6 && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={otp.join('').length < 6 || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
  },
  mobileNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  mobileNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8337B2',
    marginRight: 10,
  },
  editText: {
    fontSize: 14,
    color: '#8337B2',
    textDecorationLine: 'underline',
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#8337B2',
    backgroundColor: '#f9f0ff',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  resendButton: {
    fontSize: 14,
    color: '#8337B2',
    fontWeight: 'bold',
  },
  disabledResend: {
    color: '#aaa',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#c7a4e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OTP;

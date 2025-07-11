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
} from 'react-native';
import AlertNotification, {
  Dialog,
  ALERT_TYPE,
} from 'react-native-alert-notification';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OTP = ({route}) => {
  const navigation = useNavigation();
  const {emailPhone, user_id} = route.params;
  console.log('kkkkkk', user_id);
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const DEFAULT_OTP = '12345';
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOTP = () => {
    setTimer(30);
    setOtp(['', '', '', '', '']);
    AlertNotification.show({
      title: 'OTP Resent',
      message: 'New OTP has been sent to your mobile number',
      autoClose: 3000,
    });
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp == DEFAULT_OTP) {
      navigation.navigate('ResetPassword', {user_id: user_id});
    } else {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid OTP',
        textBody: 'The OTP you entered is incorrect. Please try again.',
        button: 'Close',
      });
    }
  };

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus to next input
    if (text && index < 4) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if last digit is entered (but only if OTP is incorrect)
    if (index === 4 && text) {
      const enteredOtp = [...newOtp].join('');
      if (enteredOtp !== DEFAULT_OTP) {
        handleSubmit();
      }
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#8337B2" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>We just sent an OTP to</Text>

          <View style={styles.mobileNumberContainer}>
            <Text style={styles.mobileNumber}>{emailPhone}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <Text style={styles.editText}>Edit Number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter OTP</Text>
            <View style={styles.otpInputsContainer}>
              {[0, 1, 2, 3, 4].map(index => (
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
            otp.join('').length < 5 && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={otp.join('').length < 5}>
          <Text style={styles.submitButtonText}>Submit OTP</Text>
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
    // backgroundColor:'#fff'
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

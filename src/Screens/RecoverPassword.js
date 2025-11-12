import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import axios from 'axios';

const RecoverPassword = ({navigation}) => {
  const [emailPhone, setEmailPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!emailPhone.trim()) {
      Alert.alert('Input Required', 'Please enter your email or phone number');
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();

      const formData = new FormData();
      formData.append('email_phone', emailPhone);

      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/auth/forget-password',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response?.data?.status === true) {
        navigation.navigate('OTP', {
          emailPhone: emailPhone,
          otp: response.data.data.otp?.toString() || '12345', // Fallback to '12345' if OTP not provided
          user_id: response.data.data?.id,
        });
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log('Error', error?.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recover Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email or Phone"
        placeholderTextColor="#999"
        value={emailPhone}
        onChangeText={setEmailPhone}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8337B2',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#8337B2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecoverPassword;

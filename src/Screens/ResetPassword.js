import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {Dialog, ALERT_TYPE} from 'react-native-alert-notification';

const ResetPassword = ({route}) => {
  const navigation = useNavigation();
  const {user_id} = route.params; // Get user_id from navigation params
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    // Validate passwords
    if (newPassword !== confirmPassword) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: "Passwords don't match!",
        button: 'Close',
      });
      return;
    }

    if (newPassword.length < 8) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Password must be at least 8 characters long',
        button: 'Close',
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('password', newPassword);

      const response = await axios.post(
        'https://argosmob.uk/being-petz/public/api/v1/auth/change-password',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('response ', response);

      if (response.data?.status) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: response.data.message || 'Password have sucessfully reset',
          button: 'close',
          autoClose: 1000,
          onHide: () => {
            // Navigation code here
            navigation.navigate('Login'); // Replace 'Login' with your actual login screen name
          },
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: response.data.message || 'Failed to change password',
          button: 'Close',
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody:
          error.response?.data?.message ||
          'Something went wrong. Please try again.',
        button: 'Close',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8337B2" />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      {/* Instruction text */}
      <Text style={styles.instructionText}>
        Please enter your new password below.
      </Text>

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
            placeholderTextColor={'#8337B2'}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}>
            <Icon
              name={showNewPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#8337B2"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            placeholderTextColor={'#8337B2'}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={24}
              color="#8337B2"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleResetPassword}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  title: {
    color: '#8337B2',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#8337B2',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#8337B2',
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8337B2',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#8337B2', // Change to your app's primary color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResetPassword;

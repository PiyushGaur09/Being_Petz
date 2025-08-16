import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Checkbox} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import TermsModal from './Components/TermModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
  const navigation = useNavigation();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = pass => pass.length >= 8;

  const handleSignup = async () => {
    if (!email || !firstName) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // if (!validatePassword(password)) {
    //   Alert.alert('Error', 'Password must be at least 8 characters long.');
    //   return;
    // }

    // if (password !== confirmPassword) {
    //   Alert.alert('Error', 'Passwords do not match.');
    //   return;
    // }

    if (!checked) {
      Alert.alert('Error', 'Please accept Terms and Conditions.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    // formData.append('password', password);

    try {
      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/register',
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 10000,
        },
      );

      await AsyncStorage.setItem(
          'user_data',
          JSON.stringify(response?.data?.data),
        );

      console.log('Registration Success', response.data);
      navigation.navigate('OTP', {userData: response.data.data});
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
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
              <Text style={styles.headerText}>Create account</Text>
            </View>

            <Text style={styles.subText}>
              Welcome! Please enter your information below and get started.
            </Text>

            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#808B9A"
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#808B9A"
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#808B9A"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password (min 8 characters)"
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

            {/* <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#808B9A"
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisible(!isConfirmPasswordVisible)
                }>
                <Icon
                  name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View> */}

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={() => setChecked(!checked)}
                color="#8337B2"
              />
              <Text style={styles.checkboxText}>
                Accept Terms and Conditions
              </Text>
              <Text
                onPress={() => setModalVisible(true)}
                style={[styles.loginLink, {marginLeft: 5}]}>
                Read Now
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              style={styles.createButton}
              disabled={isLoading}>
              <LinearGradient
                colors={['#8337B2', '#3B0060']}
                style={styles.gradientButton}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login here!</Text>
              </TouchableOpacity>
            </View>

            {/* <Text style={styles.orText}>or</Text>

            <View style={styles.socialIcons}>
              <Image source={require('../Assests/Images/googleLogo.png')} />
              <Image source={require('../Assests/Images/facebookLogo.png')} />
              <Image source={require('../Assests/Images/appleLogo.png')} />
            </View> */}
          </View>
        </View>
      </ScrollView>
      <TermsModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
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
    color: '#000',
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
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 5,
  },
  createButton: {
    width: '100%',
    marginBottom: 20,
  },
  gradientButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#777',
  },
  loginLink: {
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
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#8337B2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Keyboard,
// } from 'react-native';
// import axios from 'axios';

// const RecoverPassword = ({navigation}) => {
//   const [emailPhone, setEmailPhone] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState(['', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [apiOtp, setApiOtp] = useState('12345'); // Set default OTP to 12345
//   const inputRefs = Array(5).fill().map(() => useRef());

//   // For development/testing - auto-fill the OTP fields with 12345 when OTP is sent
//   useEffect(() => {
//     if (otpSent) {
//       setOtp(['1', '2', '3', '4', '5']);
//       // Auto-focus the last OTP input
//       setTimeout(() => inputRefs[4].current.focus(), 100);
//     }
//   }, [otpSent]);

//   const handleSendOtp = async () => {
//     if (!emailPhone.trim()) {
//       Alert.alert('Input Required', 'Please enter your email or phone number');
//       return;
//     }

//     try {
//       setLoading(true);
//       Keyboard.dismiss();

//       // For development, we'll skip the actual API call and just simulate success
//       setOtpSent(true);
//       setApiOtp('12345'); // Ensure API OTP is set to 12345
//       // Alert.alert('Success', 'OTP sent successfully ');
//       setLoading(false);

//       /*
//       // Actual API call would look like this:
//       const formData = new FormData();
//       formData.append('email_phone', emailPhone);

//       const response = await axios.post(
//         'https://argosmob.uk/being-petz/public/api/v1/auth/forget-password',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       if (response?.data?.status === true) {
//         setOtpSent(true);
//         setApiOtp(response.data.data.otp.toString());
//         Alert.alert(
//           'Success',
//           response.data.message || 'OTP sent successfully',
//         );
//       } else {
//         Alert.alert('Error', response?.data?.message || 'Something went wrong');
//       }
//       */
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.message || 'Network error');
//       setLoading(false);
//     }
//   };

//   const handleOtpChange = (index, value) => {
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value && index < 4) {
//       inputRefs[index + 1].current.focus();
//     }
//   };

//   const handleVerifyOtp = () => {
//     const enteredOtp = otp.join('');
//     if (enteredOtp.length !== 5) {
//       Alert.alert('Invalid OTP', 'Please enter the complete 5-digit OTP');
//       return;
//     }

//     if (enteredOtp === apiOtp) {
//       Alert.alert('Valid OTP', 'The OTP you entered is correct');
//       navigation.navigate('ResetPassword',{});
//     } else {
//       Alert.alert('Invalid OTP', 'The OTP you entered is incorrect');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Recover Password</Text>

//       {!otpSent ? (
//         <>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Email or Phone"
//             placeholderTextColor="#999"
//             value={emailPhone}
//             maxLength={13}
//             onChangeText={setEmailPhone}
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />
//           <TouchableOpacity
//             style={styles.button}
//             onPress={handleSendOtp}
//             disabled={loading}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Send OTP</Text>
//             )}
//           </TouchableOpacity>
//         </>
//       ) : (
//         <>
//           <Text style={styles.instruction}>
//             Enter the 5-digit OTP sent to your email or phone
//           </Text>
//           <Text style={styles.testOtpText}>Test OTP: 12345</Text>

//           <View style={styles.otpContainer}>
//             {[0, 1, 2, 3, 4].map(index => (
//               <TextInput
//                 key={index}
//                 ref={inputRefs[index]}
//                 style={styles.otpInput}
//                 keyboardType="number-pad"
//                 maxLength={1}
//                 value={otp[index]}
//                 onChangeText={value => handleOtpChange(index, value)}
//                 onKeyPress={({nativeEvent}) => {
//                   if (
//                     nativeEvent.key === 'Backspace' &&
//                     !otp[index] &&
//                     index > 0
//                   ) {
//                     inputRefs[index - 1].current.focus();
//                   }
//                 }}
//                 selectTextOnFocus
//               />
//             ))}
//           </View>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={handleVerifyOtp}
//             disabled={otp.join('').length !== 5}>
//             <Text style={styles.buttonText}>Match OTP</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 24,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     color: '#8337B2',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   instruction: {
//     textAlign: 'center',
//     marginBottom: 24,
//     color: '#555',
//     fontSize: 15,
//   },
//   testOtpText: {
//     textAlign: 'center',
//     marginBottom: 16,
//     color: '#8337B2',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#bbb',
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 18,
//     fontSize: 16,
//     color: '#000',
//   },
//   button: {
//     backgroundColor: '#8337B2',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
//   otpInput: {
//     width: 50,
//     height: 60,
//     borderWidth: 1,
//     borderColor: '#8337B2',
//     borderRadius: 10,
//     textAlign: 'center',
//     fontSize: 24,
//     color: '#000',
//     backgroundColor: '#F9EFFF',
//   },
// });

// export default RecoverPassword;

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
        'https://argosmob.uk/being-petz/public/api/v1/auth/forget-password',
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
    color: '#000',
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

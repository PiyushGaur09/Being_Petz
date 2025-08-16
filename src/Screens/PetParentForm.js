// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   ScrollView,
//   Modal,
//   PermissionsAndroid,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {TextInput} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation} from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ImagePicker from 'react-native-image-crop-picker';
// import axios from 'axios';

// const PetParentForm = () => {
//   const navigation = useNavigation();
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [userData, setUserData] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [selectedCity, setSelectedCity] = useState(null);
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Debounce the search input
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchText);
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchText]);

//   // Fetch suggestions when debounced search changes
//   useEffect(() => {
//     if (debouncedSearch.length > 2) {
//       fetchCitySuggestions(debouncedSearch);
//     } else {
//       setSuggestions([]);
//     }
//   }, [debouncedSearch]);

//   const fetchCitySuggestions = async input => {
//     try {
//       const isConnected = await checkNetworkConnection();
//       if (!isConnected) {
//         Alert.alert('No Internet', 'Please check your internet connection');
//         return;
//       }

//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//           input,
//         )}&types=(cities)&key=AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE`,
//         {timeout: 10000},
//       );

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       if (data.status === 'OK') {
//         setSuggestions(data.predictions);
//       } else {
//         console.error(
//           'Google Places API error:',
//           data.status,
//           data.error_message,
//         );
//         setSuggestions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching city suggestions:', error);
//       Alert.alert(
//         'Error',
//         'Failed to fetch city suggestions. Please try again.',
//       );
//       setSuggestions([]);
//     }
//   };

//   const checkNetworkConnection = async () => {
//     try {
//       const response = await fetch('https://www.google.com', {method: 'HEAD'});
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };

//   const handleCitySelect = async placeId => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE`,
//         {timeout: 10000},
//       );

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       if (data.status === 'OK') {
//         const {lat, lng} = data.result.geometry.location;
//         setSelectedCity({
//           name: data.result.name,
//           latitude: lat,
//           longitude: lng,
//         });
//         setSearchText(data.result.name);
//         setSuggestions([]);
//       } else {
//         throw new Error(data.error_message || 'Failed to get city details');
//       }
//     } catch (error) {
//       console.error('Error fetching city details:', error);
//       Alert.alert('Error', 'Failed to get city details. Please try again.');
//     }
//   };

//   const getUserDataFromStorage = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('user_data');
//       return jsonValue ? JSON.parse(jsonValue) : null;
//     } catch (e) {
//       console.error('Error reading userData from AsyncStorage:', e);
//       return null;
//     }
//   };

//   const fetchUserDetails = async () => {
//     try {
//       const storedData = await getUserDataFromStorage();
//       if (!storedData?.id) throw new Error('No user ID found');

//       const formData = new FormData();
//       formData.append('user_id', storedData.id);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       return response.data?.user || null;
//     } catch (error) {
//       console.error(
//         'Fetch user details error:',
//         error.response?.data || error.message,
//       );
//       throw error;
//     }
//   };

//   const loadUserData = async () => {
//     try {
//       setIsLoading(true);
//       const userDetails = await fetchUserDetails();

//       if (userDetails) {
//         setUserData(userDetails);
//         setFirstName(userDetails.first_name || '');
//         setLastName(userDetails.last_name || '');
//         setEmail(userDetails.email || '');
//         setPhoneNumber(userDetails.phone || '');

//         // Set initial city if available
//         if (userDetails.city) {
//           setSearchText(userDetails.city);
//         }
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load user data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const requestCameraPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const requestGalleryPermission = async () => {
//     if (Platform.OS === 'android') {
//       const granted = await PermissionsAndroid.request(
//         Platform.Version >= 33
//           ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
//           : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     }
//     return true;
//   };

//   const openCamera = async () => {
//     try {
//       const hasPermission = await requestCameraPermission();
//       if (!hasPermission) return;

//       const image = await ImagePicker.openCamera({
//         width: 300,
//         height: 400,
//         cropping: true,
//       });
//       await updateProfilePic(userData?.id, image.path);
//       setModalVisible(false);
//       await loadUserData();
//     } catch (error) {
//       if (error.code !== 'E_PICKER_CANCELLED') {
//         console.log('Camera error:', error);
//         Alert.alert('Error', 'Failed to take photo');
//       }
//       setModalVisible(false);
//     }
//   };

//   const openGallery = async () => {
//     try {
//       const hasPermission = await requestGalleryPermission();
//       if (!hasPermission) return;

//       const image = await ImagePicker.openPicker({
//         width: 300,
//         height: 400,
//         cropping: true,
//       });
//       await updateProfilePic(userData?.id, image.path);
//       setModalVisible(false);
//       await loadUserData();
//     } catch (error) {
//       if (error.code !== 'E_PICKER_CANCELLED') {
//         console.log('Gallery error:', error);
//         Alert.alert('Error', 'Failed to select image');
//       }
//       setModalVisible(false);
//     }
//   };

//   const updateProfilePic = async (userId, imageUri) => {
//     if (!imageUri || !userId) return;

//     try {
//       const formData = new FormData();
//       formData.append('user_id', userId);
//       formData.append('profile', {
//         uri: imageUri,
//         type: 'image/jpeg',
//         name: 'profile.jpg',
//       });

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/auth/update-profile-picture',
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Upload error:', error);
//       const errorMsg =
//         error.response?.data?.message || 'Failed to upload profile picture';
//       Alert.alert('Error', errorMsg);
//       throw error;
//     }
//   };

//   const deleteProfilePicture = async () => {
//     try {
//       if (!userData?.id) throw new Error('No user ID found');

//       const formData = new FormData();
//       formData.append('user_id', userData.id);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/auth/delete-profile-picture',
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       setModalVisible(false);
//       await loadUserData();
//       return response.data;
//     } catch (error) {
//       console.error('Delete error:', error);
//       const errorMsg =
//         error.response?.data?.message || 'Failed to delete profile picture';
//       Alert.alert('Error', errorMsg);
//       throw error;
//     }
//   };

//   const validateForm = () => {
//     if (!firstName.trim()) {
//       Alert.alert('Error', 'First name is required');
//       return false;
//     }
//     if (!lastName.trim()) {
//       Alert.alert('Error', 'Last name is required');
//       return false;
//     }
//     if (!email.trim()) {
//       Alert.alert('Error', 'Email is required');
//       return false;
//     }
//     if (!phoneNumber.trim()) {
//       Alert.alert('Error', 'Phone number is required');
//       return false;
//     }
//     if (!selectedCity) {
//       Alert.alert('Error', 'Please select a city from the list');
//       return false;
//     }
//     return true;
//   };

//   const handleUpdateProfile = async () => {
//     if (!validateForm()) return;
//     if (!userData?.id) {
//       Alert.alert('Error', 'No user ID found');
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       // Format phone number if needed
//       const formattedPhone = phoneNumber.startsWith('+')
//         ? phoneNumber
//         : `+91 ${phoneNumber}`;

//       const formData = new FormData();
//       formData.append('user_id', String(userData.id));
//       formData.append('first_name', firstName.trim());
//       formData.append('last_name', lastName.trim());
//       formData.append('email', email.trim());
//       formData.append('phone', formattedPhone.trim());
//       formData.append('latitude', String(selectedCity.latitude));
//       formData.append('longitude', String(selectedCity.longitude));

//       console.log('formData', formData);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/auth/update-profile',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Accept: 'application/json',
//           },
//           timeout: 10000,
//         },
//       );

//       if (response.data.status) {
//         Alert.alert('Success', 'Profile updated successfully');
//         navigation.goBack();
//       } else {
//         throw new Error(response.data.message || 'Update failed');
//       }
//     } catch (error) {
//       console.error('Update error:', error);
//       const errorMsg =
//         error.response?.data?.message ||
//         error.message ||
//         'Failed to update profile';
//       Alert.alert('Error', errorMsg);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8337B2" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
//       <View style={{alignItems: 'center'}}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-left" size={24} color="#1E2123" />
//           </TouchableOpacity>
//           <Text style={styles.heading}>Pet Parent Profile</Text>
//         </View>

//         <View style={styles.profileOuterContainer}>
//           <View style={styles.profileContainer}>
//             <Image
//               source={{
//                 uri: userData?.profile
//                   ? `https://argosmob.com/being-petz/public/${userData.profile}`
//                   : 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/No_image_available_500_x_500.svg/750px-No_image_available_500_x_500.svg.png?20150903190949',
//               }}
//               style={styles.profileImage}
//             />
//             <TouchableOpacity
//               onPress={() => setModalVisible(true)}
//               style={styles.cameraIcon}>
//               <Icon name="camera" size={24} color="#39434F" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         <Text style={styles.sectionTitle}>First Name</Text>
//         <View style={styles.locationinput}>
//           <TextInput
//             mode="outlined"
//             value={firstName}
//             onChangeText={setFirstName}
//             style={styles.input}
//             placeholder="First Name"
//             theme={inputTheme}
//           />
//         </View>

//         <Text style={styles.sectionTitle}>Last Name</Text>
//         <View style={styles.locationinput}>
//           <TextInput
//             mode="outlined"
//             value={lastName}
//             onChangeText={setLastName}
//             style={styles.input}
//             placeholder="Last Name"
//             theme={inputTheme}
//           />
//         </View>

//         <Text style={styles.sectionTitle}>Email</Text>
//         <View style={styles.locationinput}>
//           <TextInput
//             mode="outlined"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//             style={styles.input}
//             placeholder="Email"
//             theme={inputTheme}
//           />
//         </View>

//         <Text style={styles.sectionTitle}>Phone Number</Text>
//         <View style={styles.locationinput}>
//           <TextInput
//             mode="outlined"
//             keyboardType="phone-pad"
//             value={phoneNumber}
//             onChangeText={setPhoneNumber}
//             style={styles.input}
//             placeholder="Phone Number (include country code)"
//             theme={inputTheme}
//           />
//         </View>

//         <Text style={styles.sectionTitle}>Location</Text>
//         <View style={styles.locationinput}>
//           <TextInput
//             mode="outlined"
//             value={searchText}
//             onChangeText={setSearchText}
//             style={styles.input}
//             placeholder="Search for your city"
//             theme={inputTheme}
//           />
//         </View>

//         <View style={styles.suggestionsContainer}>
//           {suggestions.map(item => (
//             <TouchableOpacity
//               key={item.place_id}
//               style={styles.suggestionItem}
//               onPress={() => handleCitySelect(item.place_id)}>
//               <Text>{item.description}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity
//           onPress={handleUpdateProfile}
//           style={styles.button}
//           disabled={isUpdating}>
//           <LinearGradient
//             colors={['#8337B2', '#3B0060']}
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 1}}
//             style={styles.gradient}>
//             {isUpdating ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Confirm</Text>
//             )}
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         transparent={true}
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
//               <Text style={styles.modalButtonText}>Open Camera</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
//               <Text style={styles.modalButtonText}>Open Gallery</Text>
//             </TouchableOpacity>
//             {userData?.profile && (
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.deleteButton]}
//                 onPress={deleteProfilePicture}>
//                 <Text style={styles.modalButtonText}>Delete Photo</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={[styles.modalButton, styles.cancelButton]}
//               onPress={() => setModalVisible(false)}>
//               <Text style={styles.modalButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const inputTheme = {
//   roundness: 20,
//   colors: {
//     background: '#fff',
//     primary: 'grey',
//     text: '#000',
//     placeholder: '#444',
//   },
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 20,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//   },
//   profileOuterContainer: {
//     marginVertical: 30,
//     alignItems: 'center',
//     borderWidth: 1,
//     padding: 15,
//     borderRadius: 80,
//     borderColor: '#8337B2',
//   },
//   profileContainer: {
//     alignItems: 'center',
//     borderWidth: 1,
//     padding: 5,
//     borderRadius: 65,
//     borderColor: '#8337B2',
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     resizeMode: 'cover',
//   },
//   cameraIcon: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     padding: 5,
//     borderRadius: 15,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#39434F',
//     marginLeft: '25%',
//   },
//   locationinput: {
//     width: '100%',
//     borderRadius: 24,
//     marginBottom: 20,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     borderBottomColor:'#8337B2',
//     borderBottomWidth:5
//   },
//   input: {
//     height: 45,
//     width: '100%',
//   },
//   button: {
//     backgroundColor: '#8337B2',
//     width: '100%',
//     alignItems: 'center',
//     borderRadius: 20,
//     marginTop: 20,
//     marginBottom: 50,
//     overflow: 'hidden',
//   },
//   gradient: {
//     width: '100%',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderRadius: 20,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     width: 300,
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalButton: {
//     marginVertical: 10,
//     width: '100%',
//     backgroundColor: '#8337B2',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   deleteButton: {
//     backgroundColor: '#ff4444',
//   },
//   cancelButton: {
//     backgroundColor: '#ccc',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: 'grey',
//     marginBottom: 4,
//     marginLeft: 5,
//     width: '100%',
//   },
//   suggestionsContainer: {
//     width: '100%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 20,
//     maxHeight: 200,
//   },
//   suggestionItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
// });

// export default PetParentForm;




import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const PetParentForm = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  // Dropdown states
  const [cityOpen, setCityOpen] = useState(false);
  const [cityValue, setCityValue] = useState(null);
  const [cityItems, setCityItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch city suggestions when debounced search changes
  useEffect(() => {
    if (debouncedSearch.length > 2) {
      fetchCitySuggestions(debouncedSearch);
    } else {
      setCityItems([]);
    }
  }, [debouncedSearch]);

  const fetchCitySuggestions = async input => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input,
        )}&types=(cities)&key=AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE`,
        {timeout: 10000},
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'OK') {
        const items = data.predictions.map(prediction => ({
          label: prediction.description,
          value: prediction.place_id,
        }));
        setCityItems(items);
      } else {
        console.error('Google Places API error:', data.status);
        setCityItems([]);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setCityItems([]);
    }
  };

  const handleCitySelect = async placeId => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=AIzaSyAonK15hotzDslX4ePjIbmizRii-7Ng4QE`,
        {timeout: 10000},
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'OK') {
        const {lat, lng} = data.result.geometry.location;
        setFormData(prev => ({
          ...prev,
          city: data.result.name,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
        setSearchText(data.result.name);
        setCityOpen(false);
      }
    } catch (error) {
      console.error('Error fetching city details:', error);
      Alert.alert('Error', 'Failed to get city details');
    }
  };

  const getUserDataFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_data');
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading userData from AsyncStorage:', e);
      return null;
    }
  };

  const fetchUserDetails = async () => {
    try {
      const storedData = await getUserDataFromStorage();
      if (!storedData?.id) throw new Error('No user ID found');

      const formData = new FormData();
      formData.append('user_id', storedData.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      return response.data?.user || null;
    } catch (error) {
      console.error('Fetch user details error:', error);
      throw error;
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userDetails = await fetchUserDetails();

      if (userDetails) {
        setUserData(userDetails);
        setFormData({
          firstName: userDetails.first_name || '',
          lastName: userDetails.last_name || '',
          email: userDetails.email || '',
          phone: userDetails.phone || '',
          city: userDetails.city || '',
          latitude: userDetails.latitude || '',
          longitude: userDetails.longitude || '',
        });

        if (userDetails.city) {
          setSearchText(userDetails.city);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
      await updateProfilePic(userData?.id, image.path);
      setModalVisible(false);
      await loadUserData();
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
      setModalVisible(false);
    }
  };

  const openGallery = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      await updateProfilePic(userData?.id, image.path);
      setModalVisible(false);
      await loadUserData();
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery error:', error);
        Alert.alert('Error', 'Failed to select image');
      }
      setModalVisible(false);
    }
  };

  const updateProfilePic = async (userId, imageUri) => {
    if (!imageUri || !userId) return;

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('profile', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/update-profile-picture',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg =
        error.response?.data?.message || 'Failed to upload profile picture';
      Alert.alert('Error', errorMsg);
      throw error;
    }
  };

  const deleteProfilePicture = async () => {
    try {
      if (!userData?.id) throw new Error('No user ID found');

      const formData = new FormData();
      formData.append('user_id', userData.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/delete-profile-picture',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      setModalVisible(false);
      await loadUserData();
      return response.data;
    } catch (error) {
      console.error('Delete error:', error);
      const errorMsg =
        error.response?.data?.message || 'Failed to delete profile picture';
      Alert.alert('Error', errorMsg);
      throw error;
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Error', 'Please select a city');
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    if (!userData?.id) {
      Alert.alert('Error', 'No user ID found');
      return;
    }

    setIsUpdating(true);
    try {
      const formattedPhone = formData.phone.startsWith('+')
        ? formData.phone
        : `+91 ${formData.phone}`;

      const data = new FormData();
      data.append('user_id', String(userData.id));
      data.append('first_name', formData.firstName.trim());
      data.append('last_name', formData.lastName.trim());
      data.append('email', formData.email.trim());
      data.append('phone', formattedPhone.trim());
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/update-profile',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
          timeout: 10000,
        },
      );

      if (response.data.status) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update profile';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8337B2" />
        </TouchableOpacity>
        <Text style={styles.heading}>Pet Parent Profile</Text>
      </View>

      <View style={styles.profileOuterContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: userData?.profile
                ? `https://argosmob.com/being-petz/public/${userData.profile}`
                : 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/No_image_available_500_x_500.svg/750px-No_image_available_500_x_500.svg.png?20150903190949',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.cameraIcon}>
            <Icon name="camera" size={24} color="#39434F" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={text =>
            setFormData({...formData, firstName: text})
          }
          placeholder="First Name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={text =>
            setFormData({...formData, lastName: text})
          }
          placeholder="Last Name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={text =>
            setFormData({...formData, email: text})
          }
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={text =>
            setFormData({...formData, phone: text})
          }
          placeholder="Phone Number (include country code)"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <DropDownPicker
          open={cityOpen}
          value={cityValue}
          items={cityItems}
          setOpen={setCityOpen}
          setValue={setCityValue}
          setItems={setCityItems}
          placeholder="Search for your city"
          searchable={true}
          searchPlaceholder="Type to search cities..."
          searchTextInputProps={{
            value: searchText,
            onChangeText: setSearchText,
          }}
          onSelectItem={item => handleCitySelect(item.value)}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleUpdateProfile}
        disabled={isUpdating}>
        <LinearGradient
          colors={['#8337B2', '#3B0060']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <Text style={styles.modalButtonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
              <Text style={styles.modalButtonText}>Open Gallery</Text>
            </TouchableOpacity>
            {userData?.profile && (
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteProfilePicture}>
                <Text style={styles.modalButtonText}>Delete Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8337B2',
    marginLeft: '20%',
    flex: 1,
  },
  profileOuterContainer: {
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    padding: 15,
    borderRadius: 80,
    borderColor: '#8337B2',
    alignSelf: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 5,
    borderRadius: 65,
    borderColor: '#8337B2',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#8337B2',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 20,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: 300,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#8337B2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PetParentForm;
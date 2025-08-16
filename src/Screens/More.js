// // import React, {useState, useEffect} from 'react';
// // import {
// //   View,
// //   Text,
// //   Image,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   ScrollView,
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// // import Header from './Components/Header';
// // import {useNavigation} from '@react-navigation/native';
// // import FriendRequestsModal from './Components/FriendRequestsModal';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import axios from 'axios';
// // import CommonHeader from './Components/CommonHeader';
// // import QRCode from 'react-native-qrcode-svg';
// // import LottieLoader from './Components/LottieLoader';

// // const More = () => {
// //   const navigation = useNavigation();
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [userData, setUserData] = useState(null);
// //   const [ownerData, setOwnerData] = useState(null);
// //   const [petData, setPetData] = useState(null);
// //   const [selectedPetId, setSelectedPetId] = useState(null);
// //   const [loading, setLoading] = useState({
// //     initial: true,
// //     pet: false,
// //   });
// //   const [error, setError] = useState(null);

// //   console.log('selectedPetId============', petData);

// //   const signOut = async () => {
// //     try {
// //       await AsyncStorage.removeItem('user_data');
// //       await AsyncStorage.removeItem('SelectedPetId');
// //       navigation.reset({
// //         index: 0,
// //         routes: [{name: 'Login'}],
// //       });
// //     } catch (error) {
// //       console.error('Error signing out:', error);
// //     }
// //   };

// //   // Fetch initial data
// //   useEffect(() => {
// //     const fetchInitialData = async () => {
// //       try {
// //         // Get user data from AsyncStorage
// //         const userDataString = await AsyncStorage.getItem('user_data');
// //         const userData = JSON.parse(userDataString);
// //         setUserData(userData);

// //         // Get initial selected pet ID from AsyncStorage
// //         const petId = await AsyncStorage.getItem('SelectedPetId');
// //         setSelectedPetId(petId);

// //         // Fetch user details
// //         const userFormData = new FormData();
// //         userFormData.append('user_id', userData?.id || '1');

// //         const userDetailResponse = await axios.post(
// //           'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
// //           userFormData,
// //           {
// //             headers: {
// //               'Content-Type': 'multipart/form-data',
// //             },
// //           },
// //         );
// //         setOwnerData(userDetailResponse?.data?.user);
// //       } catch (error) {
// //         console.error('Error fetching initial data:', error);
// //         setError('Failed to load user data. Please try again.');
// //       } finally {
// //         setLoading(prev => ({...prev, initial: false}));
// //       }
// //     };

// //     fetchInitialData();
// //   }, []);

// //   // Watch for changes in SelectedPetId and fetch pet details
// //   useEffect(() => {
// //     let isMounted = true;

// //     const checkPetIdChange = async () => {
// //       try {
// //         const currentPetId = await AsyncStorage.getItem('SelectedPetId');
// //         if (currentPetId !== selectedPetId && isMounted) {
// //           setSelectedPetId(currentPetId);
// //         }
// //       } catch (error) {
// //         console.error('Error checking pet ID:', error);
// //       }
// //     };

// //     // Set up an interval to check for changes
// //     const intervalId = setInterval(checkPetIdChange, 1000);

// //     return () => {
// //       isMounted = false;
// //       clearInterval(intervalId);
// //     };
// //   }, [selectedPetId]);

// //   // Fetch pet details whenever selectedPetId changes
// //   useEffect(() => {
// //     let isMounted = true;

// //     const fetchPetDetails = async () => {
// //       if (!selectedPetId) return;

// //       try {
// //         if (isMounted) setLoading(prev => ({...prev, pet: true}));

// //         const petFormData = new FormData();
// //         petFormData.append('pet_id', selectedPetId);

// //         const petDetailResponse = await axios.post(
// //           'https://argosmob.com/being-petz/public/api/v1/pet/detail',
// //           petFormData,
// //           {
// //             headers: {
// //               'Content-Type': 'multipart/form-data',
// //             },
// //           },
// //         );

// //         if (isMounted) {
// //           setPetData(petDetailResponse.data?.data);
// //           setError(null);
// //         }
// //       } catch (error) {
// //         console.error('Error fetching pet details:', error);
// //         if (isMounted)
// //           setError('Failed to load pet details. Please try again.');
// //       } finally {
// //         if (isMounted) setLoading(prev => ({...prev, pet: false}));
// //       }
// //     };

// //     fetchPetDetails();

// //     return () => {
// //       isMounted = false;
// //     };
// //   }, [selectedPetId]);

// //   if (loading.initial && !petData) {
// //     return (
// //       <View style={[styles.container, styles.center]}>
        // <ActivityIndicator size="large" color="#0000ff" />
// //         {/* <LottieLoader visible={loading} /> */}
// //       </View>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <View style={[styles.container, styles.center]}>
// //         <Text style={styles.errorText}>{error}</Text>
// //         <TouchableOpacity
// //           onPress={() => {
// //             setLoading({initial: true, pet: false});
// //             setError(null);
// //           }}>
// //           <Text style={styles.retryText}>Retry</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const capitalizeFirstLetter = str => {
// //     if (!str) return str;
// //     return str.charAt(0).toUpperCase() + str.slice(1);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <CommonHeader
// //         onChatPress={() => navigation.navigate('Chats')}
// //         onPeoplePress={() => setModalVisible(true)}
// //       />

// //       {loading.pet && (
// //         <View style={styles.loadingOverlay}>
// //           <ActivityIndicator size="small" color="#0000ff" />
// //         </View>
// //       )}

// //       <ScrollView contentContainerStyle={styles.scrollContainer}>
// //         {/* Pet Details Section (now the first section) */}
// //         <View style={styles.section}>
// //           <View style={styles.sectionHeader}>
// //             <Text style={styles.sectionTitle}>Pet Details</Text>
// //             <TouchableOpacity
// //               onPress={() => {
// //                 navigation.navigate('Edit Pet', {selectedPetId: selectedPetId});
// //               }}>
// //               <Text style={styles.editText}>Edit</Text>
// //             </TouchableOpacity>
// //           </View>
// //           <View style={styles.detailsContainer}>
// //             <Text style={[styles.sectionTitle, {marginBottom: 10}]}>
// //               {capitalizeFirstLetter(petData?.name)}
// //             </Text>

// //             <View style={styles.detailRow}>
// //               <Icon
// //                 name={
// //                   petData?.gender?.toLowerCase() === 'female'
// //                     ? 'gender-female'
// //                     : 'gender-male'
// //                 }
// //                 size={18}
// //                 color="#000"
// //               />
// //               <Text style={styles.detailText}>
// //                 {capitalizeFirstLetter(petData?.gender) || 'Unknown'},{' '}
// //                 {capitalizeFirstLetter(petData?.breed) || 'Unknown breed'}
// //               </Text>
// //             </View>
// //             <View style={styles.detailRow}>
// //               <Icon name="details" size={20} color="#000" />
// //               <Text style={styles.detailText}>
// //                 {petData?.bio || 'Bio not available'}
// //               </Text>
// //             </View>
// //             <View style={styles.detailRow}>
// //               <Icon name="calendar" size={20} color="#000" />
// //               <Text style={styles.detailText}>
// //                 {petData?.dob
// //                   ? new Date(petData.dob).toLocaleDateString()
// //                   : 'Birthdate unknown'}
// //               </Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Owner Section */}
// //         <View style={styles.section}>
// //           <View style={styles.sectionHeader}>
// //             <Text style={styles.sectionTitle}>Pet Parent</Text>
// //             <TouchableOpacity
// //               onPress={() => {
// //                 navigation.navigate('Pet Parent Form');
// //               }}>
// //               <Text style={styles.editText}>Edit</Text>
// //             </TouchableOpacity>
// //           </View>
// //           <View style={styles.profileContainer}>
// //             <Image
// //               source={{
// //                 uri:
// //                   `https://argosmob.com/being-petz/public/${ownerData?.profile}` ||
// //                   `https://argosmob.com/being-petz/public/${userData?.profile}` ||
// //                   'https://placeholder.com/user-image.jpg',
// //               }}
// //               style={styles.ownerImage}
// //             />
// //             <View style={styles.ownerTextContainer}>
// //               {/* <Text style={styles.ownerName}>
// //                 {`${ownerData?.first_name || ''} ${
// //                   ownerData?.last_name || ''
// //                 }`.trim() || 'Owner name'}
// //               </Text> */}
// //               <Text style={styles.ownerEmail}>
// //                 {`Name : ${ownerData?.first_name || ''} ${
// //                   ownerData?.last_name || ''
// //                 }`}
// //               </Text>
// //               <Text style={styles.ownerEmail}>
// //                 {`Email ID : ${
// //                   ownerData?.email || userData?.email || 'Email not available'
// //                 }`}
// //               </Text>
// //               <Text style={styles.ownerEmail}>
// //                 {`Phone No : ${ownerData?.phone || 'Phone No. not available'}`}
// //               </Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Options Section */}
// //         <View style={styles.optionsSection}>
// //           <TouchableOpacity
// //             onPress={() => {
// //               navigation.navigate('Add Pet');
// //             }}
// //             style={styles.optionRow}>
// //             <View style={styles.optionContent}>
// //               <Icon
// //                 name="scale-balance"
// //                 size={24}
// //                 color="#000"
// //                 style={styles.optionIcon}
// //               />
// //               <Text style={styles.optionTitle}>Add New Pet</Text>
// //             </View>
// //             <Icon name="chevron-right" size={24} color="#000" />
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             onPress={() => {
// //               navigation.navigate('QR', {data: petData?.unid});
// //             }}
// //             style={styles.optionRow}>
// //             <View style={styles.optionContent}>
// //               <Icon
// //                 name="qrcode"
// //                 size={24}
// //                 color="#000"
// //                 style={styles.optionIcon}
// //               />
// //               <Text style={styles.optionTitle}>Generate QR code </Text>
// //             </View>
// //             <Icon name="chevron-right" size={24} color="#000" />
// //           </TouchableOpacity>
// //           {/* <Text style={styles.optionSubText}>Read it carefully</Text> */}

// //           <TouchableOpacity style={styles.optionRow}>
// //             <View style={styles.optionContent}>
// //               <Icon
// //                 name="trash-can-outline"
// //                 size={24}
// //                 color="#000"
// //                 style={styles.optionIcon}
// //               />
// //               <Text style={styles.optionTitle}>Delete Your Profile</Text>
// //             </View>
// //             <Icon name="chevron-right" size={24} color="#000" />
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             onPress={signOut}
// //             style={[styles.optionRow, styles.logoutRow]}>
// //             <View style={styles.optionContent}>
// //               <Icon
// //                 name="logout"
// //                 size={24}
// //                 color="red"
// //                 style={styles.optionIcon}
// //               />
// //               <Text style={styles.logoutText}>Signout your Profile</Text>
// //             </View>
// //             <Icon name="chevron-right" size={24} color="red" />
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>

// //       <FriendRequestsModal
// //         visible={modalVisible}
// //         onClose={() => setModalVisible(false)}
// //       />
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //   },
// //   scrollContainer: {
// //     paddingBottom: 30,
// //     paddingTop: 10, // Added some top padding
// //   },
// //   loadingOverlay: {
// //     position: 'absolute',
// //     top: 60,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(255, 255, 255, 0.7)',
// //     zIndex: 1000,
// //   },
// //   section: {
// //     marginVertical: 10,
// //     paddingHorizontal: 20,
// //   },
// //   sectionHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   sectionTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //   },
// //   editText: {
// //     color: 'purple',
// //     fontSize: 14,
// //   },
// //   detailsContainer: {
// //     backgroundColor: '#f8f8f8',
// //     borderRadius: 10,
// //     padding: 15,
// //     borderColor: '#000',
// //     borderWidth: 0.5,
// //   },
// //   detailRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 12,
// //   },
// //   detailText: {
// //     marginLeft: 12,
// //     fontSize: 14,
// //     color: '#444',
// //     flex: 1,
// //   },
// //   profileContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 15,
// //     backgroundColor: '#f8f8f8',
// //     borderRadius: 10,
// //     borderColor: '#000',
// //     borderWidth: 0.5,

// //     // marginHorizontal: 20,
// //     marginTop: 10,
// //   },
// //   ownerImage: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     marginRight: 15,
// //     borderColor: '#000',
// //     borderWidth: 0.5,
// //   },
// //   ownerTextContainer: {
// //     flex: 1,
// //   },
// //   ownerName: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginBottom: 4,
// //   },
// //   ownerEmail: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   optionsSection: {
// //     marginTop: 20,
// //     paddingHorizontal: 20,
// //   },
// //   optionRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingVertical: 15,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#eee',
// //   },
// //   optionContent: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   optionIcon: {
// //     marginRight: 15,
// //   },
// //   optionTitle: {
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   optionSubText: {
// //     fontSize: 12,
// //     color: '#999',
// //     marginLeft: 40,
// //     marginTop: -10,
// //     marginBottom: 10,
// //   },
// //   logoutRow: {
// //     borderBottomWidth: 0,
// //     marginTop: 10,
// //   },
// //   logoutText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: 'red',
// //   },
// //   errorText: {
// //     color: 'red',
// //     marginBottom: 10,
// //     textAlign: 'center',
// //   },
// //   retryText: {
// //     color: 'blue',
// //     fontWeight: 'bold',
// //     textAlign: 'center',
// //   },
// //   center: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// // });

// // export default More;

// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Header from './Components/Header';
// import {useNavigation} from '@react-navigation/native';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import CommonHeader from './Components/CommonHeader';
// import QRCode from 'react-native-qrcode-svg';
// import LottieLoader from './Components/LottieLoader';

// const More = () => {
//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [ownerData, setOwnerData] = useState(null);
//   const [petData, setPetData] = useState(null);
//   const [selectedPetId, setSelectedPetId] = useState(null);
//   const [loading, setLoading] = useState({
//     initial: true,
//     pet: false,
//     refreshing: false, // Added for pull-to-refresh
//   });
//   const [error, setError] = useState(null);

//   const signOut = async () => {
//     try {
//       await AsyncStorage.removeItem('user_data');
//       await AsyncStorage.removeItem('SelectedPetId');
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'Login'}],
//       });
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       setLoading(prev => ({...prev, initial: true, refreshing: true}));
//       setError(null);

//       // Get user data from AsyncStorage
//       const userDataString = await AsyncStorage.getItem('user_data');
//       const userData = JSON.parse(userDataString);
//       setUserData(userData);

//       // Get initial selected pet ID from AsyncStorage
//       const petId = await AsyncStorage.getItem('SelectedPetId');
//       setSelectedPetId(petId);

//       // Fetch user details
//       const userFormData = new FormData();
//       userFormData.append('user_id', userData?.id || '1');

//       const userDetailResponse = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
//         userFormData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );
//       setOwnerData(userDetailResponse?.data?.user);

//       // Fetch pet details if petId exists
//       if (petId) {
//         const petFormData = new FormData();
//         petFormData.append('pet_id', petId);

//         const petDetailResponse = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/pet/detail',
//           petFormData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );
//         setPetData(petDetailResponse.data?.data);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('Failed to load data. Please try again.');
//     } finally {
//       setLoading(prev => ({...prev, initial: false, refreshing: false}));
//     }
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Watch for changes in SelectedPetId
//   useEffect(() => {
//     let isMounted = true;

//     const checkPetIdChange = async () => {
//       try {
//         const currentPetId = await AsyncStorage.getItem('SelectedPetId');
//         if (currentPetId !== selectedPetId && isMounted) {
//           setSelectedPetId(currentPetId);
//         }
//       } catch (error) {
//         console.error('Error checking pet ID:', error);
//       }
//     };

//     const intervalId = setInterval(checkPetIdChange, 1000);

//     return () => {
//       isMounted = false;
//       clearInterval(intervalId);
//     };
//   }, [selectedPetId]);

//   // Fetch pet details when selectedPetId changes
//   useEffect(() => {
//     let isMounted = true;

//     const fetchPetDetails = async () => {
//       if (!selectedPetId) return;

//       try {
//         if (isMounted) setLoading(prev => ({...prev, pet: true}));

//         const petFormData = new FormData();
//         petFormData.append('pet_id', selectedPetId);

//         const petDetailResponse = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/pet/detail',
//           petFormData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );

//         if (isMounted) {
//           setPetData(petDetailResponse.data?.data);
//           setError(null);
//         }
//       } catch (error) {
//         console.error('Error fetching pet details:', error);
//         if (isMounted)
//           setError('Failed to load pet details. Please try again.');
//       } finally {
//         if (isMounted) setLoading(prev => ({...prev, pet: false}));
//       }
//     };

//     fetchPetDetails();

//     return () => {
//       isMounted = false;
//     };
//   }, [selectedPetId]);

//   const onRefresh = () => {
//     fetchData();
//   };

//   const capitalizeFirstLetter = str => {
//     if (!str) return str;
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   };

//   // if (loading.initial && !petData) {
//   //   return (
//   //     <View style={[styles.container, styles.center]}>
//   //       {/* <LottieLoader visible={loading.initial} /> */}
//   //       <ActivityIndicator size="large" color="#0000ff" />
//   //     </View>
//   //   );
//   // }

//   if (error) {
//     return (
//       <View style={[styles.container, styles.center]}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity onPress={fetchData}>
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <CommonHeader
//         onChatPress={() => navigation.navigate('Chats')}
//         onPeoplePress={() => setModalVisible(true)}
//       />

//       {loading.pet && (
//         <View style={{}}>
//           <ActivityIndicator size="small" color="#0000ff" />
//         </View>
//       )}

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         // refreshControl={
//         //   <RefreshControl
//         //     refreshing={loading.refreshing}
//         //     onRefresh={onRefresh}
//         //     colors={['#0000ff']}
//         //     tintColor="#0000ff"
//         //   />
//         // }
//         >
//         {loading.refreshing ? (
//           <View style={styles.loaderContainer}>
//             {/* <ActivityIndicator size="large" color="#0000ff" /> */}
//             <LottieLoader visible={loading.initial} />
//           </View>
//         ) : (
//           <>
//             {/* Pet Details Section */}
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Pet Details</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     navigation.navigate('Edit Pet', {
//                       selectedPetId: selectedPetId,
//                     });
//                   }}>
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>
//               </View>
//               <View style={styles.detailsContainer}>
//                 <Text style={[styles.sectionTitle, {marginBottom: 10}]}>
//                   {capitalizeFirstLetter(petData?.name)}
//                 </Text>

//                 <View style={styles.detailRow}>
//                   <Icon
//                     name={
//                       petData?.gender?.toLowerCase() === 'female'
//                         ? 'gender-female'
//                         : 'gender-male'
//                     }
//                     size={18}
//                     color="#000"
//                   />
//                   <Text style={styles.detailText}>
//                     {capitalizeFirstLetter(petData?.gender) || 'Unknown'},{' '}
//                     {capitalizeFirstLetter(petData?.breed) || 'Unknown breed'}
//                   </Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Icon name="details" size={20} color="#000" />
//                   <Text style={styles.detailText}>
//                     {petData?.bio || 'Bio not available'}
//                   </Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Icon name="calendar" size={20} color="#000" />
//                   <Text style={styles.detailText}>
//                     {petData?.dob
//                       ? new Date(petData.dob).toLocaleDateString()
//                       : 'Birthdate unknown'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* Owner Section */}
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Pet Parent</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     navigation.navigate('Pet Parent Form');
//                   }}>
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>
//               </View>
//               <View style={styles.profileContainer}>
//                 <Image
//                   source={{
//                     uri:
//                       `https://argosmob.com/being-petz/public/${ownerData?.profile}` ||
//                       `https://argosmob.com/being-petz/public/${userData?.profile}` ||
//                       'https://placeholder.com/user-image.jpg',
//                   }}
//                   style={styles.ownerImage}
//                 />
//                 <View style={styles.ownerTextContainer}>
//                   <Text style={styles.ownerEmail}>
//                     {`Name : ${ownerData?.first_name || ''} ${
//                       ownerData?.last_name || ''
//                     }`}
//                   </Text>
//                   <Text style={styles.ownerEmail}>
//                     {`Email ID : ${
//                       ownerData?.email ||
//                       userData?.email ||
//                       'Email not available'
//                     }`}
//                   </Text>
//                   <Text style={styles.ownerEmail}>
//                     {`Phone No : ${
//                       ownerData?.phone || 'Phone No. not available'
//                     }`}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* Options Section */}
//             <View style={styles.optionsSection}>
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('Add Pet');
//                 }}
//                 style={styles.optionRow}>
//                 <View style={styles.optionContent}>
//                   <Icon
//                     name="scale-balance"
//                     size={24}
//                     color="#000"
//                     style={styles.optionIcon}
//                   />
//                   <Text style={styles.optionTitle}>Add New Pet</Text>
//                 </View>
//                 <Icon name="chevron-right" size={24} color="#000" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate('QR', {data: petData?.unid});
//                 }}
//                 style={styles.optionRow}>
//                 <View style={styles.optionContent}>
//                   <Icon
//                     name="qrcode"
//                     size={24}
//                     color="#000"
//                     style={styles.optionIcon}
//                   />
//                   <Text style={styles.optionTitle}>Generate QR code </Text>
//                 </View>
//                 <Icon name="chevron-right" size={24} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.optionRow}>
//                 <View style={styles.optionContent}>
//                   <Icon
//                     name="trash-can-outline"
//                     size={24}
//                     color="#000"
//                     style={styles.optionIcon}
//                   />
//                   <Text style={styles.optionTitle}>Delete Your Profile</Text>
//                 </View>
//                 <Icon name="chevron-right" size={24} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={signOut}
//                 style={[styles.optionRow, styles.logoutRow]}>
//                 <View style={styles.optionContent}>
//                   <Icon
//                     name="logout"
//                     size={24}
//                     color="red"
//                     style={styles.optionIcon}
//                   />
//                   <Text style={styles.logoutText}>Signout your Profile</Text>
//                 </View>
//                 <Icon name="chevron-right" size={24} color="red" />
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </ScrollView>

//       <FriendRequestsModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//     paddingTop: 10,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 60,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     zIndex: 1000,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: '100%',
//   },
//   section: {
//     marginVertical: 10,
//     paddingHorizontal: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   editText: {
//     color: 'purple',
//     fontSize: 14,
//   },
//   detailsContainer: {
//     backgroundColor: '#f8f8f8',
//     borderRadius: 10,
//     padding: 15,
//     borderColor: '#000',
//     borderWidth: 0.5,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   detailText: {
//     marginLeft: 12,
//     fontSize: 14,
//     color: '#444',
//     flex: 1,
//   },
//   profileContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 10,
//     borderColor: '#000',
//     borderWidth: 0.5,
//     marginTop: 10,
//   },
//   ownerImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 15,
//     borderColor: '#000',
//     borderWidth: 0.5,
//   },
//   ownerTextContainer: {
//     flex: 1,
//   },
//   ownerName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   ownerEmail: {
//     fontSize: 14,
//     color: '#666',
//   },
//   optionsSection: {
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   optionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   optionContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   optionIcon: {
//     marginRight: 15,
//   },
//   optionTitle: {
//     fontSize: 16,
//     color: '#333',
//   },
//   optionSubText: {
//     fontSize: 12,
//     color: '#999',
//     marginLeft: 40,
//     marginTop: -10,
//     marginBottom: 10,
//   },
//   logoutRow: {
//     borderBottomWidth: 0,
//     marginTop: 10,
//   },
//   logoutText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'red',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   retryText: {
//     color: 'blue',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
// });

// export default More;






































import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import FriendRequestsModal from './Components/FriendRequestsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CommonHeader from './Components/CommonHeader';

const More = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [petData, setPetData] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [loading, setLoading] = useState({
    initial: true,
    pet: false,
    refreshing: false,
  });
  const [error, setError] = useState(null);

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('SelectedPetId');
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(prev => ({...prev, initial: true, refreshing: true}));
      setError(null);

      const userDataString = await AsyncStorage.getItem('user_data');
      const userData = JSON.parse(userDataString);
      setUserData(userData);

      const petId = await AsyncStorage.getItem('SelectedPetId');
      setSelectedPetId(petId);

      const userFormData = new FormData();
      userFormData.append('user_id', userData?.id || '1');

      const userDetailResponse = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
        userFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setOwnerData(userDetailResponse?.data?.user);

      if (petId) {
        const petFormData = new FormData();
        petFormData.append('pet_id', petId);

        const petDetailResponse = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/pet/detail',
          petFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
        setPetData(petDetailResponse.data?.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(prev => ({...prev, initial: false, refreshing: false}));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkPetIdChange = async () => {
      try {
        const currentPetId = await AsyncStorage.getItem('SelectedPetId');
        if (currentPetId !== selectedPetId && isMounted) {
          setSelectedPetId(currentPetId);
        }
      } catch (error) {
        console.error('Error checking pet ID:', error);
      }
    };

    const intervalId = setInterval(checkPetIdChange, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [selectedPetId]);

  useEffect(() => {
    let isMounted = true;

    const fetchPetDetails = async () => {
      if (!selectedPetId) return;

      try {
        if (isMounted) setLoading(prev => ({...prev, pet: true}));

        const petFormData = new FormData();
        petFormData.append('pet_id', selectedPetId);

        const petDetailResponse = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/pet/detail',
          petFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (isMounted) {
          setPetData(petDetailResponse.data?.data);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching pet details:', error);
        if (isMounted)
          setError('Failed to load pet details. Please try again.');
      } finally {
        if (isMounted) setLoading(prev => ({...prev, pet: false}));
      }
    };

    fetchPetDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedPetId]);

  const onRefresh = () => {
    fetchData();
  };

  const capitalizeFirstLetter = str => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      {loading.pet && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#8337B2" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading.refreshing}
            onRefresh={onRefresh}
            colors={['#8337B2']}
            tintColor="#8337B2"
          />
        }>
        {loading.initial ? (
          <View style={styles.loaderContainer}>
            {/* <LottieLoader visible={loading.initial} /> */}
                    <ActivityIndicator size="large" color="#8337B2" />

          </View>
        ) : (
          <>
            {/* Pet Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pet Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Edit Pet', {
                      selectedPetId: selectedPetId,
                    });
                  }}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={[styles.sectionTitle, {marginBottom: 10}]}>
                  {capitalizeFirstLetter(petData?.name)}
                </Text>

                <View style={styles.detailRow}>
                  <Icon
                    name={
                      petData?.gender?.toLowerCase() === 'female'
                        ? 'gender-female'
                        : 'gender-male'
                    }
                    size={18}
                    color="#000"
                  />
                  <Text style={styles.detailText}>
                    {capitalizeFirstLetter(petData?.gender) || 'Unknown'},{' '}
                    {capitalizeFirstLetter(petData?.breed) || 'Unknown breed'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="details" size={20} color="#000" />
                  <Text style={styles.detailText}>
                    {petData?.bio || 'Bio not available'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={20} color="#000" />
                  <Text style={styles.detailText}>
                    {petData?.dob
                      ? new Date(petData.dob).toLocaleDateString()
                      : 'Birthdate unknown'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Owner Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pet Parent</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Pet Parent Form',{selectedPetId:selectedPetId});
                  }}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profileContainer}>
                <Image
                  source={{
                    uri:
                      `https://argosmob.com/being-petz/public/${ownerData?.profile}` ||
                      `https://argosmob.com/being-petz/public/${userData?.profile}` ||
                      'https://via.placeholder.com/150',
                  }}
                  style={styles.ownerImage}
                />
                <View style={styles.ownerTextContainer}>
                  <Text style={styles.ownerEmail}>
                    {`Name : ${ownerData?.first_name || ''} ${
                      ownerData?.last_name || ''
                    }`}
                  </Text>
                  <Text style={styles.ownerEmail}>
                    {`Email ID : ${
                      ownerData?.email ||
                      userData?.email ||
                      'Email not available'
                    }`}
                  </Text>
                  <Text style={styles.ownerEmail}>
                    {`Phone No : ${
                      ownerData?.phone || 'Phone No. not available'
                    }`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Options Section */}
            <View style={styles.optionsSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Add Pet')}
                style={styles.optionRow}>
                <View style={styles.optionContent}>
                  <Icon
                    name="plus-circle-outline"
                    size={24}
                    color="#000"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionTitle}>Add New Pet</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('QR', {data: petData?.unid})}
                style={styles.optionRow}>
                <View style={styles.optionContent}>
                  <Icon
                    name="qrcode"
                    size={24}
                    color="#000"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionTitle}>Generate QR Code</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionRow}>
                <View style={styles.optionContent}>
                  <Icon
                    name="trash-can-outline"
                    size={24}
                    color="#000"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.optionTitle}>Delete Your Profile</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Logout Button - Separate from other options for better visibility */}
            <View style={styles.logoutContainer}>
              <TouchableOpacity
                onPress={signOut}
                style={styles.logoutButton}>
                <View style={styles.optionContent}>
                  <Icon
                    name="logout"
                    size={24}
                    color="red"
                    style={styles.optionIcon}
                  />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </View>
                <Icon name="chevron-right" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80, // Increased padding
    paddingTop: 10,
    flexGrow: 1, // Ensures content fills the space
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editText: {
    color: 'purple',
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    borderColor: '#000',
    borderWidth: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderColor: '#000',
    borderWidth: 0.5,
    marginTop: 10,
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderColor: '#000',
    borderWidth: 0.5,
  },
  ownerTextContainer: {
    flex: 1,
  },
  ownerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  optionsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryText: {
    color: 'blue',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default More;
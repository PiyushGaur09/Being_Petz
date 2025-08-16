// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Alert,
//   Modal,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {useNavigation} from '@react-navigation/native';
// import {Menu, Divider, Provider, RadioButton} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ImagePicker from 'react-native-image-crop-picker';
// import {
//   requestCameraPermission,
//   requestGalleryPermission,
// } from './Components/Permission';
// import axios from 'axios';

// const AddPets = ({route}) => {
//   // const {selectedPetId} = route.params;
//   const navigation = useNavigation();
//   const [petName, setPetName] = useState();
//   const [petType, setPetType] = useState('Dog');
//   const [dateOfBirth, setDateOfBirth] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [aboutPet, setAboutPet] = useState('');
//   const [gender, setGender] = useState('');
//   const [petBreed, setPetBreed] = useState('');
//   const [userData, setUserData] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [imageUri, setImageUri] = useState(null);
//   const [currentPetDetail, setCurrentPetDetail] = useState(null);

//   // console.log(imageUri);

//   const getUserData = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('user_data');
//       if (jsonValue != null) {
//         const parsedData = JSON.parse(jsonValue);
//         setUserData(parsedData);
//         console.log('User Data:', parsedData);
//         return parsedData;
//       } else {
//         console.log('No user data found');
//         return null;
//       }
//     } catch (e) {
//       console.error('Error reading userData from AsyncStorage:', e);
//       return null;
//     }
//   };

//   const openCamera = async () => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) {
//       console.log('Camera permission not granted');
//       return;
//     }

//     ImagePicker.openCamera({
//       width: 300,
//       height: 400,
//       cropping: true,
//     })
//       .then(image => {
//         console.log('Camera Image:', image);
//         setImageUri(image.path);
//         // updateProfilePic(userData?.id, image.path);
//         setModalVisible(false);
//       })
//       .catch(error => {
//         console.log('Camera error:', error);
//         setModalVisible(false);
//       });
//   };

//   const openGallery = async () => {
//     const hasPermission = await requestGalleryPermission();
//     if (!hasPermission) {
//       console.log('Gallery permission not granted');
//       return;
//     }

//     ImagePicker.openPicker({
//       width: 300,
//       height: 400,
//       cropping: true,
//     })
//       .then(image => {
//         console.log('Gallery Image:', image);
//         setImageUri(image.path);
//         // updateProfilePic(userData?.id, image.path); // <-- Call API here
//         setModalVisible(false);
//       })
//       .catch(error => {
//         console.log('Gallery error:', error);
//         setModalVisible(false);
//       });
//   };

//   console.log('UserData', userData);
//   const addPet = async () => {
//     try {
//       const formData = new FormData();
//       formData.append('user_id', userData?.id);
//       formData.append('name', petName);
//       formData.append('type', petType);
//       formData.append('breed', petBreed);
//       formData.append('gender', gender);
//       formData.append('dob', dateOfBirth.toISOString().split('T')[0]);
//       formData.append('bio', aboutPet);

//       if (imageUri) {
//         formData.append('avatar', {
//           uri: imageUri,
//           type: 'image/jpeg',
//           name: 'avatar.jpg',
//         });
//       }

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/pet/add',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       console.log('Add Pet Response:', response.data);
//       Alert.alert('New Pet Added');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error adding pet:', error.response?.data || error.message);
//       Alert.alert(
//         'Failed to add pet',
//         error.response?.data?.message || error.message,
//       );
//     }
//   };

//   useEffect(() => {
//     getUserData();
//   }, []);

//   const pets = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'];
//   const genders = ['Male', 'Female', 'Unknown']; // Changed from 'Other' to 'unknown'

//   const onDateChange = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       setDateOfBirth(selectedDate);
//     }
//   };

//   return (
//     // <Provider>
//     <ScrollView contentContainerStyle={styles.container}>
//       <View
//         style={{
//           alignItems: 'center',
//           flexDirection: 'row',
//           // justifyContent: 'space-between',
//         }}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={24} color="#1E2123" />
//         </TouchableOpacity>
//         <Text style={styles.title}>Add New Pet</Text>
//       </View>
//       <View style={{alignItems: 'center'}}>
//         <View style={styles.profileOuterContainer}>
//           <View style={styles.profileContainer}>
//             <Image
//               source={{
//                 uri: imageUri,
//               }}
//               style={styles.profileImage}
//             />
//             <TouchableOpacity
//               style={styles.cameraIcon}
//               onPress={() => setModalVisible(true)}>
//               <Icon name="camera" size={24} color="#39434F" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Form Title */}
//       <Text style={styles.formTitle}>Fill Your Pet Details</Text>

//       {/* Pet Name */}
//       <Text style={styles.label}>Pet's name</Text>
//       <View style={styles.input}>
//         <TextInput
//           // style={styles.input}
//           placeholder="Enter pet name"
//           placeholderTextColor={'#2D384C'}
//           value={petName}
//           onChangeText={setPetName}
//         />
//       </View>

//       <Text style={styles.label}>Date of Birth</Text>
//       <View style={styles.input}>
//         <TouchableOpacity onPress={() => setShowDatePicker(true)}>
//           <Text style={{color: '#2D384C'}}>
//             {dateOfBirth.toLocaleDateString()}
//           </Text>
//         </TouchableOpacity>
//       </View>
//       {showDatePicker && (
//         <DateTimePicker
//           value={dateOfBirth}
//           mode="date"
//           display="default"
//           onChange={onDateChange}
//         />
//       )}

//       <View>
//         <Text style={styles.label}>Pet Type</Text>
//         <RadioButton.Group
//           onValueChange={value => setPetType(value)}
//           value={petType}>
//           <View style={styles.radioGrid2}>
//             {pets.map((gen, index) => (
//               <View key={gen} style={styles.radioWrapper2}>
//                 <TouchableOpacity
//                   style={styles.radioOption2}
//                   onPress={() => setPetType(gen)}>
//                   <RadioButton value={gen} />
//                   <Text style={styles.radioText2}>{gen}</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>
//         </RadioButton.Group>
//       </View>

//       <Text style={styles.label}>Pet's Breed</Text>
//       <View style={styles.input}>
//         <TextInput
//           // style={styles.input}
//           placeholderTextColor={'#2D384C'}
//           placeholder="Enter pet Breed"
//           value={petBreed}
//           onChangeText={setPetBreed}
//         />
//       </View>

//       <View>
//         <Text style={styles.label}>Gender</Text>
//         <RadioButton.Group
//           onValueChange={value => setGender(value)}
//           value={gender}>
//           <View style={styles.radioRow}>
//             {genders.map(gen => (
//               <TouchableOpacity
//                 key={gen}
//                 style={styles.radioOption}
//                 onPress={() => setGender(gen)}>
//                 <RadioButton value={gen} />
//                 <Text style={styles.radioText}>{gen}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </RadioButton.Group>
//       </View>

//       {/* About Pet */}
//       <Text style={styles.label}>Tell us something about Your Pet</Text>
//       <View style={[styles.input, styles.multilineInput]}>
//         <TextInput
//           placeholder="Describe your pet"
//           placeholderTextColor={'#2D384C'}
//           value={aboutPet}
//           onChangeText={setAboutPet}
//           multiline
//           numberOfLines={4}
//         />
//       </View>

//       {/* Confirm Button */}
//       <TouchableOpacity
//         onPress={() => {
//           addPet();
//         }}>
//         <LinearGradient
//           colors={['#8337B2', '#3B0060']} // adjust colors as needed
//           start={{x: 0, y: 0}}
//           end={{x: 1, y: 1}}
//           style={styles.confirmButton}>
//           <Text style={styles.confirmButtonText}>Confirm</Text>
//         </LinearGradient>
//       </TouchableOpacity>

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

//             <TouchableOpacity
//               style={[styles.modalButton, {backgroundColor: '#ccc'}]}
//               onPress={() => setModalVisible(false)}>
//               <Text style={styles.modalButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//     // </Provider>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     paddingBottom: 100,
//     backgroundColor: '#f8f8f8',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   newPetButton: {
//     alignSelf: 'flex-start',
//     marginBottom: 30,
//   },
//   newPetButtonText: {
//     fontSize: 16,
//     color: '#FF6B6B',
//     fontWeight: 'bold',
//   },
//   title: {
//     left: 15,
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 10,
//     color: '#1E2123',
//     marginLeft: '25%',
//   },
//   newPetButton: {
//     // position: 'absolute',
//     // top: 24,
//     // right: 10,
//     backgroundColor: '#8337B2',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//   },
//   newPetText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   profileOuterContainer: {
//     marginVertical: 30,
//     alignItems: 'center',
//     borderWidth: 0.8,
//     padding: 15,
//     borderRadius: 80,
//     borderColor: '#8337B2',
//   },

//   profileContainer: {
//     alignItems: 'center',
//     borderWidth: 0.8,
//     padding: 5,
//     borderRadius: 65,
//     borderColor: '#8337B2',
//   },
//   profileImage: {
//     // backgroundColor: 'red',
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
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   formTitle: {
//     fontSize: 18,
//     fontWeight: '500',
//     marginBottom: 20,
//     color: '#333',
//     alignSelf: 'center',
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     fontWeight: '400',
//     color: '#4A4A4A',
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     height: 50,
//     justifyContent: 'center',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     marginBottom: 20,
//     fontSize: 16,
//     // borderBottomColor: '#8337B2',
//     // borderBottomWidth: 5,
//     backgroundColor: '#fff',
//   },
//   multilineInput: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   confirmButton: {
//     backgroundColor: '#8337B2',
//     padding: 15,
//     borderRadius: 20,
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   confirmButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   radioRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },

//   radioOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 10,
//   },

//   radioText: {
//     fontSize: 16,
//     marginLeft: 4,
//     color: '#2D384C',
//   },

//   radioWrapper2: {
//     width: '33.33%', // 100% / 3 items per row
//     paddingVertical: 4,
//   },
//   radioGrid2: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },

//   radioWrapper: {
//     width: '33.33%', // 100% / 3 items per row
//     paddingVertical: 4,
//   },

//   radioOption2: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//   },

//   radioText2: {
//     color: '#2D384C',
//     fontSize: 16,
//     marginLeft: 4,
//   },
// });

// export default AddPets;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

// Breed data (same as provided)
const breedData = {
  dog: [
    'Affenpinscher',
    'Afghan Hound',
    'Airedale Terrier',
    'Akita',
    'Alaskan Malamute',
    'American Hairless Terrier',
    'American Staffordshire Terrier',
    'Anatolian Shepherd Dog',
    'Australian Cattle Dog',
    'Australian Kelpie',
    'Australian Silky Terrier',
    'Australian Stumpy Tail Cattle Dog',
    'Australian Terrier',
    'Azawakh',
    'Basenji',
    'Basset Fauve de Bretagne',
    'Basset Hound',
    'Beagle',
    'Bearded Collie',
    'Bedlington Terrier',
    'Belgian Shepherd Dog Groenendael',
    'Belgian Shepherd Dog Laekenois',
    'Belgian Shepherd Dog Malinois',
    'Belgian Shepherd Dog Tervuren',
    'Bergamasco Shepherd Dog',
    'Bernese Mountain Dog',
    'Bichon Frise',
    'Black and Tan Coonhound',
    'Bloodhound',
    'Bluetick Coonhound',
    'Border Collie',
    'Border Terrier',
    'Borzoi',
    'Boston Terrier',
    'Bouvier des Flandres',
    'Boxer',
    'Bracco Italiano',
    'Briard',
    'British Bulldog',
    'Brittany',
    'Bull Terrier',
    'Bullmastiff',
    'Cairn Terrier',
    'Canaan Dog',
    'Canadian Eskimo Dog',
    'Cane Corso',
    'Caucasian Shepherd Dog',
    'Cavalier King Charles Spaniel',
    'Cavoodle',
    'Central Asian Shepherd Dog',
    'Cesky',
    'Chesapeake Bay Retriever',
    'Chihuahua',
    'Chinese Crested Dog',
    'Chow Chow',
    'Clumber Spaniel',
    'Cocker spaniel',
    'Collie',
    'Coton De Tulear',
    'Curly Coated Retriever',
    'Dachschund',
    'Dalmatian',
    'Dandie Dinmont Terrier',
    'Deerhound',
    'Doberman',
    'Dogue de Bordeaux',
    'Dutch Shepherd Dog',
    'English Setter',
    'English Springer Spaniel',
    'English Toy Terrier',
    'Estrela Mountain Dog',
    'Eurasier',
    'Field Spaniel',
    'Finnish Lapphund',
    'Finnish Spitz',
    'Flat Coated Retriever',
    'Fox Terrier',
    'Foxhound',
    'French Bulldog',
    'German Hunting Terrier',
    'German Pinscher',
    'German Shepherd',
    'German Shorthaired Pointer',
    'German Spitz',
    'German Wirehaired Pointer',
    'Giant Schnauzer',
    'Glen of Imaal Terrier',
    'Golden Retriever',
    'Gordon Setter',
    'Grand Basset Griffon Vendeen',
    'Great Dane',
    'Greyhound',
    'Griffon Bruxellois',
    'Groodle',
    'Hamiltonstovare',
    'Harrier',
    'Havanese',
    'Hungarian Vizsla',
    'Hungarian Wirehaired Vizsla',
    'Indian Pariah Dog',
    'Indian Spitz',
    'Ibizan Hound',
    'Icelandic Sheepdog',
    'Irish Red and White Setter',
    'Irish Setter',
    'Irish Terrier',
    'Irish Water Spaniel',
    'Irish Wolfhound',
    'Italian Greyhound',
    'Italian Spinone',
    'Jack Russell Terrier',
    'Japanese Chin',
    'Japanese Spitz',
    'Kangal Shepherd Dog',
    'Keeshond',
    'Kerry Blue Terrier',
    'King Charles Spaniel',
    'Komondor',
    'Kuvasz',
    'Labradoodle',
    'Labrador Retriever',
    'Lagotto Romagnolo',
    'Lakeland Terrier',
    'Landseer (European Continental Type)',
    'Large Munsterlander',
    'Leonberger',
    'Lhasa Apso',
    'Lowchen',
    'Maltese',
    'Maltipoo',
    'Manchester Terrier',
    'Maremma Sheepdog',
    'Mastiff',
    'Miniature Bull Terrier',
    'Miniature Pinscher',
    'Miniature Poodle',
    'Miniature Schnauzer',
    'Neapolitan Mastiff',
    'Newfoundland',
    'Norfolk Terrier',
    'Norwegian Buhund',
    'Norwegian Elkhound',
    'Norwich Terrier',
    'Nova Scotia Duck Tolling Retriever',
    'Old English Sheepdog',
    'Otterhound',
    'Papillon',
    'Parson Russell Terrier',
    'Pekingese',
    'Peruvian Hairless Dog',
    'Petit Basset Griffon Vendeen',
    'Pharaoh Hound',
    'Pointer',
    'Polish Lowland Sheepdog',
    'Pomeranian',
    'Portuguese Podengo',
    'Portuguese Water Dog',
    'Pug',
    'Puli',
    'Pumi',
    'Pyrenean Mastiff',
    'Pyrenean Mountain Dog',
    'Rhodesian Ridgeback',
    'Rottweiler',
    'Russian Black Terrier',
    'Russian Toy',
    'Saint Bernard',
    'Saluki',
    'Samoyed',
    'Schipperke',
    'Schnoodle',
    'Scottish Terrier',
    'Sealyham Terrier',
    'Shar Pei',
    'Shetland Sheepdog',
    'Shiba Inu',
    'Shih Tzu',
    'Shih-poo',
    'Siberian Husky',
    'Skye Terrier',
    'Sloughi',
    'Soft Coated Wheaten Terrier',
    'Spanish Mastiff',
    'Spanish Water Dog',
    'Spoodle',
    'Staffordshire Bull Terrier',
    'Standard Poodle',
    'Standard Schnauzer',
    'Sussex Spaniel',
    'Swedish Lapphund',
    'Swedish Vallhund',
    'Tatra Shepherd Dog',
    'Tenterfield Terrier',
    'Tibetan Mastiff',
    'Tibetan Spaniel',
    'Tibetan Terrier',
    'Toy Poodle',
    'Weimaraner',
    'Welsh Corgi Cardigan',
    'Welsh Corgi Pembroke',
    'Welsh Springer Spaniel',
    'Welsh Terrier',
    'West Highland White Terrier',
    'Whippet',
    'White Swiss Shepherd Dog',
    'Wirehaired Slovakian Pointer',
    'Xoloitzcuintli',
    'Yorkshire terrier',
  ],
  cat: [
    'Abyssinian',
    'American Bobtail',
    'American Bobtail Shorthair',
    'American Curl',
    'American Curl Longhair',
    'American Shorthair',
    'American Wirehair',
    'Australian Mist',
    'Balinese',
    'Bengal',
    'Bengal Longhair',
    'Birman',
    'Bombay',
    'British Longhair',
    'British Shorthair',
    'Burmese',
    'Burmilla',
    'Burmilla Longhair',
    'Chartreux',
    'Chausie',
    'Cornish Rex',
    'Cymric',
    'Devon Rex',
    'Donskoy',
    'Egyptian Mau',
    'Exotic Shorthair',
    'Havana',
    'Highlander',
    'Highlander Shorthair',
    'Himalayan',
    'Japanese Bobtail',
    'Japanese Bobtail Longhair',
    'Khaomanee',
    'Korat',
    'Kurilian Bobtail',
    'Kurilian Bobtail Longhair',
    'LaPerm',
    'LaPerm Shorthair',
    'Lykoi',
    'Maine Coon',
    'Maine Coon Polydactyl',
    'Manx',
    'Minuet',
    'Minuet Longhair',
    'Munchkin',
    'Munchkin Longhair',
    'Nebelung',
    'Norwegian Forest',
    'Ocicat',
    'Oriental Longhair',
    'Oriental Shorthair',
    'Persian',
    'Peterbald',
    'Pixiebob',
    'Pixiebob Longhair',
    'Ragdoll',
    'Russian Blue',
    'Savannah',
    'Scottish Fold',
    'Scottish Fold Longhair',
    'Scottish Straight',
    'Selkirk Rex',
    'Selkirk Rex Longhair',
    'Siamese',
    'Siberian',
    'Singapura',
    'Snowshoe',
    'Somali',
    'Sphynx',
    'Tennessee Rex',
    'Thai',
    'Tonkinese',
    'Toyger',
    'Turkish Angora',
    'Turkish Van',
  ],
  rabbit: [
    'American',
    'American Chinchilla',
    'American Fuzzy Lop',
    'American Sable',
    'Argente Brun',
    'Belgian Hare',
    'Beveren',
    'Blanc de Hotot',
    'Blue Holicer',
    'Britannia Petite',
    'Californian',
    'Cavies',
    'Champagne d’Argent',
    'Checkered Giant',
    'Cinnamon',
    'Creme d’Argent',
    'Czech Frosty',
    'Dutch',
    'Dwarf Hotot',
    'Dwarf Papillon',
    'English Angora',
    'English Lop',
    'English Spot',
    'Flemish Giant',
    'Florida White',
    'French Angora',
    'French Lop',
    'Giant Angora',
    'Giant Chinchilla',
    'Harlequin',
    'Havana',
    'Himalayan',
    'Holland Lop',
    'Jersey Wooly',
    'Lilac',
    'Lionhead',
    'Mini Lop',
    'Mini Rex',
    'Mini Satin',
    'Netherland Dwarf',
    'New Zealand',
    'Palomino',
    'Polish',
    'Rex',
    'Rhinelander',
    'Satin',
    'Satin Angora',
    'Silver',
    'Silver Fox',
    'Silver Marten',
    'Standard Chinchilla',
    'Tan',
    'Thrianta',
  ],
  bird: [
    'Amazon parrot',
    'Australian zebra finch',
    'Budgerigar',
    'Budgie',
    'Caique',
    'Canary',
    'Cockatiel',
    'Cockatoo',
    'Dove',
    'Finch',
    'Green-cheeked parakeet',
    'Grey parrot',
    'Hyacinth macaw',
    'Lovebird',
    'Lovebirds',
    'Moluccan eclectus',
    'Monk parakeet',
    'Piegon',
    'Parakeet',
    'Parrot',
    'Parrotlet',
    'Pionus parrots',
    'Ring-necked dove',
    'Rose-ringed parakeet',
    'Sun conure',
  ],
  fish: [
    'Angelfish',
    'Betta',
    'Bettas',
    'Catfish',
    'Cherry barb',
    'Corydoras',
    'Goldfish',
    'Guppies',
    'Guppy',
    'Harlequin rasbora',
    'Kuhli loach',
    'Mollies',
    'Molly',
    'Neon tetra',
    'Pearl gourami',
    'Platies',
    'Platy',
    'Slender danios',
    'Swordtails',
    'Tetra',
    'Tiger barb',
    'White Cloud Mountain minnow',
    'Zebra danio',
    'Flowerhorn',
    'Pearl Gourami',
    'Silver Angelfish',
    'Zebrafish/Zebra Danio',
    'Goldeneye Cichlid',
    'Black Skirt Tetra',
    'Rainbow Platy',
    'Albino Corydoras',
    'Common Molly',
    'Fighter',
  ],
};

const AddPets = ({route}) => {
  const navigation = useNavigation();
  const [petName, setPetName] = useState();
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aboutPet, setAboutPet] = useState('');
  const [gender, setGender] = useState('');
  const [userData, setUserData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [currentPetDetail, setCurrentPetDetail] = useState(null);

  // Dropdown states
  const [petTypeOpen, setPetTypeOpen] = useState(false);
  const [petTypeValue, setPetTypeValue] = useState('dog');
  const [petTypeItems, setPetTypeItems] = useState([
    {label: 'Dog', value: 'dog'},
    {label: 'Cat', value: 'cat'},
    {label: 'Rabbit', value: 'rabbit'},
    {label: 'Bird', value: 'bird'},
    {label: 'Fish', value: 'fish'},
  ]);

  const [breedOpen, setBreedOpen] = useState(false);
  const [breedValue, setBreedValue] = useState(null);
  const [breedItems, setBreedItems] = useState([]);

  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState(null);
  const [genderItems, setGenderItems] = useState([
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Unknown', value: 'unknown'},
  ]);

  // Update breed dropdown when pet type changes
  useEffect(() => {
    if (petTypeValue) {
      const breedsForType = breedData[petTypeValue] || [];
      setBreedItems(breedsForType.map(breed => ({label: breed, value: breed})));
      setBreedValue(null); // Reset breed selection when pet type changes
    }
  }, [petTypeValue]);

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_data');
      if (jsonValue != null) {
        const parsedData = JSON.parse(jsonValue);
        setUserData(parsedData);
        return parsedData;
      }
    } catch (e) {
      console.error('Error reading userData:', e);
    }
  };

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
      setImageUri(image.path);
      setModalVisible(false);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
      }
      setModalVisible(false);
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setImageUri(image.path);
      setModalVisible(false);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery error:', error);
      }
      setModalVisible(false);
    }
  };

  const addPet = async () => {
    if (!petName || !petTypeValue || !breedValue || !genderValue) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userData?.id);
      formData.append('name', petName);
      formData.append('type', petTypeValue);
      formData.append('breed', breedValue);
      formData.append('gender', genderValue);
      formData.append('dob', dateOfBirth.toISOString().split('T')[0]);
      formData.append('bio', aboutPet);

      if (imageUri) {
        formData.append('avatar', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      }

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/add',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('Success', 'New Pet Added');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add pet',
      );
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E2123" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Pet</Text>
      </View>

      <View style={{alignItems: 'center'}}>
        <View style={styles.profileOuterContainer}>
          <View style={styles.profileContainer}>
            <Image source={{uri: imageUri}} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => setModalVisible(true)}>
              <Icon name="camera" size={24} color="#39434F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={styles.formTitle}>Fill Your Pet Details</Text>

      {/* Pet Name */}
      <Text style={styles.label}>Pet's name</Text>
      <View style={styles.input}>
        <TextInput
          placeholder="Enter pet name"
          placeholderTextColor={'#2D384C'}
          value={petName}
          onChangeText={setPetName}
        />
      </View>

      {/* Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.input}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={{color: '#2D384C'}}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Pet Type Dropdown */}
      <Text style={styles.label}>Pet Type</Text>
      <DropDownPicker
        open={petTypeOpen}
        value={petTypeValue}
        items={petTypeItems}
        setOpen={setPetTypeOpen}
        setValue={setPetTypeValue}
        setItems={setPetTypeItems}
        placeholder="Select pet type"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000}
        zIndexInverse={1000}
      />

      {/* Breed Dropdown */}
      <Text style={[styles.label, {marginTop: 20}]}>Pet's Breed</Text>
      <DropDownPicker
        open={breedOpen}
        value={breedValue}
        items={breedItems}
        setOpen={setBreedOpen}
        setValue={setBreedValue}
        setItems={setBreedItems}
        placeholder={petTypeValue ? 'Select breed' : 'First select pet type'}
        disabled={!petTypeValue}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={2000}
        zIndexInverse={2000}
        searchable={true}
      />

      {/* Gender Dropdown */}
      <Text style={[styles.label, {marginTop: 20}]}>Gender</Text>
      <DropDownPicker
        open={genderOpen}
        value={genderValue}
        items={genderItems}
        setOpen={setGenderOpen}
        setValue={setGenderValue}
        setItems={setGenderItems}
        placeholder="Select gender"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={1000}
        zIndexInverse={3000}
      />

      {/* About Pet */}
      <Text style={styles.label}>Tell us something about Your Pet</Text>
      <View style={[styles.input, styles.multilineInput]}>
        <TextInput
          placeholder="Describe the pet"
          placeholderTextColor={'#2D384C'}
          value={aboutPet}
          onChangeText={setAboutPet}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity onPress={addPet}>
        <LinearGradient
          colors={['#8337B2', '#3B0060']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Image Picker Modal */}
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

            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: '#ccc'}]}
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#f8f8f8',
  },
  title: {
    left: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#1E2123',
    marginLeft: '25%',
  },
  profileOuterContainer: {
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 0.8,
    padding: 15,
    borderRadius: 80,
    borderColor: '#8337B2',
  },
  profileContainer: {
    alignItems: 'center',
    borderWidth: 0.8,
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
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    color: '#333',
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '400',
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 20,
    marginBottom: 20,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 20,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPets;

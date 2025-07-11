// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {Picker} from '@react-native-picker/picker';
// import {useNavigation} from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import FriendRequestsModal from './Components/FriendRequestsModal';

// // Breed data organized by pet type
// const breedData = {
//   dog: [
//     'Affenpinscher',
//     'Afghan Hound',
//     'Airedale Terrier',
//     'Akita',
//     'Alaskan Malamute',
//     'American Hairless Terrier',
//     'American Staffordshire Terrier',
//     'Anatolian Shepherd Dog',
//     'Australian Cattle Dog',
//     'Australian Kelpie',
//     'Australian Silky Terrier',
//     'Australian Stumpy Tail Cattle Dog',
//     'Australian Terrier',
//     'Azawakh',
//     'Basenji',
//     'Basset Fauve de Bretagne',
//     'Basset Hound',
//     'Beagle',
//     'Bearded Collie',
//     'Bedlington Terrier',
//     'Belgian Shepherd Dog Groenendael',
//     'Belgian Shepherd Dog Laekenois',
//     'Belgian Shepherd Dog Malinois',
//     'Belgian Shepherd Dog Tervuren',
//     'Bergamasco Shepherd Dog',
//     'Bernese Mountain Dog',
//     'Bichon Frise',
//     'Black and Tan Coonhound',
//     'Bloodhound',
//     'Bluetick Coonhound',
//     'Border Collie',
//     'Border Terrier',
//     'Borzoi',
//     'Boston Terrier',
//     'Bouvier des Flandres',
//     'Boxer',
//     'Bracco Italiano',
//     'Briard',
//     'British Bulldog',
//     'Brittany',
//     'Bull Terrier',
//     'Bullmastiff',
//     'Cairn Terrier',
//     'Canaan Dog',
//     'Canadian Eskimo Dog',
//     'Cane Corso',
//     'Caucasian Shepherd Dog',
//     'Cavalier King Charles Spaniel',
//     'Cavoodle',
//     'Central Asian Shepherd Dog',
//     'Cesky',
//     'Chesapeake Bay Retriever',
//     'Chihuahua',
//     'Chinese Crested Dog',
//     'Chow Chow',
//     'Clumber Spaniel',
//     'Cocker spaniel',
//     'Collie',
//     'Coton De Tulear',
//     'Curly Coated Retriever',
//     'Dachschund',
//     'Dalmatian',
//     'Dandie Dinmont Terrier',
//     'Deerhound',
//     'Doberman',
//     'Dogue de Bordeaux',
//     'Dutch Shepherd Dog',
//     'English Setter',
//     'English Springer Spaniel',
//     'English Toy Terrier',
//     'Estrela Mountain Dog',
//     'Eurasier',
//     'Field Spaniel',
//     'Finnish Lapphund',
//     'Finnish Spitz',
//     'Flat Coated Retriever',
//     'Fox Terrier',
//     'Foxhound',
//     'French Bulldog',
//     'German Hunting Terrier',
//     'German Pinscher',
//     'German Shepherd',
//     'German Shorthaired Pointer',
//     'German Spitz',
//     'German Wirehaired Pointer',
//     'Giant Schnauzer',
//     'Glen of Imaal Terrier',
//     'Golden Retriever',
//     'Gordon Setter',
//     'Grand Basset Griffon Vendeen',
//     'Great Dane',
//     'Greyhound',
//     'Griffon Bruxellois',
//     'Groodle',
//     'Hamiltonstovare',
//     'Harrier',
//     'Havanese',
//     'Hungarian Vizsla',
//     'Hungarian Wirehaired Vizsla',
//     'Indian Pariah Dog',
//     'Indian Spitz',
//     'Ibizan Hound',
//     'Icelandic Sheepdog',
//     'Irish Red and White Setter',
//     'Irish Setter',
//     'Irish Terrier',
//     'Irish Water Spaniel',
//     'Irish Wolfhound',
//     'Italian Greyhound',
//     'Italian Spinone',
//     'Jack Russell Terrier',
//     'Japanese Chin',
//     'Japanese Spitz',
//     'Kangal Shepherd Dog',
//     'Keeshond',
//     'Kerry Blue Terrier',
//     'King Charles Spaniel',
//     'Komondor',
//     'Kuvasz',
//     'Labradoodle',
//     'Labrador Retriever',
//     'Lagotto Romagnolo',
//     'Lakeland Terrier',
//     'Landseer (European Continental Type)',
//     'Large Munsterlander',
//     'Leonberger',
//     'Lhasa Apso',
//     'Lowchen',
//     'Maltese',
//     'Maltipoo',
//     'Manchester Terrier',
//     'Maremma Sheepdog',
//     'Mastiff',
//     'Miniature Bull Terrier',
//     'Miniature Pinscher',
//     'Miniature Poodle',
//     'Miniature Schnauzer',
//     'Neapolitan Mastiff',
//     'Newfoundland',
//     'Norfolk Terrier',
//     'Norwegian Buhund',
//     'Norwegian Elkhound',
//     'Norwich Terrier',
//     'Nova Scotia Duck Tolling Retriever',
//     'Old English Sheepdog',
//     'Otterhound',
//     'Papillon',
//     'Parson Russell Terrier',
//     'Pekingese',
//     'Peruvian Hairless Dog',
//     'Petit Basset Griffon Vendeen',
//     'Pharaoh Hound',
//     'Pointer',
//     'Polish Lowland Sheepdog',
//     'Pomeranian',
//     'Portuguese Podengo',
//     'Portuguese Water Dog',
//     'Pug',
//     'Puli',
//     'Pumi',
//     'Pyrenean Mastiff',
//     'Pyrenean Mountain Dog',
//     'Rhodesian Ridgeback',
//     'Rottweiler',
//     'Russian Black Terrier',
//     'Russian Toy',
//     'Saint Bernard',
//     'Saluki',
//     'Samoyed',
//     'Schipperke',
//     'Schnoodle',
//     'Scottish Terrier',
//     'Sealyham Terrier',
//     'Shar Pei',
//     'Shetland Sheepdog',
//     'Shiba Inu',
//     'Shih Tzu',
//     'Shih-poo',
//     'Siberian Husky',
//     'Skye Terrier',
//     'Sloughi',
//     'Soft Coated Wheaten Terrier',
//     'Spanish Mastiff',
//     'Spanish Water Dog',
//     'Spoodle',
//     'Staffordshire Bull Terrier',
//     'Standard Poodle',
//     'Standard Schnauzer',
//     'Sussex Spaniel',
//     'Swedish Lapphund',
//     'Swedish Vallhund',
//     'Tatra Shepherd Dog',
//     'Tenterfield Terrier',
//     'Tibetan Mastiff',
//     'Tibetan Spaniel',
//     'Tibetan Terrier',
//     'Toy Poodle',
//     'Weimaraner',
//     'Welsh Corgi Cardigan',
//     'Welsh Corgi Pembroke',
//     'Welsh Springer Spaniel',
//     'Welsh Terrier',
//     'West Highland White Terrier',
//     'Whippet',
//     'White Swiss Shepherd Dog',
//     'Wirehaired Slovakian Pointer',
//     'Xoloitzcuintli',
//     'Yorkshire terrier',
//   ],
//   cat: [
//     'Abyssinian',
//     'American Bobtail',
//     'American Bobtail Shorthair',
//     'American Curl',
//     'American Curl Longhair',
//     'American Shorthair',
//     'American Wirehair',
//     'Australian Mist',
//     'Balinese',
//     'Bengal',
//     'Bengal Longhair',
//     'Birman',
//     'Bombay',
//     'British Longhair',
//     'British Shorthair',
//     'Burmese',
//     'Burmilla',
//     'Burmilla Longhair',
//     'Chartreux',
//     'Chausie',
//     'Cornish Rex',
//     'Cymric',
//     'Devon Rex',
//     'Donskoy',
//     'Egyptian Mau',
//     'Exotic Shorthair',
//     'Havana',
//     'Highlander',
//     'Highlander Shorthair',
//     'Himalayan',
//     'Japanese Bobtail',
//     'Japanese Bobtail Longhair',
//     'Khaomanee',
//     'Korat',
//     'Kurilian Bobtail',
//     'Kurilian Bobtail Longhair',
//     'LaPerm',
//     'LaPerm Shorthair',
//     'Lykoi',
//     'Maine Coon',
//     'Maine Coon Polydactyl',
//     'Manx',
//     'Minuet',
//     'Minuet Longhair',
//     'Munchkin',
//     'Munchkin Longhair',
//     'Nebelung',
//     'Norwegian Forest',
//     'Ocicat',
//     'Oriental Longhair',
//     'Oriental Shorthair',
//     'Persian',
//     'Peterbald',
//     'Pixiebob',
//     'Pixiebob Longhair',
//     'Ragdoll',
//     'Russian Blue',
//     'Savannah',
//     'Scottish Fold',
//     'Scottish Fold Longhair',
//     'Scottish Straight',
//     'Selkirk Rex',
//     'Selkirk Rex Longhair',
//     'Siamese',
//     'Siberian',
//     'Singapura',
//     'Snowshoe',
//     'Somali',
//     'Sphynx',
//     'Tennessee Rex',
//     'Thai',
//     'Tonkinese',
//     'Toyger',
//     'Turkish Angora',
//     'Turkish Van',
//   ],
//   rabbit: [
//     'American',
//     'American Chinchilla',
//     'American Fuzzy Lop',
//     'American Sable',
//     'Argente Brun',
//     'Belgian Hare',
//     'Beveren',
//     'Blanc de Hotot',
//     'Blue Holicer',
//     'Britannia Petite',
//     'Californian',
//     'Cavies',
//     'Champagne d’Argent',
//     'Checkered Giant',
//     'Cinnamon',
//     'Creme d’Argent',
//     'Czech Frosty',
//     'Dutch',
//     'Dwarf Hotot',
//     'Dwarf Papillon',
//     'English Angora',
//     'English Lop',
//     'English Spot',
//     'Flemish Giant',
//     'Florida White',
//     'French Angora',
//     'French Lop',
//     'Giant Angora',
//     'Giant Chinchilla',
//     'Harlequin',
//     'Havana',
//     'Himalayan',
//     'Holland Lop',
//     'Jersey Wooly',
//     'Lilac',
//     'Lionhead',
//     'Mini Lop',
//     'Mini Rex',
//     'Mini Satin',
//     'Netherland Dwarf',
//     'New Zealand',
//     'Palomino',
//     'Polish',
//     'Rex',
//     'Rhinelander',
//     'Satin',
//     'Satin Angora',
//     'Silver',
//     'Silver Fox',
//     'Silver Marten',
//     'Standard Chinchilla',
//     'Tan',
//     'Thrianta',
//   ],
//   bird: [
//     'Amazon parrot',
//     'Australian zebra finch',
//     'Budgerigar',
//     'Budgie',
//     'Caique',
//     'Canary',
//     'Cockatiel',
//     'Cockatoo',
//     'Dove',
//     'Finch',
//     'Green-cheeked parakeet',
//     'Grey parrot',
//     'Hyacinth macaw',
//     'Lovebird',
//     'Lovebirds',
//     'Moluccan eclectus',
//     'Monk parakeet',
//     'Piegon',
//     'Parakeet',
//     'Parrot',
//     'Parrotlet',
//     'Pionus parrots',
//     'Ring-necked dove',
//     'Rose-ringed parakeet',
//     'Sun conure',
//   ],
//   fish: [
//     'Angelfish',
//     'Betta',
//     'Bettas',
//     'Catfish',
//     'Cherry barb',
//     'Corydoras',
//     'Goldfish',
//     'Guppies',
//     'Guppy',
//     'Harlequin rasbora',
//     'Kuhli loach',
//     'Mollies',
//     'Molly',
//     'Neon tetra',
//     'Pearl gourami',
//     'Platies',
//     'Platy',
//     'Slender danios',
//     'Swordtails',
//     'Tetra',
//     'Tiger barb',
//     'White Cloud Mountain minnow',
//     'Zebra danio',
//     'Flowerhorn',
//     'Pearl Gourami',
//     'Silver Angelfish',
//     'Zebrafish/Zebra Danio',
//     'Goldeneye Cichlid',
//     'Black Skirt Tetra',
//     'Rainbow Platy',
//     'Albino Corydoras',
//     'Common Molly',
//     'Fighter',
//   ],
// };

// const GiveForAdoption = () => {
//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [breeds, setBreeds] = useState([]);

//   const [formData, setFormData] = useState({
//     petName: '',
//     petType: '',
//     breed: '',
//     gender: '',
//     dobDate: new Date(),
//     description: '',
//   });

//   const handleInputChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });

//     // When pet type changes, update the breed list and reset selected breed
//     if (name === 'petType') {
//       setBreeds(breedData[value] || []);
//       setFormData(prev => ({
//         ...prev,
//         petType: value,
//         breed: '', // Reset breed when pet type changes
//       }));
//     }
//   };

//   const onDateChange = (event, selectedDate) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       handleInputChange('dobDate', selectedDate);
//     }
//   };

//   const handleSubmit = () => {
//     if (
//       !formData.petName ||
//       !formData.petType ||
//       !formData.breed ||
//       !formData.gender
//     ) {
//       Alert.alert('Error', 'Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setLoading(false);
//       navigation.navigate('GiveForAdoption2', {
//         petName: formData.petName,
//         petType: formData.petType,
//         breed: formData.breed,
//         gender: formData.gender,
//         dobDate: formData.dobDate.toDateString(),
//         description: formData.description,
//       });
//     }, 1000);
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       {/* Form Header */}
//       <Text style={styles.header}>Fill Your Pet Details</Text>

//       {/* Pet Name */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Pet Name</Text>
//         <TextInput
//           style={styles.input}
//           value={formData.petName}
//           onChangeText={text => handleInputChange('petName', text)}
//           placeholder="Enter your pet's name"
//         />
//       </View>

//       {/* Pet Type */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Pet Type</Text>
//         <Picker
//           mode="dropdown"
//           selectedValue={formData.petType}
//           onValueChange={value => handleInputChange('petType', value)}
//           style={styles.picker}>
//           <Picker.Item label="Select Pet Type" value="" />
//           <Picker.Item label="Dog" value="dog" />
//           <Picker.Item label="Cat" value="cat" />
//           <Picker.Item label="Rabbit" value="rabbit" />
//           <Picker.Item label="Bird" value="bird" />
//           <Picker.Item label="Fish" value="fish" />
//         </Picker>
//       </View>

//       {/* Breed - Dynamic based on pet type */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Breed</Text>
//         <Picker
//           mode="dropdown"
//           selectedValue={formData.breed}
//           onValueChange={value => handleInputChange('breed', value)}
//           style={styles.picker}
//           enabled={!!formData.petType} // Disable if no pet type selected
//         >
//           <Picker.Item
//             label={formData.petType ? 'Select Breed' : 'First select Pet Type'}
//             value=""
//           />
//           {breeds.map((breed, index) => (
//             <Picker.Item key={index} label={breed} value={breed} />
//           ))}
//         </Picker>
//       </View>

//       {/* Gender */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Gender</Text>
//         <Picker
//           mode="dropdown"
//           selectedValue={formData.gender}
//           onValueChange={value => handleInputChange('gender', value)}
//           style={styles.picker}>
//           <Picker.Item label="Select Gender" value="" />
//           <Picker.Item label="Male" value="male" />
//           <Picker.Item label="Female" value="female" />
//         </Picker>
//       </View>

//       {/* Date of Birth */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Date of Birth</Text>
//         <TouchableOpacity
//           style={styles.dateInput}
//           onPress={() => setShowDatePicker(true)}>
//           <Text>{formData.dobDate.toDateString()}</Text>
//           <Icon name="calendar" size={20} color="#555" />
//         </TouchableOpacity>
//       </View>

//       {showDatePicker && (
//         <DateTimePicker
//           value={formData.dobDate}
//           mode="date"
//           display="default"
//           maximumDate={new Date()}
//           onChange={onDateChange}
//         />
//       )}

//       {/* Description */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>About Your Pet</Text>
//         <TextInput
//           style={[styles.input, styles.multilineInput]}
//           value={formData.description}
//           onChangeText={text => handleInputChange('description', text)}
//           placeholder="Tell us something about your pet"
//           multiline
//           numberOfLines={4}
//         />
//       </View>

//       {/* Submit Button */}
//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleSubmit}
//         disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.submitButtonText}>Next</Text>
//         )}
//       </TouchableOpacity>

//       <FriendRequestsModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f8f8',
//   },
//   content: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#8337B2',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#555',
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//   },
//   picker: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//   },
//   dateInput: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   multilineInput: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   submitButton: {
//     backgroundColor: '#8337B2',
//     padding: 15,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default GiveForAdoption;

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FriendRequestsModal from './Components/FriendRequestsModal';
import LinearGradient from 'react-native-linear-gradient';

// Breed data organized by pet type
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

const GiveForAdoption = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for dropdowns
  const [petTypeOpen, setPetTypeOpen] = useState(false);
  const [petTypeValue, setPetTypeValue] = useState(null);
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
  ]);

  const [formData, setFormData] = useState({
    petName: '',
    dobDate: new Date(),
    description: '',
  });

  // Update breed dropdown when pet type changes
  React.useEffect(() => {
    if (petTypeValue) {
      const breedsForType = breedData[petTypeValue] || [];
      setBreedItems(breedsForType.map(breed => ({label: breed, value: breed})));
      setBreedValue(null); // Reset breed selection when pet type changes
    } else {
      setBreedItems([]);
    }
  }, [petTypeValue]);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('dobDate', selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!formData.petName || !petTypeValue || !breedValue || !genderValue) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const completeFormData = {
      ...formData,
      petType: petTypeValue,
      breed: breedValue,
      gender: genderValue,
    };

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('GiveForAdoption2', {
        petName: completeFormData.petName,
        petType: completeFormData.petType,
        breed: completeFormData.breed,
        gender: completeFormData.gender,
        dobDate: completeFormData.dobDate.toDateString(),
        description: completeFormData.description,
      });
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Form Header */}
      <Text style={styles.header}>Fill Your Pet Details</Text>

      {/* Pet Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name</Text>
        <TextInput
          style={styles.input}
          value={formData.petName}
          onChangeText={text => handleInputChange('petName', text)}
          placeholder="Enter your pet's name"
        />
      </View>

      {/* Pet Type Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Type</Text>
        <DropDownPicker
          open={petTypeOpen}
          value={petTypeValue}
          items={petTypeItems}
          setOpen={setPetTypeOpen}
          setValue={setPetTypeValue}
          setItems={setPetTypeItems}
          placeholder="Select Pet Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={1000}
        />
      </View>

      {/* Breed Dropdown - Dynamic based on pet type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed</Text>
        <DropDownPicker
          open={breedOpen}
          value={breedValue}
          items={breedItems}
          setOpen={setBreedOpen}
          setValue={setBreedValue}
          setItems={setBreedItems}
          placeholder={petTypeValue ? 'Select Breed' : 'First select Pet Type'}
          disabled={!petTypeValue}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2000}
          zIndexInverse={2000}
          searchable={true}
        />
      </View>

      {/* Gender Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <DropDownPicker
          open={genderOpen}
          value={genderValue}
          items={genderItems}
          setOpen={setGenderOpen}
          setValue={setGenderValue}
          setItems={setGenderItems}
          placeholder="Select Gender"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000}
          zIndexInverse={3000}
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}>
          <Text>{formData.dobDate.toDateString()}</Text>
          <Icon name="calendar" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dobDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>About Your Pet</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.description}
          onChangeText={text => handleInputChange('description', text)}
          placeholder="Tell us something about your pet"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <LinearGradient
        colors={['#8337B2', '#3B0060']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.submitButton}>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 20,
    textAlign: 'center',
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
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GiveForAdoption;

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
  const [dateOfBirth, setDateOfBirth] = useState(null); // start as null to show placeholder
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aboutPet, setAboutPet] = useState('');
  const [userData, setUserData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  // Dropdown states
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
    {label: 'Unknown', value: 'unknown'},
  ]);

  // Helper to format date as DD/MM/YYYY
  const formatDateToDDMMYYYY = date => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatDateToYYYYMMDD = date => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // e.g. 20240212
  };

  // Update breed dropdown when pet type changes
  useEffect(() => {
    if (petTypeValue) {
      const breedsForType = breedData[petTypeValue] || [];
      setBreedItems(breedsForType.map(breed => ({label: breed, value: breed})));
      setBreedValue(null); // Reset breed selection when pet type changes
    }
  }, [petTypeValue]);

  // Close other dropdowns when one opens
  useEffect(() => {
    if (petTypeOpen) {
      setBreedOpen(false);
      setGenderOpen(false);
    }
  }, [petTypeOpen]);

  useEffect(() => {
    if (breedOpen) {
      setPetTypeOpen(false);
      setGenderOpen(false);
    }
  }, [breedOpen]);

  useEffect(() => {
    if (genderOpen) {
      setPetTypeOpen(false);
      setBreedOpen(false);
    }
  }, [genderOpen]);

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

      // send dob as DD/MM/YYYY (or empty string if not selected)
      const dobFormatted = dateOfBirth ? formatDateToYYYYMMDD(dateOfBirth) : '';
      formData.append('dob', dobFormatted);

      formData.append('bio', aboutPet);

      if (imageUri) {
        formData.append('avatar', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      }

      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/pet/add',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // log full response for debugging (you requested this)
      console.log('addPet response:', response);

      // Only show success + navigate when API returns a truthy status
      if (response?.data?.status) {
        Alert.alert('Success', 'New Pet Added');

        // Navigate based on route param
        if (
          route?.params?.screen === 'otp' ||
          route?.params?.screen == 'PetParentForm'
        ) {
          navigation.navigate('BottomNavigation');
        } else {
          navigation.goBack();
        }
      } else {
        // server returned an error status — log response and show message
        console.log('addPet failed, server response:', response);
        Alert.alert('Error', response?.data?.message || 'Failed to add pet');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      // prefer server message when available, otherwise show error.message
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to add pet',
      );
    }
  };

  // const addPet = async () => {
  //   if (!petName || !petTypeValue || !breedValue || !genderValue) {
  //     Alert.alert('Error', 'Please fill all required fields');
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append('user_id', userData?.id);
  //     formData.append('name', petName);
  //     formData.append('type', petTypeValue);
  //     formData.append('breed', breedValue);
  //     formData.append('gender', genderValue);

  //     // send dob as DD/MM/YYYY (or empty string if not selected)
  //     const dobFormatted = dateOfBirth ? formatDateToDDMMYYYY(dateOfBirth) : '';
  //     formData.append('dob', dobFormatted);

  //     formData.append('bio', aboutPet);

  //     if (imageUri) {
  //       formData.append('avatar', {
  //         uri: imageUri,
  //         type: 'image/jpeg',
  //         name: 'avatar.jpg',
  //       });
  //     }

  //     const response = await axios.post(
  //       'https://beingpetz.com/petz-info/public/api/v1/pet/add',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       },
  //     );

  //     console.log('Error', response);

  //     Alert.alert('Success', 'New Pet Added');

  //     // Navigate based on route param
  //     if (
  //       route?.params?.screen === 'otp' ||
  //       route?.params?.screen == 'PetParentForm'
  //     ) {
  //       navigation.navigate('BottomNavigation');
  //     } else {
  //       navigation.goBack();
  //     }
  //   } catch (error) {
  //     console.error('Error adding pet:', error);
  //     Alert.alert(
  //       'Error',
  //       error.response?.data?.message || 'Failed to add pet',
  //     );
  //   }
  // };

  useEffect(() => {
    getUserData();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // normalize to midnight
      const normalized = new Date(selectedDate);
      normalized.setHours(0, 0, 0, 0);
      setDateOfBirth(normalized);
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
            <Image
              source={{uri: imageUri || 'https://via.placeholder.com/100'}}
              style={styles.profileImage}
            />
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
          style={{color: '#111'}}
        />
      </View>

      {/* Date of Birth */}
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.input}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={[{color: dateOfBirth ? '#2D384C' : '#9E9E9E'}]}>
            {dateOfBirth ? formatDateToDDMMYYYY(dateOfBirth) : 'DD/MM/YYYY'}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Pet Type Dropdown */}
      <View
        style={[styles.dropdownWrapper, {zIndex: 3000, position: 'relative'}]}>
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
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Breed Dropdown */}
      <View
        style={[styles.dropdownWrapper, {zIndex: 2000, position: 'relative'}]}>
        <Text style={styles.label}>Pet's Breed</Text>
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
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Gender Dropdown */}
      <View
        style={[styles.dropdownWrapper, {zIndex: 1000, position: 'relative'}]}>
        <Text style={styles.label}>Gender</Text>
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
          listMode="SCROLLVIEW"
        />
      </View>

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
          style={{color: '#111'}}
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
  dropdownWrapper: {
    marginBottom: 20,
    // zIndex: 100, // This helps with the dropdown positioning
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 20,
    borderWidth: 1,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 20,
    borderWidth: 1,
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
  backButton: {
    padding: 8,
  },
});

export default AddPets;

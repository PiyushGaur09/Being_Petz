import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'https://argosmob.com/being-petz/public/api/v1';

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

/**
 * Helper to format Date -> DD/MM/YYYY
 */
const formatDate = date => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const isRemoteUrl = uri =>
  typeof uri === 'string' &&
  (uri.startsWith('http://') || uri.startsWith('https://'));

const ensureFileUri = uri => {
  if (!uri) return uri;
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
};

const EditPetInfo = ({route}) => {
  const {selectedPetId} = route.params || {};
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    gender: 'male',
    dob: null,
    bio: '',
    avatar: null,
  });

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

  const [genderOpen, setGenderOpen] = useState(false);
  const [genderValue, setGenderValue] = useState('male');
  const [genderItems, setGenderItems] = useState([
    {label: 'Male', value: 'male'},
    {label: 'Female', value: 'female'},
    {label: 'Unknown', value: 'unknown'},
  ]);

  const [breedOpen, setBreedOpen] = useState(false);
  const [breedValue, setBreedValue] = useState(null);
  const [breedItems, setBreedItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPetDetail, setCurrentPetDetail] = useState(null);

  // Ensure dropdowns do not overlap: close others when one opens
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

  // Update breed dropdown when pet type changes
  useEffect(() => {
    if (petTypeValue) {
      const breedsForType = breedData[petTypeValue] || [];
      setBreedItems(breedsForType.map(breed => ({label: breed, value: breed})));
      // Reset breedValue unless editing an existing pet (we'll set it once detail loads)
      if (!currentPetDetail) setBreedValue(null);
      else if (currentPetDetail.type !== petTypeValue) setBreedValue(null);
    }
  }, [petTypeValue, currentPetDetail]);

  // Populate form when details fetched
  useEffect(() => {
    if (currentPetDetail) {
      setFormData({
        name: currentPetDetail.name || '',
        type: currentPetDetail.type || 'dog',
        breed: currentPetDetail.breed || '',
        gender: currentPetDetail.gender || 'male',
        dob: currentPetDetail.dob ? new Date(currentPetDetail.dob) : null,
        bio: currentPetDetail.bio || '',
        avatar: currentPetDetail.avatar
          ? `https://argosmob.com/being-petz/public/${currentPetDetail.avatar}`
          : null,
      });
      setPetTypeValue(currentPetDetail.type || 'dog');
      setGenderValue(currentPetDetail.gender || 'male');
      setBreedValue(currentPetDetail.breed || null);
    }
  }, [currentPetDetail]);

  const fetchPetDetail = async () => {
    if (!selectedPetId) return;
    const fd = new FormData();
    fd.append('pet_id', selectedPetId);

    try {
      const response = await axios.post(`${BASE_URL}/pet/detail`, fd, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      const data = response?.data?.data ?? response?.data;
      if (data) {
        setCurrentPetDetail(data);
      } else {
        console.warn('No pet detail returned', response?.data);
      }
    } catch (error) {
      console.error('Error fetching pet detail:', error?.message || error);
    }
  };

  useEffect(() => {
    fetchPetDetail();
  }, [selectedPetId]);

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      });
      setFormData(prev => ({...prev, avatar: image.path}));
      setModalVisible(false);
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
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      });
      setFormData(prev => ({...prev, avatar: image.path}));
      setModalVisible(false);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery error:', error);
        Alert.alert('Error', 'Failed to select image');
      }
      setModalVisible(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({...prev, dob: selectedDate}));
    }
  };

  const updatePet = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter pet name');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('id', currentPetDetail?.id ?? selectedPetId);
      data.append('user_id', currentPetDetail?.user_id ?? '');
      data.append('name', formData.name);
      data.append('type', petTypeValue);
      data.append('breed', breedValue || '');
      data.append('gender', genderValue);
      const dobString = formData.dob
        ? new Date(formData.dob).toISOString().split('T')[0]
        : '';
      data.append('dob', dobString);
      data.append('bio', formData.bio || '');

      if (formData.avatar && !isRemoteUrl(formData.avatar)) {
        const uriForUpload = ensureFileUri(formData.avatar);
        data.append('avatar', {
          uri: uriForUpload,
          type: 'image/jpeg',
          name: `avatar_${Date.now()}.jpg`,
        });
      }

      const response = await axios.post(`${BASE_URL}/pet/update`, data, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data?.status) {
        Alert.alert('Success', 'Pet updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error?.response ?? error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update pet',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8337B2" />
        </TouchableOpacity>
        <Text style={styles.heading}>Edit Pet</Text>
      </View>

      <View style={styles.profileOuterContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri:
                formData.avatar ||
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/No_image_available_500_x_500.svg/750px-No_image_available_500_x_500.svg.png',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={() => setModalVisible(true)}>
            <Icon name="camera" size={24} color="#39434F" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.formTitle}>Update Pet Details</Text>

      {/* Pet Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet's Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pet name"
          value={formData.name}
          onChangeText={text => setFormData({...formData, name: text})}
        />
      </View>

      {/* Date of Birth */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}>
          <Text style={formData.dob ? styles.dateText : styles.datePlaceholder}>
            {formData.dob ? formatDate(formData.dob) : 'DD/MM/YYYY'}
          </Text>
          <Icon name="calendar" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Pet Type Dropdown - highest zIndex */}
      <View style={[styles.inputGroup, styles.dropdownWrapperHigh]}>
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
          dropDownContainerStyle={[styles.dropdownContainer, {zIndex: 7000}]}
          zIndex={7000}
          zIndexInverse={1000}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Breed Dropdown - middle zIndex */}
      <View style={[styles.inputGroup, styles.dropdownWrapperMid]}>
        <Text style={styles.label}>Breed</Text>
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
          dropDownContainerStyle={[styles.dropdownContainer, {zIndex: 6000}]}
          zIndex={6000}
          zIndexInverse={2000}
          searchable={true}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Gender Dropdown - lowest zIndex */}
      <View style={[styles.inputGroup, styles.dropdownWrapperLow]}>
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
          dropDownContainerStyle={[styles.dropdownContainer, {zIndex: 5000}]}
          zIndex={5000}
          zIndexInverse={3000}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* About Pet */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>About Pet</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Describe your pet"
          value={formData.bio}
          onChangeText={text => setFormData({...formData, bio: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={updatePet}
        disabled={loading}>
        <LinearGradient colors={['#8337B2', '#3B0060']} style={styles.gradient}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Pet</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dob || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

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
  container: {flex: 1, backgroundColor: '#f8f8f8'},
  content: {padding: 20, paddingBottom: 40},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8337B2',
    marginLeft: '30%',
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
    backgroundColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {marginBottom: 20},
  label: {fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555'},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dropdown: {backgroundColor: '#fff', borderColor: '#ddd', borderRadius: 8},
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
  dateText: {color: '#111', fontSize: 16},
  datePlaceholder: {color: '#999', fontSize: 16},
  multilineInput: {minHeight: 100, textAlignVertical: 'top'},
  submitButton: {borderRadius: 8, overflow: 'hidden', marginTop: 20},
  gradient: {padding: 16, alignItems: 'center'},
  submitButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
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
  cancelButton: {backgroundColor: '#ccc'},
  modalButtonText: {color: '#fff', fontSize: 16},

  // wrappers to control zIndex stacking for DropDownPicker
  dropdownWrapperHigh: {
    zIndex: 7000,
    elevation: 7,
    // On iOS zIndex is sufficient; on Android elevation helps.
    position: 'relative',
  },
  dropdownWrapperMid: {zIndex: 6000, elevation: 6, position: 'relative'},
  dropdownWrapperLow: {zIndex: 5000, elevation: 5, position: 'relative'},
});

export default EditPetInfo;

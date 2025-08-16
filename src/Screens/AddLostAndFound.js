import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';

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
const AddLostAndFound = () => {
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('user_data');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setFormData(prev => ({
            ...prev,
            user_id: parsedData?.id?.toString() || '1',
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const [formData, setFormData] = useState({
    user_id: '',
    phone: '',
    report_type: 'lost',
    pet_type: 'dog',
    pet_gender: 'male',
    breed: '',
    pet_dob: '',
    about_pet: '',
    location: '',
    occurred_at: '',
    isVaccinated: '',
    isDewormed: '',
    isHealthy: '',
    images: [],
  });

  // Dropdown states
  const [reportTypeOpen, setReportTypeOpen] = useState(false);
  const [reportTypeValue, setReportTypeValue] = useState('lost');
  const [reportTypeItems, setReportTypeItems] = useState([
    {label: 'Lost', value: 'lost'},
    {label: 'Found', value: 'found'},
  ]);

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

  const [vaccinatedOpen, setVaccinatedOpen] = useState(false);
  const [vaccinatedValue, setVaccinatedValue] = useState(null);
  const [vaccinatedItems, setVaccinatedItems] = useState([
    {label: 'Yes', value: '0'},
    {label: 'No', value: '1'},
  ]);

  const [dewormedOpen, setDewormedOpen] = useState(false);
  const [dewormedValue, setDewormedValue] = useState(null);
  const [dewormedItems, setDewormedItems] = useState([
    {label: 'Yes', value: '0'},
    {label: 'No', value: '1'},
  ]);

  const [healthyOpen, setHealthyOpen] = useState(false);
  const [healthyValue, setHealthyValue] = useState(null);
  const [healthyItems, setHealthyItems] = useState([
    {label: 'Yes', value: '0'},
    {label: 'No', value: '1'},
  ]);

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  // Update breed dropdown when pet type changes
  useEffect(() => {
    if (petTypeValue) {
      const breedsForType = breedData[petTypeValue] || [];
      setBreedItems(breedsForType.map(breed => ({label: breed, value: breed})));
      setBreedValue(null); // Reset breed selection when pet type changes
    }
  }, [petTypeValue]);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async () => {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const newImages = images.map(image => ({
        uri: image.path,
        type: image.mime,
        name: image.filename || `image-${Date.now()}.jpg`,
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Image pick error:', error);
        Alert.alert('Error', 'Failed to pick images');
      }
    }
  };

  const removeImage = index => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      handleInputChange(dateField, formattedDate);
    }
  };

  const handleSubmit = async () => {
    if (!formData.images.length) {
      Alert.alert('Error', 'Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      // Combine all form data including dropdown values
      const completeFormData = {
        ...formData,
        report_type: reportTypeValue,
        pet_type: petTypeValue,
        pet_gender: genderValue,
        breed: breedValue,
        isVaccinated: vaccinatedValue,
        isDewormed: dewormedValue,
        isHealthy: healthyValue,
      };

      // Append all form fields
      Object.keys(completeFormData).forEach(key => {
        if (key === 'images') {
          completeFormData.images.forEach((image, index) => {
            data.append(`images[${index}]`, {
              uri: image.uri,
              type: image.type,
              name: image.name,
            });
          });
        } else if (
          completeFormData[key] !== null &&
          completeFormData[key] !== undefined
        ) {
          data.append(key, completeFormData[key]);
        }
      });

      const response = await axios.post(
        `${BASE_URL}/pet/lost-found/store`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status) {
        Alert.alert('Success', 'Report submitted successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              route.params?.onRefresh?.();
            },
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Failed to submit report',
        );
      }
    } catch (error) {
      console.log('Submission error:', error);
      Alert.alert('Error', 'An error occurred while submitting the report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Report Lost/Found Pet</Text>

      {/* Report Type Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Report Type</Text>
        <DropDownPicker
          open={reportTypeOpen}
          value={reportTypeValue}
          items={reportTypeItems}
          setOpen={setReportTypeOpen}
          setValue={setReportTypeValue}
          setItems={setReportTypeItems}
          placeholder="Select report type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={6000}
          zIndexInverse={1000}
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
          placeholder="Select pet type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={5000}
          zIndexInverse={2000}
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
          placeholder="Select gender"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={4000}
          zIndexInverse={3000}
        />
      </View>

      {/* Breed Dropdown */}
      <View style={styles.inputGroup}>
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
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={4000}
          searchable={true}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
          placeholder="Enter Phone"
          keyboardType="phone-pad"
        />
      </View>

      {/* Date of Birth (only for lost reports) */}
      {reportTypeValue === 'lost' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              setDateField('pet_dob');
              setShowDatePicker(true);
            }}>
            <Text>{formData.pet_dob || 'Select date'}</Text>
            <Icon name="calendar" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      )}

      {/* Vaccination Status (only for lost reports) */}
      {reportTypeValue === 'lost' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Is Vaccinated</Text>
          <DropDownPicker
            open={vaccinatedOpen}
            value={vaccinatedValue}
            items={vaccinatedItems}
            setOpen={setVaccinatedOpen}
            setValue={setVaccinatedValue}
            setItems={setVaccinatedItems}
            placeholder="Select vaccination status"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2500}
            zIndexInverse={3500}
          />
        </View>
      )}

      {/* Dewormed Status (only for lost reports) */}
      {reportTypeValue === 'lost' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Is Dewormed</Text>
          <DropDownPicker
            open={dewormedOpen}
            value={dewormedValue}
            items={dewormedItems}
            setOpen={setDewormedOpen}
            setValue={setDewormedValue}
            setItems={setDewormedItems}
            placeholder="Select deworming status"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={4000}
          />
        </View>
      )}

      {/* Health Status (only for lost reports) */}
      {reportTypeValue === 'lost' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Is Neutered</Text>
          <DropDownPicker
            open={healthyOpen}
            value={healthyValue}
            items={healthyItems}
            setOpen={setHealthyOpen}
            setValue={setHealthyValue}
            setItems={setHealthyItems}
            placeholder="Select health status"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1500}
            zIndexInverse={4500}
          />
        </View>
      )}

      {/* About Pet */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>About Pet</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.about_pet}
          onChangeText={text => handleInputChange('about_pet', text)}
          placeholder={
            reportTypeValue === 'lost'
              ? 'Describe the pet'
              : 'Describe the pet you found'
          }
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Location */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={text => handleInputChange('location', text)}
          placeholder={
            reportTypeValue === 'lost'
              ? 'Where was the pet lost?'
              : 'Where did you find the pet?'
          }
        />
      </View>

      {/* Occurred At */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {reportTypeValue === 'lost' ? 'Date Lost' : 'Date Found'}
        </Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setDateField('occurred_at');
            setShowDatePicker(true);
          }}>
          <Text>{formData.occurred_at || 'Select date'}</Text>
          <Icon name="calendar" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Image Upload */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Upload Photos</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}>
          <Icon name="camera" size={24} color="#8337B2" />
          <Text style={styles.uploadText}>Add Photos</Text>
        </TouchableOpacity>

        <View style={styles.imagePreviewContainer}>
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imagePreviewWrapper}>
              <Image
                source={{uri: image.uri}}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {reportTypeValue === 'lost'
              ? 'Submit Lost Report'
              : 'Contact Reporter'}
          </Text>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData[dateField] || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0e6ff',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadText: {
    color: '#8337B2',
    marginLeft: 10,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePreviewWrapper: {
    width: 80,
    height: 80,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

export default AddLostAndFound;

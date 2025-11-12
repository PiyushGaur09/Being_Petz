import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {Menu, Divider, Provider, RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  requestCameraPermission,
  requestGalleryPermission,
} from './Components/Permission';

const PetForm = () => {
  const navigation = useNavigation();
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [showPetTypeMenu, setShowPetTypeMenu] = useState(false);
  const [breed, setBreed] = useState('');
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aboutPet, setAboutPet] = useState('');
  const [gender, setGender] = useState('');
  const [pet, setPet] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  // const [imageUri, setImageUri] = useState(null);
  const [userData, setUserData] = useState({});

  const pets = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'];
  const genders = ['Male', 'Female', 'Other'];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_data');
      if (jsonValue != null) {
        const parsedData = JSON.parse(jsonValue);
        setUserData(parsedData);
        console.log('User Data:', parsedData);
        return parsedData;
      } else {
        console.log('No user data found');
        return null;
      }
    } catch (e) {
      console.error('Error reading userData from AsyncStorage:', e);
      return null;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('Camera permission not granted');
      return;
    }

    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        console.log('Camera Image:', image);
        // setImageUri(image.path);
        updateProfilePic(userData?.id, image.path); // <-- Call API here
        setModalVisible(false);
      })
      .catch(error => {
        console.log('Camera error:', error);
        setModalVisible(false);
      });
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      console.log('Gallery permission not granted');
      return;
    }

    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        console.log('Gallery Image:', image);
        // setImageUri(image.path);
        updateProfilePic(userData?.id, image.path); // <-- Call API here

        setModalVisible(false);
      })
      .catch(error => {
        console.log('Gallery error:', error);
        setModalVisible(false);
      });
  };

  const updateProfilePic = async (userId, imageUri) => {
    if (!imageUri || !userId) {
      console.log('No image or user ID provided');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('profile', {
        uri: imageUri,
        type: 'image/jpeg', // or 'image/png' if needed
        name: 'profile.jpg',
      });

      const response = await fetch(
        'https://beingpetz.com/petz-info/public/api/v1/auth/update-profile-picture', // <- adjust URL if needed
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const responseText = await response.text();
      console.log('Response Text:', responseText);

      try {
        const data = JSON.parse(responseText); // try parsing
        console.log('Parsed Response:', data);

        if (response.ok) {
          alert('Profile updated successfully!');
        } else {
          alert(data.message || 'Failed to update profile.');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        alert('Server returned invalid response!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading!');
    }
  };

  const handlePetUpdate = async () => {
    const formData = new FormData();
    formData.append('user_id', userData?.id);
    formData.append('name', petName);
    formData.append('type', petType);
    formData.append('breed');
    formData.append('gender', gender);
    formData.append('dob', dateOfBirth);
    formData.append('bio', aboutPet);
    formData.append('avatar', '77.1025');

    try {
      const response = await fetch(
        'https://beingpetz.com/petz-info/public/api/v1/pet/update',
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const json = await response.json();
      console.log('Update Profile Response:', json);
      navigation.navigate('Pet Form');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    // <Provider>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      {/* <Text style={styles.header}>Add Pet Profile</Text>
        <TouchableOpacity style={styles.newPetButton}>
          <Text style={styles.newPetButtonText}>+ New Pet</Text>
        </TouchableOpacity> */}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E2123" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Pet Profile</Text>
        <TouchableOpacity style={styles.newPetButton}>
          <Text style={styles.newPetText}>+ New Pet</Text>
        </TouchableOpacity>
      </View>
      <View style={{alignItems: 'center'}}>
        <View style={styles.profileOuterContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri: 'https://s3-alpha-sig.figma.com/img/233d/0e10/14d7cbe3ab43c4434f2c2388840475bb?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=i4fKVdtKjMxcyDLvszVnkDGoDKjsP5QzZy4TIPdR0OtFlX8SEVcZD9Pk44VhF6EF1Xg1JgcB4mGqI3cmH59y31sBLS~HVB5u~NYEUTr~vsjHUXcXnQ2~eHFRci0yPsqDUn2Nelo5NVv3QWjn3~S5UJaCeREqoWOUqW3lJQPjL7VAmgHvS5Nj2LFiz-o~P6vYUC-R3LdwdQCY98g5Sq2HeYzHiHhJ5Bz0JjMqMRQyoVnEofcpK9BmsAxbe~jhtSMHsNWMpDpPX5qAc83typu35DnaXl0fRkIrvR5npWHBFcW0A~6f44LhQw2oV5VpGJ8WKN8Exvojuv4sP4l-h~D7rA__',
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
      </View>

      {/* Form Title */}
      <Text style={styles.formTitle}>Fill Your Pet Details</Text>

      {/* Pet Name */}
      <Text style={styles.label}>Pet's name</Text>
      <View style={styles.input}>
        <TextInput
          // style={styles.input}
          placeholder="Enter pet name"
          value={petName}
          onChangeText={setPetName}
          style={{color: '#333'}}
        />
      </View>
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.input}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text>
            {dateOfBirth ? dateOfBirth?.toLocaleDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <View>
        <Text style={styles.label}>Pet Type</Text>
        <RadioButton.Group onValueChange={value => setPet(value)} value={pet}>
          <View style={styles.radioGrid2}>
            {pets.map((gen, index) => (
              <View key={gen} style={styles.radioWrapper2}>
                <TouchableOpacity
                  style={styles.radioOption2}
                  onPress={() => setPet(gen)}>
                  <RadioButton value={gen} />
                  <Text style={styles.radioText2}>{gen}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </RadioButton.Group>
      </View>

      <View>
        <Text style={styles.label}>Gender</Text>
        <RadioButton.Group
          onValueChange={value => setGender(value)}
          value={gender}>
          <View style={styles.radioRow}>
            {genders.map(gen => (
              <TouchableOpacity
                key={gen}
                style={styles.radioOption}
                onPress={() => setGender(gen)}>
                <RadioButton value={gen} />
                <Text style={styles.radioText}>{gen}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </RadioButton.Group>
      </View>

      {/* About Pet */}
      <Text style={styles.label}>Tell us something about Your Pet</Text>
      <View style={[styles.input, styles.multilineInput]}>
        <TextInput
          placeholder="Describe your pet"
          value={aboutPet}
          onChangeText={setAboutPet}
          multiline
          numberOfLines={4}
          style={{color: '#333'}}
        />
      </View>

      {/* Confirm Button */}
      <LinearGradient
        colors={['#8337B2', '#3B0060']} // adjust colors as needed
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.confirmButton}>
        <TouchableOpacity
          // style={styles.confirmButton}
          onPress={() => {
            navigation.navigate('BottomNavigation');
          }}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </LinearGradient>
      <TouchableOpacity
        style={{alignItems: 'center'}}
        onPress={() => {
          navigation.navigate('BottomNavigation');
        }}>
        <Text style={{color: '#8337B2', fontWeight: '600', fontSize: 18}}>
          Skip
        </Text>
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

            <TouchableOpacity
              style={[styles.modalButton, {backgroundColor: '#ccc'}]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    // </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  newPetButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  newPetButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  title: {
    left: 15,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#1E2123',
  },
  newPetButton: {
    // position: 'absolute',
    // top: 24,
    // right: 10,
    backgroundColor: '#8337B2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  newPetText: {
    color: '#fff',
    fontSize: 12,
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
    // backgroundColor: 'red',
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

  // cameraIcon: {
  //   padding: 10,
  //   backgroundColor: '#eee',
  //   borderRadius: 50,
  //   alignSelf: 'center',
  //   marginTop: 20,
  // },
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
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
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
    color: '#4A4A4A',
  },

  input: {
    borderWidth: 1,
    // borderColor: '#ddd',
    height: 50,
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    borderBottomColor: '#8337B2',
    borderBottomWidth: 5,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
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
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  radioText: {
    fontSize: 16,
    marginLeft: 4,
  },

  radioWrapper2: {
    width: '33.33%', // 100% / 3 items per row
    paddingVertical: 4,
  },
  radioGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  radioWrapper: {
    width: '33.33%', // 100% / 3 items per row
    paddingVertical: 4,
  },

  radioOption2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  radioText2: {
    fontSize: 16,
    marginLeft: 4,
  },
});

export default PetForm;

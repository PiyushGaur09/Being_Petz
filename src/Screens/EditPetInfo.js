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
import {Menu, Divider, Provider, RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from './Components/Permission';
import axios from 'axios';

const EditPetInfo = ({route}) => {
  const {selectedPetId} = route.params;
  const navigation = useNavigation();
  const [petName, setPetName] = useState();
  const [petType, setPetType] = useState('Dog');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [aboutPet, setAboutPet] = useState('');
  const [gender, setGender] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [userData, setUserData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [currentPetDetail, setCurrentPetDetail] = useState(null);

  // console.log(imageUri);

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

  console.log('Image URI:', imageUri);

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
        setImageUri(image.path);
        // updateProfilePic(userData?.id, image.path);
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
        setImageUri(image.path);
        setModalVisible(false);
      })
      .catch(error => {
        console.log('Gallery error:', error);
        setModalVisible(false);
      });
  };

  console.log('currentPetDetail', currentPetDetail);
  console.log('selectedPetId', selectedPetId);

  const addPet = async () => {
    try {
      const formData = new FormData();
      formData.append('id', currentPetDetail?.id); // Add the pet ID to update
      formData.append('user_id', currentPetDetail?.user_id);
      formData.append('name', petName);
      formData.append('type', petType);
      formData.append('breed', petBreed);
      formData.append('gender', gender);
      formData.append('dob', dateOfBirth.toISOString().split('T')[0]);
      formData.append('bio', aboutPet);

      if (imageUri && imageUri.startsWith('file://')) {
        formData.append('avatar', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `avatar_${Date.now()}.jpg`,
        });
      }

      console.log('peeee', formData);

      const response = await axios.post(
        'https://argosmob.uk/being-petz/public/api/v1/pet/update',
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Update Pet Response:', response.data);
      Alert.alert('Pet Updated Successfully');
      navigation.goBack();
    } catch (error) {
      console.error(
        'Error updating pet:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Failed to update pet',
        error.response?.data?.message || error.message,
      );
    }
  };

  const fetchPetDetail = async () => {
    const formData = new FormData();
    formData.append('pet_id', selectedPetId);

    try {
      const response = await fetch(
        'https://argosmob.uk/being-petz/public/api/v1/pet/detail',
        {
          method: 'POST',
          headers: {Accept: 'application/json'},
          body: formData,
        },
      );
      const data = await response.json();
      if (data?.data) {
        setCurrentPetDetail(data.data);
        // Set initial image URI with full URL
        if (data.data.avatar) {
          setImageUri(
            `https://argosmob.uk/being-petz/public/${data.data.avatar}`,
          );
        }
      }
    } catch (error) {
      console.error('Error fetching pet detail:', error.message);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const init = async () => {
      const user = await getUserData();
      if (selectedPetId) {
        await fetchPetDetail();
      }
    };
    init();
  }, [selectedPetId]);
  const pets = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'];
  const genders = ['male', 'female', 'Other'];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  useEffect(() => {
    if (currentPetDetail) {
      setPetName(currentPetDetail.name || '');
      setPetBreed(currentPetDetail.breed || '');
      setPetType(currentPetDetail.type || '');
      setGender(currentPetDetail.gender || '');
      setAboutPet(currentPetDetail.bio || '');
      setDateOfBirth(
        currentPetDetail.dob ? new Date(currentPetDetail.dob) : new Date(),
      );
      setImageUri(`https://argosmob.uk/being-petz/public/${currentPetDetail?.avatar}` || null);
    }
  }, [currentPetDetail]);

  // console.log('55556', currentPetDetail);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          // justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1E2123" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Pet</Text>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.navigate('Add Pet');
          }}
          style={styles.newPetButton}>
          <Text style={styles.newPetText}>+ New Pet</Text>
        </TouchableOpacity> */}
      </View>
      <View style={{alignItems: 'center'}}>
        <View style={styles.profileOuterContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri:
                  // `https://argosmob.uk/being-petz/public/${currentPetDetail?.avatar}` ||
                  imageUri,
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
      </View>

      {/* Form Title */}
      <Text style={styles.formTitle}>Update Pet Details</Text>

      {/* Pet Name */}
      <Text style={styles.label}>Pet's name</Text>
      <View style={styles.input}>
        <TextInput
          // style={styles.input}
          placeholder="Enter pet name"
          value={petName}
          onChangeText={setPetName}
        />
      </View>

      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.input}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text>{dateOfBirth.toLocaleDateString()}</Text>
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
        <RadioButton.Group
          onValueChange={value => setPetType(value)}
          value={petType}>
          <View style={styles.radioGrid2}>
            {pets.map((gen, index) => (
              <View key={gen} style={styles.radioWrapper2}>
                <TouchableOpacity
                  style={styles.radioOption2}
                  onPress={() => setPetType(gen)}>
                  <RadioButton value={gen} />
                  <Text style={styles.radioText2}>{gen}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </RadioButton.Group>
      </View>

      <Text style={styles.label}>Pet's Breed</Text>
      <View style={styles.input}>
        <TextInput
          // style={styles.input}
          placeholder="Enter pet Breed"
          value={petBreed}
          onChangeText={setPetBreed}
        />
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
        />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        onPress={() => {
          addPet();
        }}>
        <LinearGradient
          colors={['#8337B2', '#3B0060']} // adjust colors as needed
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Update Info</Text>
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
    marginLeft: '30%',
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

export default EditPetInfo;

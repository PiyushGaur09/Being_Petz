import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import FriendRequestsModal from './Components/FriendRequestsModal';
import CommonHeader from './Components/CommonHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const GiveForAdoption2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {petName, petType, breed, gender, dobDate, description} = route.params;

  const [vaccinationDone, setVaccinationDone] = useState('1');
  const [isHealthy, setIsHealthy] = useState('1');
  const [dewormed, setDewormed] = useState('1');
  const [isNeutered, setIsNeutered] = useState('1');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({});

  const formattedDob = new Date(dobDate).toISOString().split('T')[0]; // YYYY-MM-DD

  console.log('route ', userData);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
        } else {
          throw new Error('Invalid user data format');
        }
      } else {
        throw new Error('No user data found');
      }
    } catch (error) {
      console.log(error, 'Error fetching user data');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const pickImages = async () => {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        cropping: true,
      });

      if (images.length > 0) {
        setFeaturedImage(images[0]); // First image as featured
        setGalleryImages(images);
      }
    } catch (err) {
      console.log('Image picking cancelled or error', err);
    }
  };

  const handleSubmit = async () => {
    if (!featuredImage || galleryImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one image');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('user_id', userData?.id);
    formData.append('pet_name', petName);
    formData.append('pet_type', petType);
    formData.append('breed', breed);
    formData.append('gender', gender);
    formData.append('dob', formattedDob);
    formData.append('description', description);
    formData.append('about_pet', description);
    formData.append('is_healthy', '0');
    formData.append('vaccination_done', vaccinationDone);
    formData.append('location', 'noida');
    formData.append('latitude', '21.000886');
    formData.append('longitude', '70.8766544');
    formData.append('contact_phone', userData?.phone);
    formData.append('contact_email', userData?.email);
    formData.append('is_dewormed', dewormed);
    formData.append('is_neutered', isNeutered);

    // Add featured image
    formData.append('featured_image', {
      uri: featuredImage.path,
      name: `featured_${Date.now()}.jpg`,
      type: featuredImage.mime,
    });

    // Add gallery images
    galleryImages.forEach((image, index) => {
      formData.append(`gallery_images[${index}]`, {
        uri: image.path,
        name: `gallery_${index}_${Date.now()}.jpg`,
        type: image.mime,
      });
    });

    try {
      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/create-adoption',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        },
      );

      if (response.data?.status) {
        // Alert.alert('Success', 'Pet submitted for adoption successfully');
        // navigation.navigate('Add');
        navigation.navigate('BottomNavigation');
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);

      // Handle different error scenarios
      if (error.response) {
        if (error.response.data) {
          console.log('Error response data:', error.response.data);
          Alert.alert(
            'Error',
            error.response.data.message || 'Submission failed',
          );
        } else {
          Alert.alert('Error', `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        Alert.alert('Error', 'No response from server. Please try again.');
      } else {
        Alert.alert('Error', error.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Upload Images and Confirm</Text>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
          <Icon name="cloud-upload-outline" size={24} color="#555" />
          <Text style={styles.uploadText}>
            {featuredImage ? 'Change Images' : 'Upload Images'}
          </Text>
        </TouchableOpacity>

        {featuredImage && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.sectionTitle}>Featured Image:</Text>
            <View style={styles.imageWrapper}>
              <Image
                source={{uri: featuredImage.path}}
                style={styles.imagePreview}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.closeIconContainer}
                onPress={() => setFeaturedImage(null)}>
                <Icon name="close-circle" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Vaccination Done?</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            mode="dropdown"
            selectedValue={vaccinationDone}
            onValueChange={itemValue => setVaccinationDone(itemValue)}>
            <Picker.Item label="Yes" value="1" />
            <Picker.Item label="No" value="0" />
          </Picker>
        </View>

        {/* <Text style={styles.sectionTitle}>Is Healthy?</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            mode="dropdown"
            selectedValue={isHealthy}
            onValueChange={itemValue => setIsHealthy(itemValue)}>
            <Picker.Item label="Yes" value="1" />
            <Picker.Item label="No" value="0" />
          </Picker>
        </View> */}

        <Text style={styles.sectionTitle}>Is Dewormed?</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            mode="dropdown"
            selectedValue={dewormed}
            onValueChange={itemValue => setDewormed(itemValue)}>
            <Picker.Item label="Yes" value="1" />
            <Picker.Item label="No" value="0" />
          </Picker>
        </View>

        <Text style={styles.sectionTitle}>Is Neutered?</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            mode="dropdown"
            selectedValue={isNeutered}
            onValueChange={itemValue => setIsNeutered(itemValue)}>
            <Picker.Item label="Yes" value="1" />
            <Picker.Item label="No" value="0" />
          </Picker>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          {/* <TouchableOpacity
            style={[styles.button]}
            onPress={() => {
              navigation.goBack();
            }}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity> */}
          <LinearGradient
            colors={['#8337B2', '#3B0060']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.button}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity> */}
          <LinearGradient
            colors={['#8337B2', '#3B0060']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.button, loading && styles.disabledButton]}>
            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  uploadButton: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // elevation: 2,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',

    // borderBottomWidth: 5,
    // borderBottomColor: '#8337B2',
  },
  uploadText: {
    marginTop: 5,
    color: '#555',
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginVertical: 15,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 5,
    // right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    // borderWidth: 1,
    borderColor: '#ddd',

    // borderBottomWidth: 5,
    // borderBottomColor: '#8337B2',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
    width:'40%'
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GiveForAdoption2;

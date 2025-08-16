import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateCommunity = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    latitude: '',
    longitude: '',
    profile: null,
    cover_image: null,
    created_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [userData, setUserData] = useState({});

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
  // console.log('9999', name);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS handles permissions differently
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Location permission denied');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    Geolocation.getCurrentPosition(
      position => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setLocationLoading(false);
      },
      error => {
        console.log(error.code, error.message);
        setLocationError('Failed to get location');
        setLocationLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleImagePicker = async fieldName => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: fieldName === 'profile',
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      setFormData({
        ...formData,
        [fieldName]: {
          uri: image.path,
          type: image.mime,
          name: image.filename || `image_${Date.now()}.jpg`,
          width: image.width,
          height: image.height,
        },
      });
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        Alert.alert('Error', 'Failed to select image');
      }
    }
  };

  const handleCreateCommunity = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a community name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a community description');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      data.append('type', formData.type);
      data.append('latitude', formData.latitude || '0');
      data.append('longitude', formData.longitude || '0');
      data.append('created_by', userData?.id);

      if (formData.profile) {
        data.append('profile', {
          uri: formData.profile.uri,
          type: formData.profile.type || 'image/jpeg',
          name: formData.profile.name || 'profile.jpg',
        });
      }

      if (formData.cover_image) {
        data.append('cover_image', {
          uri: formData.cover_image.uri,
          type: formData.cover_image.type || 'image/jpeg',
          name: formData.cover_image.name || 'cover.jpg',
        });
      }

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/create',
        data,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 10000,
        },
      );

      if (response.data?.status) {
        Alert.alert('Success', 'Community created successfully!');
        navigation.goBack();
      } else {
        throw new Error(response.data?.message || 'Failed to create community');
      }
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Failed to create community';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Create New Community</Text>

      {/* Community Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Community Name<Text style={{color: 'red'}}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter community name"
          value={formData.name}
          onChangeText={text => setFormData({...formData, name: text})}
          maxLength={50}
        />
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Description<Text style={{color: 'red'}}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter community description"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={text => setFormData({...formData, description: text})}
          maxLength={200}
        />
      </View>

      {/* Community Type */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Community Type<Text style={{color: 'red'}}>*</Text>
        </Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.type === 'public' && styles.radioButtonSelected,
            ]}
            onPress={() => setFormData({...formData, type: 'public'})}>
            <Text style={styles.radioText}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              formData.type === 'private' && styles.radioButtonSelected,
            ]}
            onPress={() => setFormData({...formData, type: 'private'})}>
            <Text style={styles.radioText}>Private</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location (Optional)</Text>
        <View style={styles.row}>
          <View style={[styles.input, styles.halfInput, {marginRight: 10}]}>
            <TextInput
              placeholder="Latitude"
              keyboardType="numeric"
              value={formData.latitude}
              onChangeText={text =>
                setFormData({
                  ...formData,
                  latitude: text.replace(/[^0-9.-]/g, ''),
                })
              }
            />
          </View>
          <View style={[styles.input, styles.halfInput]}>
            <TextInput
              placeholder="Longitude"
              keyboardType="numeric"
              value={formData.longitude}
              onChangeText={text =>
                setFormData({
                  ...formData,
                  longitude: text.replace(/[^0-9.-]/g, ''),
                })
              }
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#8337B2" />
          ) : (
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          )}
        </TouchableOpacity>
        {locationError && <Text style={styles.errorText}>{locationError}</Text>}
      </View>

      {/* Profile Image */}
      <View style={[styles.inputContainer, {alignItems: 'center'}]}>
        <Text style={styles.label}>Profile Image</Text>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => handleImagePicker('profile')}>
          {formData.profile ? (
            <Image
              source={{uri: formData.profile.uri}}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="add-a-photo" size={30} color="#8337B2" />
              <Text style={styles.imagePlaceholderText}>
                Select Profile Image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Cover Image */}
      {/* <View style={styles.inputContainer}>
        <Text style={styles.label}>Cover Image</Text>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => handleImagePicker('cover_image')}>
          {formData.cover_image ? (
            <Image
              source={{uri: formData.cover_image.uri}}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="add-a-photo" size={30} color="#8337B2" />
              <Text style={styles.imagePlaceholderText}>
                Select Cover Image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View> */}

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={handleCreateCommunity}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Community</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8337B2',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  halfInput: {
    flex: 1,
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#8337B2',
    backgroundColor: '#f0e5ff',
  },
  radioText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  locationButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8337B2',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#8337B2',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  imagePicker: {
    height: 150,
    width: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#8337B2',
    fontSize: 14,
    textAlign:'center'
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    // resizeMode:'center'
  },
  createButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateCommunity;

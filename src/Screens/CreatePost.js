import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ALERT_TYPE, Toast} from 'react-native-alert-notification';
import axios from 'axios';

const CreatePost = () => {
  const navigation = useNavigation();
  const [postText, setPostText] = useState('');
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [isCropping, setIsCropping] = useState(false);

  const processImage = async imageUri => {
    try {
      const processed = await ImagePicker.openCropper({
        path: imageUri,
        // No IMAGE_SETTINGS used
      });
      return {
        uri: processed.path,
        type: 'image/jpeg',
        name: `photo_${Date.now()}_${Math.floor(Math.random() * 100000)}.jpg`,
        isVideo: false,
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  };

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const readMediaVideo = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          const readMediaImages = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          return (
            readMediaVideo === PermissionsAndroid.RESULTS.GRANTED &&
            readMediaImages === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to select media',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone for video recording',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    setShowMediaOptions(false);
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Permission required',
          textBody: 'Camera permission is needed to take photos',
        });
        return;
      }
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
      });
      const processed = await processImage(image.path);
      setMedia(prev => [...prev, processed]);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
        setError('Failed to capture photo');
      }
    }
  };

  const handleRecordVideo = async () => {
    setShowMediaOptions(false);
    try {
      const hasCameraPermission = await requestCameraPermission();
      const hasAudioPermission = await requestAudioPermission();
      if (!hasCameraPermission || !hasAudioPermission) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Permissions required',
          textBody: 'Camera and microphone permissions are needed to record videos',
        });
        return;
      }
      const video = await ImagePicker.openCamera({
        mediaType: 'video',
        compressVideoPreset: 'MediumQuality',
        maxDuration: 60,
      });

      if (video.duration > 60000) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Video too long',
          textBody: 'Please record a video of max 60 seconds.',
        });
        return;
      }

      setMedia(prev => [
        ...prev,
        {
          uri: video.path,
          type: video.mime,
          name: `video_${Date.now()}.${video.path.split('.').pop()}`,
          isVideo: true,
          duration: video.duration,
        },
      ]);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Video recording error:', error);
        setError('Failed to record video');
      }
    }
  };

  const handleSingleImageWithCrop = async () => {
    setShowMediaOptions(false);
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: false,
        cropping: true,
      });
      const processed = await processImage(image.path);
      setMedia(prev => [...prev, processed]);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Image selection error:', error);
        setError('Failed to select image');
      }
    }
  };

  const handleMultipleImagesWithCrop = async () => {
    setShowMediaOptions(false);
    try {
      const maxAllowed = 10 - media.length;
      if (maxAllowed <= 0) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Limit reached',
          textBody: 'You can only add up to 10 media items.',
        });
        return;
      }
      const images = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: true,
        maxFiles: maxAllowed,
      });

      setSelectedImages(Array.isArray(images) ? images : [images]);
      setCurrentCropIndex(0);
      setIsCropping(true);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Image selection error:', error);
        setError('Failed to select images');
      }
    }
  };

  const handleAddVideo = async () => {
    setShowMediaOptions(false);
    try {
      const video = await ImagePicker.openPicker({
        mediaType: 'video',
        multiple: media.length < 10,
        maxFiles: 10 - media.length,
      });

      const selectedArray = Array.isArray(video) ? video : [video];

      const tooLong = selectedArray.some(v => v.duration > 60000);
      if (tooLong) {
        Alert.alert('Video is too long');
        return;
      }

      const formatted = selectedArray.map(item => ({
        uri: item.path,
        type: item.mime,
        name: `video_${Date.now()}.${item.path.split('.').pop()}`,
        isVideo: true,
        duration: item.duration,
      }));

      setMedia(prev => [...prev, ...formatted]);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Video selection error:', error);
        setError('Failed to select video');
      }
    }
  };

  const handleCropCurrent = async () => {
    try {
      const currentImage = selectedImages[currentCropIndex];
      const processed = await processImage(currentImage.path);

      setMedia(prev => [...prev, processed]);

      if (currentCropIndex < selectedImages.length - 1) {
        setCurrentCropIndex(currentCropIndex + 1);
      } else {
        setIsCropping(false);
        setSelectedImages([]);
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Cropping error:', error);
        setError('Failed to crop image');
      }
      setIsCropping(false);
    }
  };

  const skipCropping = () => {
    const currentImage = selectedImages[currentCropIndex];
    setMedia(prev => [
      ...prev,
      {
        uri: currentImage.path,
        type: currentImage.mime,
        name: `photo_${Date.now()}.${currentImage.path.split('.').pop()}`,
        isVideo: false,
      },
    ]);

    if (currentCropIndex < selectedImages.length - 1) {
      setCurrentCropIndex(currentCropIndex + 1);
    } else {
      setIsCropping(false);
      setSelectedImages([]);
    }
  };

  const removeMedia = index => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!postText.trim() && media.length === 0) {
      setError('Please add text or media to post');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await fetchUserData();
      if (!user?.id) {
        throw new Error('User data not available');
      }

      const formData = new FormData();
      formData.append('parent_id', user.id);
      formData.append('content', postText);
      formData.append('is_public', '1');

      const featuredImage = media.find(item => !item.isVideo);
      const featuredVideo = media.find(item => item.isVideo);

      const otherImages = media.filter(
        item => !item.isVideo && (!featuredImage || item.uri !== featuredImage.uri),
      );

      const otherVideos = media.filter(
        item => item.isVideo && (!featuredVideo || item.uri !== featuredVideo.uri),
      );

      if (featuredImage) {
        formData.append('featured_image', {
          uri: featuredImage.uri,
          type: featuredImage.type,
          name: featuredImage.name,
        });
      }

      if (featuredVideo) {
        formData.append('featured_video', {
          uri: featuredVideo.uri,
          type: featuredVideo.type,
          name: featuredVideo.name,
        });
      }

      otherImages.forEach((image, index) => {
        formData.append(`post_images[${index}]`, {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });
      });

      otherVideos.forEach((video, index) => {
        formData.append(`post_videos[${index}]`, {
          uri: video.uri,
          type: video.type,
          name: video.name,
        });
      });

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Post created successfully!',
        });

        setPostText('');
        setMedia([]);
        navigation.goBack();
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Post creation error:', {
        message: error.message,
        response: error.response?.data,
      });
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={24} color="#8337B2" />
          </TouchableOpacity>
          <Text style={styles.heading}>Create a Post</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor="#8337B2"
            multiline
            value={postText}
            onChangeText={setPostText}
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Media preview */}
          {media.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaContainer}>
              {media.map((item, index) => (
                <View key={`${item.uri}-${index}`} style={styles.mediaPreview}>
                  {item.isVideo ? (
                    <View style={styles.videoContainer}>
                      <Icon name="play-circle" size={40} color="#fff" />
                      <Text style={styles.videoDurationText}>
                        {Math.floor(item.duration / 1000)}s
                      </Text>
                    </View>
                  ) : (
                    <Image source={{uri: item.uri}} style={styles.image} />
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeMedia(index)}>
                    <Icon name="close-circle" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Media buttons */}
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[
                styles.mediaButton,
                media.length >= 10 && styles.disabledButton,
              ]}
              onPress={() => setShowMediaOptions(true)}
              disabled={media.length >= 10}>
              <Icon
                name="image-outline"
                size={20}
                color={media.length >= 10 ? '#aaa' : '#fff'}
              />
              <Text style={styles.buttonText}>Add Media</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postButton}
              onPress={handlePost}
              disabled={isLoading || (!postText && media.length === 0)}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{height: 350}}>
            <Image
              style={{
                height: '90%',
                width: '90%',
                marginVertical: 24,
                alignSelf: 'center',
                resizeMode:'center'
              }}
              source={require('../Assests/Images/createPostIcon.png')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Media Options Modal */}
      <Modal
        visible={showMediaOptions}
        transparent={true}
        animationType="slide">
        <View style={styles.mediaOptionsContainer}>
          <View style={styles.mediaOptionsContent}>
            <Text style={styles.mediaOptionsTitle}>Select Media Type</Text>

            <View style={styles.mediaOptionsGroup}>
              <Text style={styles.mediaOptionsGroupTitle}>From Camera</Text>
              <TouchableOpacity
                style={styles.mediaOptionButton}
                onPress={handleTakePhoto}>
                <Icon name="camera-outline" size={24} color="#8337B2" />
                <Text style={styles.mediaOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaOptionButton}
                onPress={handleRecordVideo}>
                <Icon name="videocam-outline" size={24} color="#8337B2" />
                <Text style={styles.mediaOptionText}>Record Video</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mediaOptionsGroup}>
              <Text style={styles.mediaOptionsGroupTitle}>From Gallery</Text>
              <TouchableOpacity
                style={styles.mediaOptionButton}
                onPress={handleSingleImageWithCrop}>
                <Icon name="image-outline" size={24} color="#8337B2" />
                <Text style={styles.mediaOptionText}>
                  Single Photo with Cropping
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaOptionButton}
                onPress={handleMultipleImagesWithCrop}>
                <Icon name="images-outline" size={24} color="#8337B2" />
                <Text style={styles.mediaOptionText}>
                  Multiple Photos with Cropping
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaOptionButton}
                onPress={handleAddVideo}>
                <Icon name="videocam-outline" size={24} color="#8337B2" />
                <Text style={styles.mediaOptionText}>Select Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMediaOptions(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cropping Modal */}
      <Modal visible={isCropping} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Crop Image {currentCropIndex + 1} of {selectedImages.length}
            </Text>
            <Image
              source={{uri: selectedImages[currentCropIndex]?.path}}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.skipButton]}
                onPress={skipCropping}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cropButton]}
                onPress={handleCropCurrent}>
                <Text style={styles.cropButtonText}>Crop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... [unchanged styles from your previous code] ...
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  heading: {
    color: '#8337B2',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  input: {
    color: '#8337B2',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 140,
    maxHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8337B2',
  },
  mediaContainer: {
    paddingVertical: 8,
  },
  mediaPreview: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
    width: 100,
    height: 100,
  },
  image: { width: '100%', height: '100%' },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 2,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8337B2',
    padding: 14,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#8337B2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
    width: '48%',
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Media Options Modal Styles
  mediaOptionsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mediaOptionsContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  mediaOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 20,
    textAlign: 'center',
  },
  mediaOptionsGroup: {
    marginBottom: 15,
  },
  mediaOptionsGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    paddingLeft: 10,
  },
  mediaOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6fa',
  },
  mediaOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#f0e6fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8337B2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Cropping Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#8337B2',
  },
  modalImage: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#f0e6fa',
  },
  cropButton: {
    backgroundColor: '#8337B2',
  },
  skipButtonText: {
    color: '#8337B2',
    fontWeight: 'bold',
  },
  cropButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CreatePost;

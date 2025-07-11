import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';

const UpdatePostModal = ({visible, onClose, postData, onUpdateSuccess}) => {
  const [formData, setFormData] = useState({
    id: '',
    pet_id: '',
    content: '',
    is_public: '1',
    featured_image: null,
    post_images: [],
  });

  // console.log('powt', postData);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (postData) {
      setFormData({
        id: postData?.id?.toString() || postData?.repost?.id?.toString() || '',
        pet_id: postData?.parent?.id?.toString() || '',
        content: postData?.content || postData?.repost?.content || '',
        is_public: postData?.is_public?.toString() || postData?.repost?.is_public?.toString() || '1',
        featured_image: postData.featured_image
          ? {
              uri: `https://argosmob.uk/being-petz/public/${postData.featured_image}`,
              name: 'featured.jpg',
              type: 'image/jpeg',
            }
          : postData?.repost?.featured_image
          ? {
              uri: `https://argosmob.uk/being-petz/public/${postData?.repost?.featured_image}`,
              name: 'featured.jpg',
              type: 'image/jpeg',
            }
          : null,
        post_images: [],
      });
    }
  }, [postData]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSelectImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });
      const imageObj = {
        uri: image.path,
        type: image.mime,
        name: image.filename || `image_${Date.now()}.jpg`,
      };
      handleInputChange('post_images', [...formData.post_images, imageObj]);
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image');
      }
    }
  };

  const removeImage = index => {
    const updated = [...formData.post_images];
    updated.splice(index, 1);
    handleInputChange('post_images', updated);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('id', formData.id);
      data.append('parent_id', formData.pet_id);
      data.append('content', formData.content);
      data.append('is_public', formData.is_public);

      if (formData.featured_image?.uri?.startsWith('file')) {
        data.append('featured_image', formData.featured_image);
      }

      formData.post_images.forEach((img, index) =>
        data.append(`post_images[${index}]`, img),
      );

      const config = {
        headers: {'Content-Type': 'multipart/form-data'},
        timeout: 10000,
      };

      const response = await axios.post(
        'https://argosmob.uk/being-petz/public/api/v1/post/update',
        data,
        config,
      );

      Alert.alert('Success', 'Post updated!');
      onUpdateSuccess && onUpdateSuccess(response.data);
      onClose();
    } catch (err) {
      const message =
        err.code === 'ECONNABORTED'
          ? 'Request timed out.'
          : err.message === 'Network Error'
          ? 'Network error.'
          : err.response?.data?.message || 'Failed to update post.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderImage = (image, index) => (
    <View key={index} style={styles.mediaItem}>
      <Image source={{uri: image.uri}} style={styles.mediaPreview} />
      <TouchableOpacity
        style={styles.removeMediaBtn}
        onPress={() => removeImage(index)}>
        <Icon name="close-circle" size={22} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="arrow-back-outline" size={24} color="#8337B2" />
          </TouchableOpacity>
          <Text style={styles.title}>Update Post</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#ccc"
            multiline
            value={formData.content}
            onChangeText={text => handleInputChange('content', text)}
          />

          {formData.featured_image && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Image</Text>
              <Image
                source={{uri: formData.featured_image.uri}}
                style={styles.featuredImage}
              />
            </View>
          )}

          {formData?.repost?.featured_image && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Image</Text>
              <Image
                source={{uri: formData?.repost?.featured_image.uri}}
                style={styles.featuredImage}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Images</Text>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handleSelectImage}
              disabled={isLoading}>
              <Icon name="image-outline" size={20} color="#fff" />
              <Text style={styles.mediaButtonText}>Add Images</Text>
            </TouchableOpacity>

            <View style={styles.mediaContainer}>
              {formData.post_images.map(renderImage)}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#8337B2" />
            ) : (
              <Text style={styles.submitButtonText}>Update Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#8337B2',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  input: {
    minHeight: 120,
    backgroundColor: '#fff',
    color: '#8337B2',
    borderWidth: 1,
    borderColor: '#A072D1',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  section: {
    // marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#8337B2',
    marginBottom: 10,
    fontWeight: '600',
  },
  featuredImage: {
    justifyContent: 'flex-start',
    height: 180,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A072D1',
  },
  mediaButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  mediaItem: {
    position: 'relative',
    margin: 5,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 30,
    // borderColor:'#8337B2',
    backgroundColor: '#8337B2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default UpdatePostModal;

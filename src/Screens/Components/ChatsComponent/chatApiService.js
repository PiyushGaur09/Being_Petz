import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';

const BASE_URL = 'https://beingpetz.com/petz-info/public/api/v1';

export const fetchMessages = async communityId => {
  try {
    const formData = new FormData();
    formData.append('community_id', communityId);

    const response = await axios.post(
      `${BASE_URL}/community/get-messages`,
      formData,
      {headers: {'Content-Type': 'multipart/form-data'}},
    );

    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendTextMessage = async (communityId, userId, text) => {
  if (!text.trim()) {
    console.warn('Empty message text');
    return;
  }

  try {
    // Convert IDs to numbers if needed
    const numericCommunityId = Number(communityId);
    const numericUserId = Number(userId);

    if (isNaN(numericCommunityId)) {
      throw new Error('Invalid community ID');
    }
    if (isNaN(numericUserId)) {
      throw new Error('Invalid user ID');
    }

    const formData = new FormData();
    formData.append('community_id', numericCommunityId);
    formData.append('parent_id', numericUserId);
    formData.append('message_type', 'text');
    formData.append('message_text', text);
    formData.append('message_id', '');

    console.log('FormData contents:', formData);
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    const response = await axios.post(
      `${BASE_URL}/community/send-message`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add authorization if needed
          // 'Authorization': `Bearer ${yourToken}`
        },
        validateStatus: status => {
          return status < 500; // Reject only if status is >= 500
        },
      },
    );

    console.log('API Response:', response.data);

    if (!response.data?.status) {
      throw new Error(response.data?.message || 'Failed to send message');
    }

    return response.data;
  } catch (error) {
    console.error('Detailed Error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    });
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

export const sendImageMessage = async (communityId, userId) => {
  try {
    const image = await ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      quality: 0.8,
    });

    if (image.didCancel) return;

    const formData = new FormData();
    formData.append('community_id', communityId);
    formData.append('parent_id', userId);
    formData.append('message_type', 'image');
    formData.append('media', {
      uri: image.path,
      type: image.mime,
      name: image.path.split('/').pop(),
    });
    formData.append('message_id', '');

    const response = await axios.post(
      `${BASE_URL}/community/send-message`,
      formData,
      {headers: {'Content-Type': 'multipart/form-data'}},
    );

    return response.data?.status;
  } catch (error) {
    console.error('Error sending image:', error);
    throw error;
  }
};

export const sendPollMessage = async (communityId, userId) => {
  return new Promise((resolve, reject) => {
    Alert.prompt('Create Poll', 'Enter your question:', [
      {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
      {
        text: 'Next',
        onPress: question => {
          if (question) {
            Alert.prompt('Poll Options', 'Enter options (comma separated):', [
              {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
              {
                text: 'Send',
                onPress: async optionsText => {
                  if (optionsText) {
                    const options = optionsText
                      .split(',')
                      .map(o => o.trim())
                      .filter(o => o);

                    if (options.length >= 2) {
                      try {
                        const formData = new FormData();
                        formData.append('community_id', communityId);
                        formData.append('parent_id', userId);
                        formData.append('message_type', 'poll');
                        formData.append('question', question);
                        options.forEach((opt, i) =>
                          formData.append(`options[${i}]`, opt),
                        );

                        const response = await axios.post(
                          `${BASE_URL}/community/send-message`,
                          formData,
                          {headers: {'Content-Type': 'multipart/form-data'}},
                        );

                        resolve(response.data?.status);
                      } catch (error) {
                        console.error('Error sending poll:', error);
                        reject(error);
                      }
                    } else {
                      Alert.alert('Error', 'Please enter at least 2 options');
                      resolve(false);
                    }
                  }
                },
              },
            ]);
          }
        },
      },
    ]);
  });
};

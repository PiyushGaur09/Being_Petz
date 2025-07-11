import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';

const screenWidth = Dimensions.get('window').width;
const baseUrl = 'https://argosmob.uk/being-petz/public/';
const characterLimit = 30;

const PersonalProfile = ({route}) => {
  const {item} = route.params;
  const [expanded, setExpanded] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [requestStatus, setRequestStatus] = useState('idle'); // 'idle', 'loading', 'sent', 'error'
  const [hasSentRequest, setHasSentRequest] = useState(false);

  const parentId = item?.id;

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
          checkFriendRequestStatus(parsedData.id, parentId);
        } else {
          throw new Error('Invalid user data format');
        }
      } else {
        throw new Error('No user data found');
      }
    } catch (error) {
      handleApiError(error, 'Error fetching user data');
    }
  };

  const checkFriendRequestStatus = async (fromId, toId) => {
    try {
      const response = await axios.get(
        `${baseUrl}api/v1/pet/friends/check-request-status`,
        {
          params: {
            from_parent_id: fromId,
            to_parent_id: toId,
          },
        },
      );

      if (response.data.status && response.data.data?.status === 'pending') {
        setHasSentRequest(true);
      }
    } catch (error) {
      console.log('Error checking friend request status:', error);
    }
  };

  const handleApiError = (error, context) => {
    console.error(`${context}:`, error.message);
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: 'Error',
      textBody: `${context}: ${error.message || 'Something went wrong'}`,
      button: 'Close',
    });
  };

  const validateUserData = () => {
    if (!userData?.id) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Error',
        textBody: 'User data not available. Please login again.',
        button: 'Close',
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchUserPosts();
    fetchUserData();
  }, []);

  const sendFriendRequest = async to_parent_id => {
    if (!validateUserData() || hasSentRequest) return;

    // console.log('lkjhgf', to_parent_id);
    // console.log('lkjhgf', userData.id);

    try {
      setRequestStatus('loading');

      const formData = new FormData();
      formData.append('from_parent_id', userData.id.toString());
      formData.append('to_parent_id', to_parent_id.toString());

      const response = await axios.post(
        `${baseUrl}api/v1/pet/friends/send-request`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setRequestStatus('sent');
      setHasSentRequest(true);
    } catch (error) {
      setRequestStatus('error');
      handleApiError(error, 'Failed to send friend request');
    }
  };

  const fetchUserPosts = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('parent_id', String(parentId));

      const response = await axios.post(
        `${baseUrl}api/v1/post/get/my`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const json = response.data;
      if (json.status === true) {
        setUserPosts(json.data?.data || []);
      } else {
        console.warn('Failed to fetch posts:', json.message || 'Unknown error');
      }
    } catch (error) {
      handleApiError(error, 'Error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const PostCard = React.memo(({item}) => {
    const [expanded, setExpanded] = useState(false);

    const isLongText = item?.content?.length > characterLimit;
    const displayText = expanded
      ? item?.content
      : item?.content?.slice(0, characterLimit);
    const toggleExpand = () => setExpanded(!expanded);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{
              uri: `https://argosmob.uk/being-petz/public/${item?.parent?.profile}`,
            }}
            style={styles.profileImage}
            onError={() => console.log('Failed to load profile image')}
            defaultSource={require('../Assests/Images/dog.png')}
            accessible={true}
            accessibilityLabel={`Profile of ${item?.parent?.first_name}`}
          />
          <View style={styles.userInfo}>
            <Text
              style={styles.userName}
              accessible={true}
              accessibilityRole="text">{`${item?.parent?.first_name} ${item?.parent?.last_name}`}</Text>
          </View>
          
        </View>

        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : 'Show more'}
          onPress={toggleExpand}>
          <Text style={styles.caption}>
            {displayText}
            {isLongText && !expanded ? '...' : ''}
            {isLongText && (
              <Text style={{color: '#8337B2', fontWeight: '600'}}>
                {expanded ? ' Less' : ' More'}
              </Text>
            )}
          </Text>
        </TouchableOpacity>
        {item?.featured_image != null && (
          <Image
            source={{
              uri: `https://argosmob.uk/being-petz/public/${item.featured_image}`,
            }}
            defaultSource={require('../Assests/Images/dog.png')}
            style={styles.postImage}
            onError={() => console.log('Failed to load post image')}
            accessible={true}
            accessibilityLabel="Post image"
          />
        )}
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.username}>
          {`${item?.first_name || ''} ${item?.last_name || ''}`}
        </Text>
        <TouchableOpacity
          onPress={() => sendFriendRequest(item?.id)}
          style={[
            styles.followButton,
            hasSentRequest && styles.sentRequestButton,
          ]}
          disabled={hasSentRequest || requestStatus === 'loading'}>
          {requestStatus === 'loading' ? (
            <ActivityIndicator size="small" color="#8337B2" />
          ) : (
            <Text style={styles.followButtonText}>
              {hasSentRequest ? 'Request Sent' : 'Send Request'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Email */}
      <View style={styles.bioSection}>
        <Text style={styles.email}>{item?.email}</Text>
      </View>

      {/* Posts */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#8337B2"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={({item}) => <PostCard item={item} />}
          contentContainerStyle={styles.postGrid}
          ListEmptyComponent={
            <Text style={styles.noPostsText}>No posts available</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    padding: 15,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8337B2',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  sentRequestButton: {
    backgroundColor: '#ccc',
  },
  followButtonText: {
    color: '#8337B2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bioSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  postGrid: {
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  postsContainer: {
    marginTop: 15,
    marginHorizontal: 10,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'grey',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D384C',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    // marginBottom: 10,
    marginVertical: 10,
    resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
  },
  commentIcon: {
    marginLeft: 15,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
  },
  // postCard: {
  //   marginBottom: 15,
  //   borderBottomWidth: 1,
  //   borderColor: '#eee',
  //   paddingBottom: 10,
  // },
  // postHeader: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 5,
  //   marginBottom: 10,
  // },
  // profileImage: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  // },
  // userInfo: {
  //   marginLeft: 10,
  // },
  // userName: {
  //   fontWeight: '600',
  //   color: '#000',
  // },
  // postImage: {
  //   alignSelf: 'center',
  //   width: '90%',
  //   height: screenWidth * 0.6,
  //   resizeMode: 'cover',
  //   borderRadius: 8,
  //   marginTop: 5,
  // },
  // captionSection: {
  //   paddingHorizontal: 10,
  //   marginTop: 6,
  // },
  // caption: {
  //   fontSize: 14,
  //   color: '#444',
  // },
  // expandText: {
  //   color: '#8337B2',
  //   fontWeight: '600',
  //   marginTop: 2,
  // },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

export default PersonalProfile;

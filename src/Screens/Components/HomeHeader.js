import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';

const API_URL = 'https://argosmob.com/being-petz/public/api/v1';
const API_ENDPOINTS = {
  USER_DETAIL: `${API_URL}/auth/my-detail`,
  UPDATE_DEVICE_TOKEN: `${API_URL}/notification/update-device/token`,
  NOTIFICATION_LIST: `${API_URL}/notification/list`,
  NOTIFICATION_CLEAR: `${API_URL}/notification/clear`,
  FRIEND_REQUESTS: `${API_URL}/pet/friends/get-requests`,
};

const HomeHeader = ({onChatPress, onPeoplePress}) => {
  const [userData, setUserData] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageZoomed, setImageZoomed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);

  const navigation = useNavigation();

  // console.log('pendingRequest', notifications);

  // Update device token
  const updateDeviceToken = async (token, userId) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('token', token);

      await axios.post(API_ENDPOINTS.UPDATE_DEVICE_TOKEN, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
    } catch (error) {
      console.error('Error updating device token:', error);
    }
  };

  // Register FCM
  const registerAppWithFCM = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      if (user?.id && token) await updateDeviceToken(token, user.id);
    } catch (error) {
      console.error('FCM registration error:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setError(null);
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      if (!user?.id) return;

      const formData = new FormData();
      formData.append('user_id', user.id.toString());

      const response = await axios.post(
        API_ENDPOINTS.NOTIFICATION_LIST,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 10000,
        },
      );

      console.log('resssss', response.data);

      if (response.data?.status) {
        setNotifications(response.data.data || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error loading notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Clear notifications
  const clearNotifications = async () => {
    try {
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      if (!user?.id) return;

      const formData = new FormData();
      formData.append('user_id', user.id.toString());

      const response = await axios.post(
        API_ENDPOINTS.NOTIFICATION_CLEAR,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data?.status) setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Fetch pending friend requests
  const fetchFriendRequests = async () => {
    try {
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      if (!user?.id) return;

      const formData = new FormData();
      formData.append('parent_id', user.id.toString());

      const response = await axios.post(
        API_ENDPOINTS.FRIEND_REQUESTS,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (
        response.data?.status &&
        Array.isArray(response.data.received_requests)
      ) {
        setPendingRequests(response.data.received_requests.length);
      } else {
        setPendingRequests(0);
      }
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      setPendingRequests(0);
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      if (!user?.id) return;

      const formData = new FormData();
      formData.append('user_id', user.id);

      const response = await axios.post(API_ENDPOINTS.USER_DETAIL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data?.status && response.data?.user)
        setUserData(response.data.user);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    registerAppWithFCM();
    const initialize = async () => {
      const storedPetId = await AsyncStorage.getItem('SelectedPetId');
      if (storedPetId) setSelectedPetId(parseInt(storedPetId, 10));
      await fetchUserData();
      await fetchFriendRequests();
    };
    initialize();
  }, [fetchUserData]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
      fetchFriendRequests();
      fetchNotifications();
    });
    return unsubscribe;
  }, [navigation, fetchUserData]);

  const openNotificationsModal = async () => {
    setNotificationsModalVisible(true);
    await fetchNotifications();
  };

  if (loading) {
    return (
      <LinearGradient colors={['#8337B2', '#3B0060']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#8337B2', '#3B0060']} style={styles.container}>
      <StatusBar backgroundColor="#8337B2" barStyle="light-content" />
      <View style={styles.topRow}>
        <Image
          source={require('../../Assests/Images/newLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.iconsContainer}>
          <IconButton
            icon="search-outline"
            onPress={() => navigation.navigate('Search')}
          />
          <IconButtons icon="account-group-outline" onPress={onChatPress} />
          <IconButton
            icon="notifications-outline"
            onPress={openNotificationsModal}
            showBadge={notifications.length > 0}
          />
          <IconButtons
            icon="account-multiple-plus-outline"
            onPress={onPeoplePress}
            showBadge={pendingRequests > 0} // Red dot for friend requests
          />
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={18}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {userData && (
        <ProfileSection
          userData={userData}
          onImagePress={() => setImageZoomed(true)}
          onNamePress={() => navigation.navigate('More')}
        />
      )}

      <ImageZoomModal
        visible={isImageZoomed}
        imageUri={`https://argosmob.com/being-petz/public/${userData?.profile}`}
        onClose={() => setImageZoomed(false)}
      />

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setNotificationsModalVisible(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#8337B2" />
              </TouchableOpacity>
            </View>

            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={clearNotifications}
                style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}

            {notificationsLoading ? (
              <ActivityIndicator
                size="large"
                color="#8337B2"
                style={styles.loader}
              />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={40} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  onPress={fetchNotifications}
                  style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView>
                {notifications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="notifications-off-outline"
                      size={50}
                      color="#ccc"
                    />
                    <Text style={styles.emptyText}>No notifications</Text>
                  </View>
                ) : (
                  notifications.map((notification, index) => (
                    <View key={index} style={styles.notificationItem}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {new Date(notification.created_at).toLocaleString()}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const IconButton = ({icon, onPress, showBadge}) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <Icon name={icon} size={26} color="#fff" />
    {showBadge && <View style={styles.redDot} />}
  </TouchableOpacity>
);

const IconButtons = ({icon, onPress, showBadge}) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    <Icons name={icon} size={26} color="#fff" />
    {showBadge && <View style={styles.redDot} />}
  </TouchableOpacity>
);

const ProfileSection = ({userData, onImagePress, onNamePress}) => (
  <View style={styles.profileRow}>
    <TouchableOpacity onPress={onImagePress} activeOpacity={0.8}>
      <Image
        source={{
          uri: `https://argosmob.com/being-petz/public/${userData.profile}`,
        }}
        style={styles.profileImage}
      />
    </TouchableOpacity>
    <View style={styles.nameContainer}>
      <TouchableOpacity style={styles.nameRow} onPress={onNamePress}>
        <Text style={styles.petName}>
          {userData.first_name} {userData.last_name}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ImageZoomModal = ({visible, imageUri, onClose}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} onPressOut={onClose}>
      <Image
        source={{uri: imageUri}}
        style={styles.zoomedImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 16,
  },
  topRow: {
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconsContainer: {flexDirection: 'row'},
  logo: {width: 180, height: 50},
  iconButton: {marginLeft: 15, position: 'relative'},
  redDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  profileRow: {flexDirection: 'row', alignItems: 'center', marginTop: 16},
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameContainer: {marginLeft: 10, flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center'},
  petName: {color: '#fff', fontSize: 16, fontWeight: '600'},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  zoomedImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  searchInput: {flex: 1, marginLeft: 8, color: '#000', paddingVertical: 0},
  searchIcon: {marginLeft: 2},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', color: '#8337B2'},
  closeButton: {padding: 5},
  clearButton: {
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButtonText: {color: 'white', fontWeight: 'bold'},
  loader: {marginVertical: 20},
  emptyContainer: {alignItems: 'center', justifyContent: 'center', padding: 40},
  emptyText: {marginTop: 10, color: '#888', fontSize: 16},
  notificationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8337B2',
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
  },
  notificationMessage: {fontSize: 14, color: '#555', marginBottom: 5},
  notificationTime: {fontSize: 12, color: '#888', fontStyle: 'italic'},
  errorContainer: {alignItems: 'center', justifyContent: 'center', padding: 40},
  errorText: {
    marginTop: 10,
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {color: 'white', fontWeight: 'bold'},
});

export default HomeHeader;

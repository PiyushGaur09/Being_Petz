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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import petIdEmitter from './PetIdEmitter';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieLoader from './LottieLoader';
import HeaderLoader from './HeaderLoader';
// import messaging from '@react-native-firebase/messaging';

const API_URL = 'https://argosmob.com/being-petz/public/api/v1';
const API_ENDPOINTS = {
  USER_DETAIL: `${API_URL}/auth/my-detail`,
};

const HomeHeader = ({onChatPress, onPeoplePress}) => {
  const [userData, setUserData] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageZoomed, setImageZoomed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');

  // useEffect(() => {
  //   getDeviceToken();
  // }, []);

  // const getDeviceToken = async () => {
  //   let token = await messaging().getToken();
  //   console.log('token device :', token);
  // };

  const navigation = useNavigation();

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;

      if (!user?.id) {
        console.log('No valid user data found');
        return;
      }

      const formData = new FormData();
      formData.append('user_id', user.id);

      const response = await axios.post(API_ENDPOINTS.USER_DETAIL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data?.status && response.data?.user) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSearch = () => setShowSearch(prev => !prev);
  const clearSearch = () => setSearchText('');

  useEffect(() => {
    const initialize = async () => {
      const storedPetId = await AsyncStorage.getItem('SelectedPetId');
      if (storedPetId) {
        setSelectedPetId(parseInt(storedPetId, 10));
      }
      await fetchUserData();
    };
    initialize();
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation, fetchUserData]);

  if (loading) {
    return (
      <LinearGradient colors={['#8337B2', '#3B0060']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        {/* <HeaderLoader visible={loading}/> */}
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
            onPress={() => {
              navigation.navigate('Search');
            }}
          />
          <IconButtons icon="account-group-outline" onPress={onChatPress} />
          <IconButton
            icon="notifications-outline"
            // onPress={onPeoplePress}
            showBadge
          />
          <IconButtons
            icon="account-multiple-plus-outline"
            onPress={onPeoplePress}
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
            <TouchableOpacity onPress={clearSearch}>
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
  iconsContainer: {
    flexDirection: 'row',
  },
  logo: {
    width: 180,
    height: 50,
  },
  iconButton: {
    marginLeft: 15,
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameContainer: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#000',
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 2,
  },
});

export default HomeHeader;

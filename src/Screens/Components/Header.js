import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import petIdEmitter from './PetIdEmitter';
import HeaderLoader from './HeaderLoader';

const Header = ({
  onChatPress,
  onChatboxPress,
  onPeoplePress,
  onNotificationPress,
}) => {
  const [myPet, setMyPet] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

 

  const navigation = useNavigation();

  const getUserData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_data');
      // console.log("7777",jsonValue)
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading userData:', e);
      return null;
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    if (!selectedPetId) return;

    setLoadingRequests(true);
    try {
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('user_data');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      const parentId = userData.id;

      const formData = new FormData();
      formData.append('parent_id', parentId); // Use the stored user ID

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/get-requests',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 10000,
        },
      );

      setSentRequests(response.data?.sent_requests || []);
      setReceivedRequests(response.data?.received_requests || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    if (selectedPetId) {
      fetchFriendRequests();
    }
  }, [selectedPetId, fetchFriendRequests]);

  const storeSelectedPetId = async id => {
    try {
      await AsyncStorage.setItem('SelectedPetId', id.toString());
      petIdEmitter.emit('petIdChanged', id); // notify others
    } catch (e) {
      console.error('Error saving selected pet ID:', e);
    }
  };

  const fetchPetDetails = async userId => {
    setLoadingPets(true);
    try {
      const storedPetId = await AsyncStorage.getItem('SelectedPetId');

      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(
        'https://argosmob.com/being-petz/public/api/v1/pet/get/my',
        {
          method: 'POST',
          headers: {Accept: 'application/json'},
          body: formData,
        },
      );

      const data = await response.json();
      const pets = data?.data || [];
      // console.log('UserID', data);

      setMyPet(pets);

      if (storedPetId && pets.some(p => p.id === parseInt(storedPetId))) {
        setSelectedPetId(parseInt(storedPetId));
      } else if (pets.length > 0) {
        setSelectedPetId(pets[0].id);
        storeSelectedPetId(pets[0].id);
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = await getUserData();
      // console.log("555",user)
      const storedPetId = await AsyncStorage.getItem('SelectedPetId');
      if (storedPetId) {
        setSelectedPetId(parseInt(storedPetId));
      }
      if (user?.id) {
        await fetchPetDetails(user.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = await getUserData();
      if (user?.id) {
        await fetchPetDetails(user.id);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const currentPet = useMemo(
    () => myPet.find(pet => pet.id === selectedPetId),
    [myPet, selectedPetId],
  );

  const calculateAge = dob => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      months += 12;
    }
    return `${years} Year${years !== 1 ? 's' : ''} ${months} Month${
      months !== 1 ? 's' : ''
    } `;
  };

  return (
    <LinearGradient colors={['#8337B2', '#3B0060']} style={styles.container}>
      <StatusBar backgroundColor={'#8337B2'} barStyle={'light-content'} />

      <View style={styles.topRow}>
        <Image
          source={require('../../Assests/Images/newLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.topIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigation.navigate('Search');
            }}>
            <Icon name="search-outline" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onChatPress}>
            <Icons name="account-group-outline" size={26} color="#fff" />
            {/* <Image style={{height:22,width:22}} source={require('../../Assests/Images/CommunityIcon.png')}/> */}
          </TouchableOpacity>
          {/* <View style={styles.rightIcons}> */}
          <TouchableOpacity
            style={styles.iconWithDot}
            onPress={onNotificationPress}>
            <Icon name="notifications-outline" size={26} color="#fff" />
            {/* <View style={styles.redDot} /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconWithBadge}
            onPress={onPeoplePress}>
            <Icons
              name="account-multiple-plus-outline"
              size={26}
              color="#fff"
            />
            {/* <View style={styles.badge}> */}
            {/* <View style={styles.redDot} /> */}
            {/* </View> */}
          </TouchableOpacity>

          {/* </View> */}
        </View>
      </View>

      {loadingPets ? (
        <ActivityIndicator size="small" color="#fff" style={{marginTop: 20}} />
        // <HeaderLoader visible={loadingPets}/>
      ) : (
        currentPet && (
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: `https://argosmob.com/being-petz/public/${currentPet.avatar}`,
              }}
              style={styles.profileImage}
            />
            <View style={{marginLeft: 10}}>
              <TouchableOpacity
                style={styles.nameRow}
                onPress={() => setDropdownVisible(true)}>
                <Text style={styles.petName}>{currentPet.name}</Text>
                <FontAwesome
                  name={currentPet.gender === 'male' ? 'mars' : 'venus'}
                  size={14}
                  color="#fff"
                  style={{marginLeft: 5}}
                />
                <Icon
                  name="chevron-down"
                  size={14}
                  color="#fff"
                  style={{marginLeft: 5}}
                />
              </TouchableOpacity>
              {/* <Text style={styles.breed}>{currentPet.breed}</Text> */}
              {/* <Text style={styles.age}>{calculateAge(currentPet.dob)}</Text> */}
            </View>

            {/* <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconWithBadge}
                onPress={onPeoplePress}>
                <Icon name="people" size={22} color="#fff" />
                <View style={styles.badge}>
                <View style={styles.redDot} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconWithDot}
                onPress={onNotificationPress}>
                <Icon name="notifications-outline" size={22} color="#fff" />
                <View style={styles.redDot} />
              </TouchableOpacity>
            </View> */}
          </View>
        )
      )}

      {/* Dropdown Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setDropdownVisible(false)}>
          <View style={styles.dropdownContainer}>
            <FlatList
              data={myPet}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPetId(item.id);
                    storeSelectedPetId(item.id);
                    setDropdownVisible(false);
                  }}
                  style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

export default Header;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdownContainer: {
    backgroundColor: '#8337B2',
    borderRadius: 10,
    width: 260,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownItemText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 16,
    // paddingTop: 16,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
  },
  logo: {
    width: 180,
    height: 50,
  },
  topIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    // marginLeft: 15,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  breed: {
    color: '#eee',
    fontSize: 13,
  },
  age: {
    color: '#ccc',
    fontSize: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
    gap: 10,
  },
  iconWithBadge: {
    // marginRight: 20,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconWithDot: {
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
});

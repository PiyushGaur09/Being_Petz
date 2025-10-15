import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Segment from './Components/SegmentedButtons';
import Header from './Components/Header';
import FriendRequestsModal from './Components/FriendRequestsModal';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import petIdEmitter from './Components/PetIdEmitter';
import LottieLoader from './Components/LottieLoader';
import CommonHeader from './Components/CommonHeader';

const Pets = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [petData, setPetData] = useState(null);
  const [petDetails, setPetDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  console.log('records', records);

  const [myPet, setMyPet] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null); // normalized to number
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const getUserData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_data');
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading userData:', e);
      return null;
    }
  }, []);

  // Fetch user's pets and set a default SelectedPetId if none exists
  const fetchUserPets = async userId => {
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

      setMyPet(pets);

      // Normalize storedPetId to number if exists and matches
      if (storedPetId && pets.some(p => Number(p.id) === Number(storedPetId))) {
        const parsed = Number(storedPetId);
        setSelectedPetId(parsed);
      } else if (pets.length > 0) {
        // set first pet as default
        const firstId = Number(pets[0].id);
        setSelectedPetId(firstId);
        await AsyncStorage.setItem('SelectedPetId', firstId.toString());
        petIdEmitter.emit('petIdChanged', firstId);
      } else {
        // no pets available
        setSelectedPetId(null);
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchFriendRequests = useCallback(async () => {
    if (!selectedPetId) return;

    setLoadingRequests(true);
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      const parentId = userData.id;

      const formData = new FormData();
      formData.append('parent_id', parentId);

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
      const numericId = Number(id);
      await AsyncStorage.setItem('SelectedPetId', numericId.toString());
      petIdEmitter.emit('petIdChanged', numericId);
    } catch (e) {
      console.error('Error saving selected pet ID:', e);
    }
  };

  const getPetsWithAddButton = () => {
    return [
      ...myPet,
      {
        id: 'add-pet', // Unique identifier (string)
        isAddButton: true, // Flag to identify this as the add button
        name: 'Add Pet',
      },
    ];
  };

  const renderPetItem = ({item}) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('Add Pet')}
          style={styles.addPetButton}>
          <View style={styles.addPetIconContainer}>
            <FontAwesome5 name="plus" size={20} color="#8337B2" />
          </View>
          <Text style={styles.petListName}>Add Pet</Text>
        </TouchableOpacity>
      );
    }

    const itemId = Number(item.id);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPetId(itemId);
          storeSelectedPetId(itemId);
          setDropdownVisible(false);
        }}
        style={[
          styles.petListItem,
          selectedPetId === itemId && styles.selectedPetListItem,
        ]}>
        <Image
          source={{
            uri: item.avatar
              ? `https://argosmob.com/being-petz/public/${item.avatar}`
              : 'https://argosmob.com/being-petz/public/default-avatar.jpg',
          }}
          style={styles.petListImage}
        />
        <Text style={styles.petListName} ellipsizeMode="tail">
          {item.name
            ? item.name.length > 8
              ? `${item.name.substring(0, 8)}...`
              : item.name
            : 'Pet'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Initial load: fetch user and their pets, but do not call fetchPetDetails here.
  useEffect(() => {
    const init = async () => {
      const user = await getUserData();
      if (user?.id) {
        await fetchUserPets(user.id);
        // fetchUserPets will set selectedPetId (and persist it) when done
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When screen gains focus, refresh pets; fetchUserPets will set selectedPetId if needed.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = await getUserData();
      if (user?.id) {
        await fetchUserPets(user.id);
      }
    });
    return unsubscribe;
  }, [navigation, fetchUserPets, getUserData]);

  // If selectedPetId changes, fetch pet details.
  const fetchPetDetails = async petIdParam => {
    try {
      setLoading(true);
      setError(null);

      const petIdToUse =
        petIdParam ??
        selectedPetId ??
        (await AsyncStorage.getItem('SelectedPetId'));

      if (!petIdToUse) {
        setError('No pet selected');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('pet_id', petIdToUse);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/detail',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      setPetDetails(response?.data || {});
      setPetData(response.data?.data || null);
      setRecords(response.data?.records || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch pet details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      fetchPetDetails(selectedPetId);
    } else {
      // if no selected pet, clear details
      setPetDetails({});
      setPetData(null);
      setRecords([]);
    }

    const changeHandler = () => {
      // re-fetch details when petIdEmitter triggers (keeps consistent)
      if (selectedPetId) fetchPetDetails(selectedPetId);
    };

    petIdEmitter.on('petIdChanged', changeHandler);
    return () => {
      petIdEmitter.off('petIdChanged', changeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPetId]);

  const currentPet = useMemo(
    () => myPet.find(pet => Number(pet.id) === Number(selectedPetId)),
    [myPet, selectedPetId],
  );

  const calculateAge = dob => {
    if (!dob) return 'Age not specified';
    const birthDate = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Year${years !== 1 ? 's' : ''} ${months} Month${
      months !== 1 ? 's' : ''
    } `;
  };

  // Function to render stats with dynamic data
  const renderStats = () => {
    return (
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            navigation.navigate('Meals', {
              petData,
              mealsData: petDetails.mealsData,
            })
          }>
          <Image source={require('../Assests/Images/Meals.png')} />
          <Text style={styles.statCount}>{petDetails.meals || 0}</Text>
          <Text style={styles.statLabel}>Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            navigation.navigate('Vaccinations', {
              petData,
              vaccineRecordsData: petDetails.vaccineRecordsData,
            })
          }>
          <Image source={require('../Assests/Images/Vaccination.png')} />
          <Text style={styles.statCount}>{petDetails.vaccines || 0}</Text>
          <Text style={styles.statLabel}>Vaccinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() =>
            navigation.navigate('Friends', {
              petData,
              friendsData: petDetails.friendsData,
            })
          }>
          <Image source={require('../Assests/Images/Friends.png')} />
          <Text style={styles.statCount}>{petDetails.friends || 0}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchPetDetails(selectedPetId)}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      {/* Pets Horizontal List */}
      {myPet.length > 0 && (
        <View style={styles.petsListContainer}>
          <FlatList
            data={getPetsWithAddButton()} // Use the modified data with add button
            keyExtractor={item => item.id.toString()}
            renderItem={renderPetItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petsListContent}
          />
        </View>
      )}

      <View style={styles.header}>
        <Image
          source={{
            uri: petData?.avatar
              ? `https://argosmob.com/being-petz/public/${petData.avatar}`
              : 'https://argosmob.com/being-petz/public/default-avatar.jpg',
          }}
          style={styles.avatar}
          onError={e => console.log('Image load error:', e.nativeEvent.error)}
          resizeMode="cover"
        />

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.name}>
            {petData?.name || 'No name'}
            {petData?.gender === 'male'
              ? ' ♂'
              : petData?.gender === 'female'
              ? ' ♀'
              : ''}
          </Text>
        </View>

        <Text style={styles.age}>{calculateAge(petData?.dob)}</Text>

        <View style={{flexDirection: 'row', gap: 20}}>
          {petData?.breed && (
            <Text style={styles.detail}>
              <FontAwesome5 name="paw" size={14} /> {petData.breed}
            </Text>
          )}

          {records?.[0] && (
            <Text style={styles.detail}>
              <FontAwesome5 name="weight" size={14} />{' '}
              {`${records?.[0]?.weight} kg`}
            </Text>
          )}
        </View>

        <Text style={styles.bio}>{petData?.bio || 'No bio available'}</Text>

        {renderStats()}
      </View>

      <View style={styles.contentContainer}>
        <Segment petData={petData} petDetails={petDetails} />
      </View>

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {alignItems: 'center', padding: 20},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#8337B2',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  age: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 5,
  },
  detail: {
    fontSize: 14,
    marginVertical: 2,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  // New styles for the pets list
  petsListContainer: {
    height: 100,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  petsListContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  petListItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 5,
  },
  selectedPetListItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#8337B2',
  },
  petListImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  petListName: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  addPetButton: {
    alignItems: 'center',
    marginHorizontal: 10,
    padding: 5,
    justifyContent: 'center',
  },
  addPetIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#8337B2',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default Pets;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
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

const Pets = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  console.log('hhh', records);

  const calculateAge = dob => {
    if (!dob) return 'Age not specified';
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

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const selectedPetId = await AsyncStorage.getItem('SelectedPetId');
      // if (!selectedPetId) throw new Error('No pet selected');

      const formData = new FormData();
      formData.append('pet_id', selectedPetId);

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

      setPetData(response.data.data);
      setRecords(response.data?.records);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch pet details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPetDetails();

    // Set up listener for changes
    const changeHandler = () => {
      fetchPetDetails();
    };

    petIdEmitter.on('petIdChanged', changeHandler);

    // Cleanup
    return () => {
      petIdEmitter.off('petIdChanged', changeHandler);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
        {/* <LottieLoader visible={loading} /> */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPetDetails}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <Header
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

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
          {/* <Text style={styles.detail}>
            <FontAwesome5 name="paw" size={14} />{' '}
            {petData?.breed || 'Unknown breed'}
          </Text> */}

          {records?.[0] && (
            <Text style={styles.detail}>
              <FontAwesome5 name="weight" size={14} />{' '}
              {`${records?.[0]?.weight} kg`}
            </Text>
          )}
          {/* <Text style={styles.detail}>
            <FontAwesome5 name="weight" size={14} />{' '}
            {petData?.weight }
          </Text> */}
        </View>

        <Text style={styles.bio}>{petData?.bio || 'No bio available'}</Text>

        <View style={styles.statsRow}>
          <Image source={require('../Assests/Images/Meals.png')} />
          <Image source={require('../Assests/Images/Vaccination.png')} />
          <Image source={require('../Assests/Images/Friends.png')} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Segment petData={petData} />
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
});

export default Pets;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Components/Header';
import FriendRequestsModal from './Components/FriendRequestsModal';
import {useNavigation} from '@react-navigation/native';
import DiagonalBackgroundCard from './Components/DiagonalBackgroundCard';
import CommonHeader from './Components/CommonHeader';
import BannerCarousel from './Components/BannerCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Services = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id || parsedData.user_id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // console.log('llllll', userId);

  const handleFavoritesPress = async () => {
    try {
      setLoading(true);
      // Get user data from AsyncStorage

      // Make API call to get favorite services
      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/favorite/services/get',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // Handle the response - you might want to navigate to a favorites screen
      // or show the favorites in a modal
      console.log('Favorites response:', response.data);

      // Navigate to favorites screen or show data
      navigation.navigate('Favorite', {favorites: response.data});
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Failed to fetch favorite services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <BannerCarousel />

      <View style={styles.servicesContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 24,
          }}>
          <Text style={styles.sectionTitle}>Services</Text>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={handleFavoritesPress}
            disabled={loading}>
            <Icon name={'heart'} color={'red'} size={22} />
            <Text style={[styles.sectionTitle, {marginBottom: 0}]}>
              {loading ? 'Loading...' : 'Favorites'}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginVertical: 10,
            }}>
            <DiagonalBackgroundCard
              title="Pet Adoption"
              icon={require('../Assests/Images/PetAdoption.png')}
              topLeftColor="#C8A8FF"
              bottomRightColor="#110B8F1A"
              onPress={() => navigation.navigate('AdoptPet')}
            />
            <DiagonalBackgroundCard
              title="Pet Lost & Found"
              icon={require('../Assests/Images/PetFound.png')}
              topLeftColor="#FEBBBB"
              bottomRightColor="#FBE0EB"
              onPress={() => navigation.navigate('LostPet')}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginVertical: 10,
            }}>
            <DiagonalBackgroundCard
              title="Pet Training"
              icon={require('../Assests/Images/PetTraining.png')}
              topLeftColor="#CCEFFF"
              bottomRightColor="#E8F7FE"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {
              //     name: 'Pet Training',
              //   })
              // }
            />
            <DiagonalBackgroundCard
              title="Pet Store"
              icon={require('../Assests/Images/PetStore.png')}
              topLeftColor="#B2FFDB"
              bottomRightColor="#EAF9F2"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Pet Store'})
              // }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginVertical: 10,
            }}>
            <DiagonalBackgroundCard
              title="Pet Grooming"
              icon={require('../Assests/Images/PetGrooming.png')}
              topLeftColor="#BDCBFF"
              bottomRightColor="#F0F3FE"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Grooming'})
              // }
            />
            <DiagonalBackgroundCard
              title="Pet Boarding"
              icon={require('../Assests/Images/PetShelter.png')}
              topLeftColor="#FFDFC4"
              bottomRightColor="#FAF2EB"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {
              //     name: 'Pet Shelter',
              //   })
              // }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginVertical: 10,
            }}>
            <DiagonalBackgroundCard
              title="Pet Walker"
              icon={require('../Assests/Images/PetSitter.png')}
              topLeftColor="#A3EBEE"
              bottomRightColor="#D4F5F6"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Pet Walker'})
              // }
            />
            <DiagonalBackgroundCard
              title="Veterinary"
              icon={require('../Assests/Images/PetTracking.png')}
              topLeftColor="#DCFBAD"
              bottomRightColor="#F5FAEB"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Veterinary'})
              // }
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginVertical: 10,
            }}>
            <DiagonalBackgroundCard
              title="Pet Sitter"
              icon={require('../Assests/Images/PetSitter.png')}
              topLeftColor="#A3EBEE"
              bottomRightColor="#D4F5F6"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Pet Sitter'})
              // }
            />
            <DiagonalBackgroundCard
              title="Pet Resort"
              icon={require('../Assests/Images/PetTracking.png')}
              topLeftColor="#DCFBAD"
              bottomRightColor="#F5FAEB"
              badgeText={'Coming Soon 🔥'}
              // onPress={() =>
              //   navigation.navigate('Service Description', {name: 'Pet Resort'})
              // }
            />
          </View>
        </View>
      </View>
      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

export default Services;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  name: {fontSize: 18, fontWeight: 'bold'},
  breed: {fontSize: 14, color: '#555'},
  age: {fontSize: 12, color: '#777'},
  notificationIcon: {marginLeft: 'auto'},
  servicesContainer: {
    backgroundColor: '#F9EFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 30,
    margin: 20,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
  },
  serviceCard: {
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D384C',
  },
});

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import BannerCarousel from './Components/BannerCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://beingpetz.com/petz-info/public';
const API_URL = `${BASE_URL}/api/v1/pet/lost-found/all`;
const DELETE_URL =
  'https://beingpetz.com/petz-info/public/api/v1/pet/lost-found/delete';

const AdoptPet = ({route}) => {
  const navigation = useNavigation();
  const initialTab = route?.params?.active ?? 'lost';

  const [allPets, setAllPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchLostPets();
    getUserId();
  }, []);

  useEffect(() => {
    if (route?.params?.active) {
      setActiveTab(route.params.active);
    }
  }, [route?.params?.active]);

  const getUserId = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserId(parsed?.id);
      }
    } catch (error) {
      console.error('Error fetching user id:', error);
    }
  };

  const fetchLostPets = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllPets(response.data?.data?.data || []);
    } catch (error) {
      console.error('Error fetching lost pets:', error);
    }
  };

  const deletePet = async reportId => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('report_id', reportId);

      await axios.post(DELETE_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      Alert.alert('Success', 'Pet report deleted successfully');
      setAllPets(prev => prev.filter(pet => pet.id !== reportId));
    } catch (error) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Failed to delete pet report. Please try again.');
    }
  };

  const filteredPets = allPets.filter(pet => pet.report_type === activeTab);

  const handleShare = async item => {
    try {
      const imageUrl = item.images?.[0] ? `${BASE_URL}/${item.images[0]}` : '';
      const occurredDate = item.occurred_at?.split('T')[0] || 'Unknown';
      const formattedDate = occurredDate.split('').join('\u200B');

      const message = `
${item.report_type === 'lost' ? 'Lost' : 'Found'} Pet Alert 🐾

Breed: ${item.breed || 'Unknown Breed'}
Description: ${item.description || 'No description provided'}
Location: ${item.location || 'Unknown'}
Date ${item.report_type === 'lost' ? 'Lost' : 'Found'}: ${formattedDate}
Age: ${
        item.pet_dob
          ? `${Math.floor(
              (new Date() - new Date(item.pet_dob)) /
                (1000 * 60 * 60 * 24 * 30.44),
            )} months`
          : 'Unknown'
      }

${imageUrl ? 'Photo: ' + imageUrl : ''}

Please help ${
        item.report_type === 'lost'
          ? 'reunite this pet with pet parent'
          : 'identify this found pet'
      }!
      `;

      await Share.share({message});
    } catch (error) {
      console.error('Error sharing pet info:', error);
    }
  };

  const renderItem = ({item}) => {
    const imageUrl = item.images?.[0]
      ? `${BASE_URL}/${item.images[0]}`
      : 'https://via.placeholder.com/150';
    const petDOB = item.pet_dob ? new Date(item.pet_dob) : null;
    const age =
      petDOB && !isNaN(petDOB)
        ? `${Math.floor(
            (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
          )} months`
        : 'Unknown age';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PetDetails', {pet: item})}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image source={{uri: imageUrl}} style={styles.petImage} />
          {/* Delete button */}
          {userId === item.user_id && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() =>
                Alert.alert(
                  'Confirm Delete',
                  'Are you sure you want to delete this report?',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deletePet(item.id),
                    },
                  ],
                )
              }>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info & Share */}
        <View style={styles.infoWrapper}>
          <View>
            <Text style={styles.petName}>{item.breed || 'Unknown Breed'}</Text>
            <Text style={styles.petAge}>{age}</Text>
            <Text style={styles.petStatus}>
              {item.report_type === 'lost' ? 'Lost' : 'Found'} on{' '}
              {item.occurred_at?.split('T')[0] || 'Unknown date'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleShare(item)}
            style={styles.shareIcon}>
            <Icon name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {activeTab === 'lost' ? 'Lost pets' : 'Found pets'}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddLostAndFound', {onRefresh: fetchLostPets})
          }
          style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Report and Reunite</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'lost' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('lost')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'lost' && styles.activeTabText,
            ]}>
            Lost Pets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'found' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('found')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'found' && styles.activeTabText,
            ]}>
            Found Pets
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredPets}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={<BannerCarousel />}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No {activeTab} pets found. Be the first to report one!
          </Text>
        }
        contentContainerStyle={{paddingBottom: 20}}
      />

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default AdoptPet;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  title: {fontSize: 20, fontWeight: '700', color: '#8337B2'},
  reportButton: {backgroundColor: '#8337B2', borderRadius: 8},
  reportButtonText: {paddingVertical: 6, paddingHorizontal: 12, color: '#fff'},
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {borderBottomColor: '#8337B2'},
  tabText: {fontSize: 16, color: '#555'},
  activeTabText: {color: '#8337B2', fontWeight: 'bold'},
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  petImage: {width: '100%', height: '100%'},
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  infoWrapper: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {fontSize: 16, fontWeight: '700'},
  petAge: {fontSize: 14, color: '#555'},
  petStatus: {fontSize: 12, color: '#777', marginTop: 2},
  shareIcon: {padding: 5},
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
    paddingHorizontal: 20,
  },
});

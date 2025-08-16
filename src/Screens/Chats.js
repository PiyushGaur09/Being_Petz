import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from './Components/Header';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import FriendRequestsModal from './Components/FriendRequestsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from './Components/CommonHeader';
import LottieLoader from './Components/LottieLoader';

const ALL_COMMUNITIES_API =
  'https://argosmob.com/being-petz/public/api/v1/pet/community/get';
const MY_COMMUNITIES_API =
  'https://argosmob.com/being-petz/public/api/v1/pet/community/my';
const BASE_URL = 'https://argosmob.com/being-petz/public/';

const Chats = () => {
  const navigation = useNavigation();
  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [seachedcommunities, setSeachedCommunities] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [pinnedChatIds, setPinnedChatIds] = useState([]);

  const loadPinnedChats = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@pinned_chats');
      if (jsonValue != null) {
        setPinnedChatIds(JSON.parse(jsonValue));
      } else {
        setPinnedChatIds([]);
      }
    } catch (e) {
      console.error('Failed to load pinned chats', e);
    }
  };

  const togglePinChat = async chatId => {
    try {
      let updatedPinnedChats;
      if (pinnedChatIds.includes(chatId)) {
        // Unpin
        updatedPinnedChats = pinnedChatIds.filter(id => id !== chatId);
      } else {
        // Pin
        updatedPinnedChats = [chatId, ...pinnedChatIds];
      }

      setPinnedChatIds(updatedPinnedChats);
      await AsyncStorage.setItem(
        '@pinned_chats',
        JSON.stringify(updatedPinnedChats),
      );
    } catch (e) {
      console.error('Failed to update pinned chats', e);
    }
  };

  useEffect(() => {
    loadPinnedChats();
  }, []);

  const sortedCommunities = [
    ...filteredCommunities.filter(chat => pinnedChatIds.includes(chat.id)),
    ...filteredCommunities.filter(chat => !pinnedChatIds.includes(chat.id)),
  ];

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      const storedUserData = await AsyncStorage.getItem('user_data');
      // console.log('storedUserData', storedUserData);

      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
          return parsedData;
        }
      }
      throw new Error('No valid user data found');
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  const fetchSeachedCommunities = async query => {
    if (!query || query.trim() === '') {
      setSeachedCommunities([]);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('search', query);

      const res = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/search',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
          timeout: 10000,
        },
      );

      if (res.data?.status) {
        setSeachedCommunities(res.data.data?.slice(0, 4) || []);
      } else {
        setSeachedCommunities([]);
      }
    } catch (error) {
      console.error('Search Error:', error);
      setSeachedCommunities([]);
    }
  };

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  const debouncedSearch = useCallback(
    debounce(fetchSeachedCommunities, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const joinCommunity = async community_id => {
    if (!userData?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    const formData = new FormData();
    formData.append('community_id', community_id);
    formData.append('parent_id', userData.id);

    try {
      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/join',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data?.status) {
        Alert.alert('Success', response.data.message || 'Joined successfully!');
        // Refresh communities after joining
        fetchCommunities(userData.id);
      } else {
        Alert.alert(
          'Failed',
          response.data.message || 'Could not join community.',
        );
      }
    } catch (error) {
      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.message || 'Something went wrong.',
        );
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from the server.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const renderItem = ({item, index}) => (
    <View style={[styles.chatCard, index === 0 && styles.highlightedChat]}>
      <Image
        source={
          item.avatar
            ? {uri: item.avatar}
            : require('../Assests/Images/dog.png')
        }
        style={styles.chatAvatar}
      />
      <View style={styles.chatInfo}>
        <View>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.creatorText}>
            Created by: {item.creator?.first_name} {item.creator?.last_name}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => joinCommunity(item?.id)}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.time}</Text>
      </View>
    </View>
  );

  const transformCommunity = community => ({
    id: community.id,
    name: community.name || 'Community',
    message: community.description || "Let's connect!",
    time: new Date(community.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    unread: Math.floor(Math.random() * 5),
    avatar: community.profile
      ? {uri: BASE_URL + community.profile}
      : require('../Assests/Images/dog.png'),
    creator: community.creator,
    type: community.type,
    slug: community.slug,
    isJoined: true,
  });

  const fetchCommunities = useCallback(async userId => {
    try {
      setLoading(true);

      const allResponse = await axios.get(ALL_COMMUNITIES_API);
      const myResponse = await axios.post(MY_COMMUNITIES_API, {
        parent_id: userId,
      });

      if (allResponse.data?.status && myResponse.data?.status) {
        const allTransformedData =
          allResponse.data.data.map(transformCommunity);
        const myTransformedData = myResponse.data.data.data.map(item =>
          transformCommunity(item.community),
        );

        setAllCommunities(allTransformedData);
        setMyCommunities(myTransformedData);
        setFilteredCommunities(myTransformedData);
      } else {
        throw new Error('Failed to load communities');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to load communities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const user = await fetchUserData();
      if (user?.id) {
        fetchCommunities(user.id);
      }
    };
    initializeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const reloadData = async () => {
        const user = await fetchUserData();
        if (user?.id) {
          fetchCommunities(user.id);
        }
      };
      reloadData();
    }, [fetchCommunities]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const user = await fetchUserData();
    if (user?.id) {
      fetchCommunities(user.id);
    }
  }, [fetchCommunities]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCommunities(myCommunities);
      return;
    }

    const filtered = allCommunities.filter(
      community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        myCommunities.some(myCommunity => myCommunity.id === community.id),
    );

    setFilteredCommunities(filtered);
  }, [searchQuery, myCommunities, allCommunities]);

  if (userLoading || loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#8337B2" />
        {/* <LottieLoader visible={loading} /> */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <Text style={{textAlign: 'center'}}>User data not available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          padding: 16,
          alignItems: 'center',
          gap: 5,
        }}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateCommunity')}
          style={[
            // styles.searchContainer,
            {
              backgroundColor: '#8337B2',
              // width: '30%',
              height: 40,
              width: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Icon name={'add'} color={'#fff'} size={24} />
          {/* <Text style={{color: '#fff', textAlign: 'center'}}>Create Community</Text> */}
        </TouchableOpacity>
      </View>

      {seachedcommunities.length > 0 && (
        <FlatList
          data={seachedcommunities}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          renderItem={renderItem}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={sortedCommunities}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No joined communities found</Text>
          </View>
        }
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('IndividualChat', {community: item})
            }
            style={[styles.chatCard, index === 0 && styles.highlightedChat]}>
            <Image
              source={item.avatar}
              style={styles.chatAvatar}
              defaultSource={require('../Assests/Images/dog.png')}
            />
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMsg}>{item.message}</Text>
              <Text style={styles.creatorText}>
                Created by: {item.creator?.first_name} {item.creator?.last_name}
              </Text>
            </View>
            <View style={styles.chatMeta}>
              <Text style={styles.chatTime}>{item.time}</Text>

              <TouchableOpacity
                onPress={() => togglePinChat(item.id)}
                style={{marginTop: 10}}>
                <Text style={{color: '#8337B2', fontWeight: 'bold'}}>
                  {pinnedChatIds.includes(item.id) ? '📌' : 'Pin'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredCommunities}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No joined communities found</Text>
          </View>
        }
        renderItem={({item, index}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('IndividualChat', {community: item})
            }
            style={[styles.chatCard, index === 0 && styles.highlightedChat]}>
            <Image
              source={item.avatar}
              style={styles.chatAvatar}
              defaultSource={require('../Assests/Images/dog.png')}
            />
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMsg}>{item.message}</Text>
              <Text style={styles.creatorText}>
                Created by: {item.creator?.first_name} {item.creator?.last_name}
              </Text>
            </View>
            <View style={styles.chatMeta}>
              <Text style={styles.chatTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      /> */}

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    marginVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8337B2',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  chatCard: {
    height: 100,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  highlightedChat: {
    backgroundColor: '#f0e5ff',
    borderLeftWidth: 4,
    borderColor: '#8337B2',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    marginRight: 10,
    // flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  chatMsg: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  creatorText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  chatTime: {
    fontSize: 11,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  joinButton: {
    marginTop: 6,
    backgroundColor: '#8337B2',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chats;

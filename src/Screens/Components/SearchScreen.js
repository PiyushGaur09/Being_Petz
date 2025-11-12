import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load user data from AsyncStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const userId = userData.id;
          setParentId(userId.toString());
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Debounced API call
  useEffect(() => {
    if (!parentId) return;

    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsers(searchQuery);
      } else {
        setFilteredUsers([]);
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, parentId]);

  const searchUsers = async query => {
    if (!parentId) {
      console.log('Parent ID not available yet');
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append('parent_id', parentId);
      formData.append('search', query);

      const response = await fetch(
        'https://beingpetz.com/petz-info/public/api/v1/pet/friends/search-user',
        {
          method: 'POST',
          body: formData,
        },
      );
      
      const data = await response.json();
      if (data && data.data) {
        setFilteredUsers(data.data);
      } else {
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Search API Error:', error);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const baseUrl = 'https://beingpetz.com/petz-info/public/';

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('PersonalProfile', {item});
      }}
      style={styles.userItem}>
      <Image
        source={{
          uri: item.profile
            ? `${baseUrl}${item.profile}`
            : 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text
          style={
            styles.username
          }>{`${item.first_name} ${item.last_name}`}</Text>
        <Text style={styles.name}>{item.email}</Text>
        {item.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>
            {item.mutualFriends} mutual friend
            {item.mutualFriends !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyResults}>
          <ActivityIndicator size="large" color="#8337B2" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (isSearching && filteredUsers.length === 0) {
      return (
        <View style={styles.emptyResults}>
          <Icon name="users" size={50} color="#777" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubText}>
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Icon name="search" size={50} color="#8337B2" />
        <Text style={styles.emptyStateText}>Search for users</Text>
        <Text style={styles.emptyStateSubText}>
          Find friends by name or email
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#8337B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              setFilteredUsers([]);
              setIsSearching(false);
            }}
            style={styles.clearButton}>
            <Icon name="x" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 || isSearching ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={
            filteredUsers.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    margin: 15,
    borderWidth: 1,
    borderColor: '#8337B2',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  emptyListContainer: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  name: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  mutualFriends: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
    marginTop: 10,
  },
  emptySubText: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    color: '#8337B2',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '500',
  },
  emptyStateSubText: {
    color: '#777',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchScreen;
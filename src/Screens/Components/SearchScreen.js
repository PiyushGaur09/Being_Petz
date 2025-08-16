import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const parentId = '10'; // Replace with dynamic parent_id if needed

  console.log(filteredUsers, 'filteredUsers');

  // Debounced API call
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchUsers(searchQuery);
      } else {
        setFilteredUsers([]);
      }
    }, 400); // Debounce time

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const searchUsers = async query => {
    const formData = new FormData();
    formData.append('parent_id', parentId);
    formData.append('search', query);

    try {
      const response = await fetch(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/search-user',
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await response.json();
      if (data && data.data) {
        setFilteredUsers(data.data); // Update according to API response structure
      } else {
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Search API Error:', error);
      setFilteredUsers([]);
    }
  };

  const baseUrl = 'https://argosmob.com/being-petz/public/';

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
      {/* <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Send Request</Text>
      </TouchableOpacity> */}
    </TouchableOpacity>
  );

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
          placeholder="Search"
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="x" size={20} color="#777" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyResults}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="search" size={50} color="#8337B2" />
          <Text style={styles.emptyStateText}>Search for users</Text>
        </View>
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
    width: 24, // Same as back button for balance
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    margin: 15,
    borderWidth: 1,
    borderColor: '#8337B2',
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 15,
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
  followButton: {
    backgroundColor: '#8337B2',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 5,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#8337B2',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '500',
  },
});

export default SearchScreen;

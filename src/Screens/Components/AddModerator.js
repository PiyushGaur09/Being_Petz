import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddModerator = ({route, navigation}) => {
  const {communityId, onModeratorAdded} = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCommunityMembers = async () => {
      try {
        const formData = new FormData();
        formData.append('community_id', communityId);

        const response = await axios.post(
          'https://argosmob.uk/being-petz/public/api/v1/pet/community/details',
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
          },
        );

        if (response.data.status) {
          // Filter out existing admins/moderators and only show regular members
          const regularMembers = response.data.data.members.filter(
            m => m.role === 'member',
          );
          setMembers(regularMembers);
        } else {
          setError('Failed to fetch community members');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityMembers();
  }, [communityId]);

  const handleAddModerator = userId => {
    onModeratorAdded(userId);
    navigation.goBack();
  };

  const filteredMembers = members.filter(member =>
    member.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search members..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredMembers}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.memberItem}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.user.name}</Text>
              <Text style={styles.memberDetails}>
                {item.user.type} • {item.user.breed}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddModerator(item.parent_id)}>
              <MaterialIcons name="add-circle" size={24} color="#28a745" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
  },
  memberDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  addButton: {
    marginLeft: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 16,
  },
});

export default AddModerator;

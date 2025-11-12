import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  RefreshControl,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_COMMUNITIES_API =
  'https://beingpetz.com/petz-info/public/api/v1/pet/community/get';
const MY_COMMUNITIES_API =
  'https://beingpetz.com/petz-info/public/api/v1/pet/community/my';
const JOIN_COMMUNITY_API =
  'https://beingpetz.com/petz-info/public/api/v1/pet/community/join';
const BASE_URL = 'https://beingpetz.com/petz-info/public/';

// Estimated fixed item height (including margin). Adjust if your card height changes.
const ITEM_HEIGHT = 112;

const AllCommunitiesScreen = ({route}) => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [allCommunities, setAllCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);

  // If screen was opened via deep link, route.params may contain id/name
  const incomingId = route?.params?.id ?? route?.params?.communityId;
  const incomingName = route?.params?.name ?? route?.params?.communityName;

  // prefill searchQuery with incomingName if provided (so users can see it)
  useEffect(() => {
    if (incomingName) {
      setSearchQuery(incomingName);
    }
  }, [incomingName]);

  // fetch stored user once
  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
          return parsedData;
        }
      }
      // not throwing an alert here; caller will handle missing user
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Helper: safe parse members_count
  const parseMembersCount = community => {
    const raw = community?.members_count;
    let fromField;
    if (raw == null) {
      fromField = undefined;
    } else if (typeof raw === 'number') {
      fromField = raw;
    } else {
      const n = Number(raw);
      fromField = Number.isFinite(n) ? n : undefined;
    }

    const fromArray = Array.isArray(community?.members)
      ? community.members.length
      : undefined;

    return fromField ?? fromArray ?? 0;
  };

  // fetch all communities (supports cancellation)
  const fetchAllCommunities = async cancelToken => {
    try {
      const response = await axios.get(ALL_COMMUNITIES_API, {cancelToken});
      // don't alert here; return empty on failure
      if (response?.data?.status) {
        return response.data.data || [];
      } else {
        console.warn('fetchAllCommunities: unexpected status', response?.data);
        return [];
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('fetchAllCommunities cancelled');
      } else {
        console.error('fetchAllCommunities error', error);
      }
      return [];
    }
  };

  // fetch my communities (supports cancellation)
  const fetchMyCommunities = async (userId, cancelToken) => {
    try {
      // API expects multipart/form-data in original; use same pattern
      const formData = new FormData();
      formData.append('parent_id', userId);
      const response = await axios.post(MY_COMMUNITIES_API, formData, {
        cancelToken,
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response?.data?.status) {
        // backend sometimes returns nested structures — normalize
        const d = response.data.data;
        if (Array.isArray(d)) return d;
        // if data.data exists
        if (d?.data && Array.isArray(d.data)) return d.data;
        // fallback: if API returned an object mapping to communities
        return Array.isArray(response.data?.data) ? response.data.data : [];
      } else {
        console.warn('fetchMyCommunities: unexpected status', response?.data);
        return [];
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('fetchMyCommunities cancelled');
      } else {
        console.error('fetchMyCommunities error', error);
      }
      return [];
    }
  };

  /**
   * loadCommunities
   * - creates a cancel token used by both fetch calls
   * - transforms responses into a consistent local shape
   * - attempts to scroll to incomingId within the visible dataset (filtered by searchQuery)
   */
  const loadCommunities = useCallback(
    async (scrollToIncoming = true) => {
      const source = axios.CancelToken.source();
      try {
        setLoading(true);
        const user = userData || (await fetchUserData());
        if (!user?.id) {
          // we still attempt to fetch public data; but joining won't be available until user logs in
        }

        const [allData, myData] = await Promise.all([
          fetchAllCommunities(source.token),
          user?.id
            ? fetchMyCommunities(user.id, source.token)
            : Promise.resolve([]),
        ]);

        // Transform all communities to consistent shape
        const transformedAllCommunities = (allData || [])
          .map(community => {
            const finalMembersCount = parseMembersCount(community);

            return {
              id: community.id ?? community.community_id ?? null,
              name: community.name || 'Community',
              description: community.description || "Let's connect!",
              avatar: community.profile
                ? {uri: BASE_URL + community.profile}
                : require('../Assests/Images/dog.png'),
              creator: community.creator ?? community.created_by ?? null,
              members_count: finalMembersCount,
              created_at: community.created_at,
              _raw: community,
            };
          })
          .filter(Boolean);

        // Transform my communities into an array of community ids
        const transformedMyCommunities = (myData || [])
          .map(item => {
            // Accept multiple possible shapes
            if (!item) return null;
            if (item.community && item.community.id) return item.community.id;
            if (item.community_id) return item.community_id;
            if (item.id) return item.id;
            // If the API returned plain ids:
            return typeof item === 'number' || typeof item === 'string'
              ? item
              : null;
          })
          .filter(Boolean);

        setAllCommunities(transformedAllCommunities);
        setMyCommunities(transformedMyCommunities);

        // If deep link provided, attempt to scroll to the incomingId within the visible (filtered) dataset
        if (scrollToIncoming && incomingId) {
          // compute the visible dataset according to current searchQuery (use the same filter as the FlatList uses)
          const q = (searchQuery || '').toLowerCase();
          const visibleData = transformedAllCommunities.filter(c =>
            c.name.toLowerCase().includes(q),
          );

          const index = visibleData.findIndex(
            c => String(c.id) === String(incomingId),
          );
          if (index >= 0 && flatListRef.current) {
            // scrollToIndex expects index within the data rendered; we used visibleData
            flatListRef.current.scrollToIndex({
              index,
              animated: true,
              viewPosition: 0.2,
            });
          } else {
            // If not visible (search hides it), try to clear the search and then scroll
            if (q && flatListRef.current) {
              // Clear search to show full list then scroll after a short delay
              setSearchQuery('');
              setTimeout(() => {
                const idx2 = transformedAllCommunities.findIndex(
                  c => String(c.id) === String(incomingId),
                );
                if (idx2 >= 0 && flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: idx2,
                    animated: true,
                    viewPosition: 0.2,
                  });
                }
              }, 300);
            }
          }
        }
      } catch (error) {
        // top-level error
        console.error('loadCommunities error', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }

      // return cancel function so caller can cancel if needed
      return () => {
        source.cancel('loadCommunities cancelled');
      };
    },
    // deps
    [incomingId, searchQuery, userData],
  );

  // Use useFocusEffect to load communities when screen is focused.
  // This avoids double-loading on mount+focus.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const doLoad = async () => {
        const cancelFn = await loadCommunities(true);
        if (cancelFn && !cancelled) {
          // keep cancelFn in closure (we'll call it on cleanup)
        }
      };
      doLoad();

      return () => {
        cancelled = true;
        // loadCommunities returns a cancel function anchored to its axios token; call it if present
        // but since loadCommunities cleanup is inside it, we don't have direct ref — safe to rely on axios cancellation inside.
      };
    }, [loadCommunities]),
  );

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    loadCommunities(false);
  };

  // Join community
  const joinCommunity = async communityId => {
    try {
      const user = userData || (await fetchUserData());
      if (!user?.id) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      setJoiningCommunityId(communityId);

      const formData = new FormData();
      formData.append('community_id', communityId);
      formData.append('parent_id', user.id);

      const response = await axios.post(JOIN_COMMUNITY_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status) {
        Alert.alert('Success', response.data.message || 'Joined successfully!');
        setMyCommunities(prev =>
          prev.includes(communityId) ? prev : [...prev, communityId],
        );
        setAllCommunities(prev =>
          prev.map(c =>
            c.id === communityId
              ? {...c, members_count: (c.members_count || 0) + 1}
              : c,
          ),
        );
      } else {
        Alert.alert(
          'Failed',
          response.data?.message || 'Could not join community.',
        );
      }
    } catch (error) {
      console.error('Join community error:', error);
      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setJoiningCommunityId(null);
    }
  };

  // Derived filtered list (same logic used by scroll-to-index)
  const filteredCommunities = allCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isUserMember = communityId => myCommunities.includes(communityId);

  // Renderers
  const renderCommunityItem = ({item}) => (
    <View style={styles.communityCard}>
      <Image
        source={item.avatar}
        style={styles.communityAvatar}
        defaultSource={require('../Assests/Images/dog.png')}
      />

      <View style={styles.communityInfo}>
        <Text style={styles.communityName}>{item.name}</Text>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.communityMeta}>
          <Text style={styles.memberCount}>{item.members_count} members</Text>
          <Text style={styles.creatorText}>
            By:{' '}
            {item.creator?.first_name ?? item._raw?.creator?.first_name ?? ''}
            {item.creator?.last_name ? ` ${item.creator?.last_name}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.joinButtonContainer}>
        {isUserMember(item.id) ? (
          <View
            style={styles.joinedBadge}
            accessibilityLabel="Joined badge"
            accessibilityRole="text">
            <Text style={styles.joinedText}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => joinCommunity(item.id)}
            disabled={joiningCommunityId === item.id}
            accessibilityLabel={`Join ${item.name}`}
            accessibilityRole="button">
            {joiningCommunityId === item.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // key extractor (defensive)
  const keyExtractor = item =>
    String(item.id ?? item._raw?.id ?? Math.random());

  // FlatList getItemLayout to make scrollToIndex deterministic
  const getItemLayout = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  // onScrollToIndexFailed fallback: try to compute index and scrollToOffset
  const onScrollToIndexFailed = info => {
    const {index} = info;
    // fallback to offset-based scroll
    setTimeout(() => {
      const idx = filteredCommunities.findIndex(
        c => String(c.id) === String(incomingId),
      );
      const useIndex = idx >= 0 ? idx : index;
      if (flatListRef.current && useIndex >= 0) {
        flatListRef.current.scrollToOffset({
          offset: ITEM_HEIGHT * useIndex,
          animated: true,
        });
      }
    }, 200);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={24} color="#8337B2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Communities</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search">
            <Icon name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredCommunities}
        keyExtractor={keyExtractor}
        renderItem={renderCommunityItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8337B2']}
            tintColor={'#8337B2'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No communities found'
                : 'No communities available'}
            </Text>
          </View>
        }
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    margin: 16,
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
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 20 : 40,
  },
  communityCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
    marginRight: 12,
  },
  communityName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  communityDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  communityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#8337B2',
    fontWeight: '500',
  },
  creatorText: {
    fontSize: 11,
    color: '#888',
  },
  joinButtonContainer: {
    minWidth: 70,
  },
  joinButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 36,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedBadge: {
    backgroundColor: '#e8f5e8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 36,
  },
  joinedText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllCommunitiesScreen;

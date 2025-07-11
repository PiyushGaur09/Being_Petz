import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://argosmob.uk/being-petz/public/api/v1';
const DEFAULT_AVATAR = require('../../Assests/Images/dog.png');

const FriendRequestsModal = ({visible, onClose}) => {
  // State management
  const [state, setState] = useState({
    sentRequests: [],
    receivedRequests: [],
    loading: false,
    userData: null,
    activeTab: 'received',
    processingRequest: null, // Track which request is being processed
  });

  // console.log('state', state.sentRequests, state.receivedRequests);
  // console.log('state5', currentRequests);

  // Memoized values
  const currentRequests = useMemo(
    () =>
      state.activeTab === 'received'
        ? state.receivedRequests
        : state.sentRequests,
    [state.activeTab, state.receivedRequests, state.sentRequests],
  );

  const hasRequests = useMemo(
    () => currentRequests.length > 0,
    [currentRequests],
  );

  // API calls
  const fetchUserData = useCallback(async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setState(prev => ({...prev, userData: parsedData}));
        return parsedData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    }
    return null;
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    const userData = await fetchUserData();
    if (!userData?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    setState(prev => ({...prev, loading: true}));
    try {
      const formData = new FormData();
      formData.append('parent_id', userData.id);

      const response = await axios.post(
        `${API_URL}/pet/friends/get-requests`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}, timeout: 10000},
      );

      setState(prev => ({
        ...prev,
        sentRequests: response.data?.sent_requests || [],
        receivedRequests: response.data?.received_requests || [],
      }));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      Alert.alert(
        'Error',
        'Failed to load friend requests. Please check your connection and try again.',
      );
    } finally {
      setState(prev => ({...prev, loading: false}));
    }
  }, []);

  const handleRequestResponse = useCallback(
    async (requestId, action) => {
      if (state.processingRequest === requestId) return;

      setState(prev => ({...prev, processingRequest: requestId}));

      try {
        const userData = state.userData || (await fetchUserData());
        if (!userData?.id) {
          Alert.alert('Error', 'User information not available');
          return;
        }

        const formData = new FormData();
        formData.append('request_id', requestId);
        formData.append(
          'action',
          action === 'accept' ? 'accepted' : 'rejected',
        );
        formData.append('parent_id', userData.id);

        await axios.post(`${API_URL}/pet/friends/respond-request`, formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        });

        await fetchFriendRequests();
        Alert.alert(
          'Success',
          `Request ${
            action === 'accept' ? 'accepted' : 'declined'
          } successfully`,
        );
      } catch (error) {
        console.error('Error processing request:', error);
        Alert.alert('Error', `Failed to ${action} request. Please try again.`);
      } finally {
        setState(prev => ({
          ...prev,
          processingRequest: null,
        }));
      }
    },
    [fetchFriendRequests, fetchUserData, state.userData],
  );

  // Effects
  useEffect(() => {
    if (visible) {
      fetchFriendRequests();
    }
  }, [visible, fetchFriendRequests]);

  // Component rendering
  const renderRequestItem = useCallback(
    ({item}) => {
      const user =
        state.activeTab === 'received' ? item.from_parent : item.to_parent;
      const avatarSource = user?.profile
        ? {uri: `https://argosmob.uk/being-petz/public/${user.profile}`}
        : DEFAULT_AVATAR;

      const isProcessing = state.processingRequest === item.id;

      return (
        <View style={styles.requestItem}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            defaultSource={DEFAULT_AVATAR}
          />
          <View style={styles.requestInfo}>
            <Text style={styles.name}>{`${user?.first_name} ${user?.last_name}` || 'Unknown User'}</Text>
            <Text style={styles.breed}>{user?.email || ''}</Text>
            {item?.created_at && (
              <Text style={styles.requestDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            )}

            {state.activeTab === 'sent' ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Status:</Text>
                <Text style={styles.pendingStatus}>{item.status}</Text>
              </View>
            ) : (
              <View style={styles.actions}>
                <ActionButton
                  text={isProcessing ? 'Processing...' : 'Accept'}
                  onPress={() => handleRequestResponse(item.id, 'accept')}
                  primary
                  disabled={isProcessing}
                />
                <ActionButton
                  text={isProcessing ? 'Processing...' : 'Decline'}
                  onPress={() => handleRequestResponse(item.id, 'reject')}
                  disabled={isProcessing}
                />
              </View>
            )}
          </View>
        </View>
      );
    },
    [state.activeTab, handleRequestResponse, state.processingRequest],
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Icon
          name={
            state.activeTab === 'received'
              ? 'account-question-outline'
              : 'send-outline'
          }
          size={60}
          color="#ccc"
        />
        <Text style={styles.noRequestsText}>
          {state.activeTab === 'received'
            ? 'No received friend requests'
            : 'No sent friend requests'}
        </Text>
      </View>
    ),
    [state.activeTab],
  );

  const renderTabButton = useCallback(
    (tab, label) => (
      <TouchableOpacity
        style={[styles.tabButton, state.activeTab === tab && styles.activeTab]}
        onPress={() => setState(prev => ({...prev, activeTab: tab}))}
        disabled={state.loading}>
        <View style={styles.tabContent}>
          <Text
            style={[
              styles.tabText,
              state.activeTab === tab && styles.activeTabText,
            ]}>
            {label}
          </Text>
          {state[`${tab}Requests`].length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {state[`${tab}Requests`].length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [
      state.activeTab,
      state.receivedRequests.length,
      state.sentRequests.length,
      state.loading,
    ],
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Friend Requests</Text>
            <TouchableOpacity onPress={onClose} disabled={state.loading}>
              <Icon name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            {renderTabButton('received', 'Received')}
            {renderTabButton('sent', 'Sent')}
          </View>

          {state.loading ? (
            <ActivityIndicator
              size="large"
              color="#8337B2"
              style={styles.loader}
            />
          ) : (
            <FlatList
              data={currentRequests}
              keyExtractor={item => `request-${item.id}`}
              renderItem={renderRequestItem}
              ListEmptyComponent={renderEmptyState()}
              contentContainerStyle={!hasRequests && styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Reusable components
const ActionButton = ({text, onPress, primary = false, disabled = false}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      primary ? styles.primaryButton : styles.secondaryButton,
      disabled && styles.disabledButton,
    ]}
    onPress={onPress}
    disabled={disabled}>
    <Text
      style={[
        primary ? styles.primaryButtonText : styles.secondaryButtonText,
        disabled && styles.disabledButtonText,
      ]}>
      {text}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
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
  activeTab: {
    borderBottomColor: '#8337B2',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#8337B2',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#8337B2',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noRequestsText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  requestItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  requestInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
  },
  breed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8337B2',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelText: {
    color: '#ff4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusText: {
    color: '#666',
    marginRight: 5,
  },
  pendingStatus: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#8337B2',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8337B2',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#8337B2',
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.6,
  },
});

export default FriendRequestsModal;

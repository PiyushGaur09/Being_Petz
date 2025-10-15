import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';

const CommunityInfo = ({route, navigation}) => {
  const {community} = route.params;
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exitLoading, setExitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const formData = new FormData();
        formData.append('community_id', community?.id);

        const response = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/pet/community/details',
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
          },
        );

        if (response.data.status) {
          setCommunityData(response?.data?.data);
          setNewName(response?.data?.data?.name);

          const userDataString = await AsyncStorage.getItem('user_data');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            const userId = userData.id;
            setCurrentUserId(userId);

            const member = response.data.data.members?.find(
              m => m.parent_id === userId,
            );
            if (member) {
              setCurrentUserRole(member.role);
            }
          }
        } else {
          setError('Failed to fetch community details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [community]);

  const refreshCommunityData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('community_id', community?.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/details',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data.status) {
        setCommunityData(response.data.data);
        setNewName(response.data.data.name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      if (image) {
        setImageUri(image.path);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to select image');
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Community name cannot be empty');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('community_id', communityData.id);
      formData.append('name', newName);
      formData.append('user_id', currentUserId);

      if (imageUri) {
        formData.append('profile', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'community_profile.jpg',
        });
      }

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/update-profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status) {
        Alert.alert('Success', 'Community profile updated successfully');
        refreshCommunityData();
        setIsEditing(false);
        setImageUri(null);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update community profile',
      );
    } finally {
      setUploading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleExitCommunity = async () => {
    try {
      // make sure we know the up-to-date members list and user id
      const members = communityData?.members ?? community?.members ?? [];
      let userId = currentUserId;

      if (!userId) {
        const userDataString = await AsyncStorage.getItem('user_data');
        if (userDataString) {
          const parsed = JSON.parse(userDataString);
          userId = parsed?.id;
        }
      }

      // count members and check whether current user is the last member
      const memberCount = Array.isArray(members) ? members.length : 0;
      const isLastMember =
        memberCount <= 1 &&
        userId != null &&
        members.some(m => m.parent_id === userId);

      const message = isLastMember
        ? 'If you exit now, community and the data in the community will be deleted. Are you sure you want to leave?'
        : 'Are you sure you want to leave this community?';

      // Show appropriate confirm alert
      Alert.alert(
        'Leave Community',
        message,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Leave',
            onPress: async () => {
              try {
                setExitLoading(true);

                if (!userId) {
                  // extra safeguard
                  throw new Error('User data not found');
                }

                const formData = new FormData();
                formData.append(
                  'community_id',
                  community?.id ?? communityData?.id,
                );
                formData.append('user_id', userId);

                const response = await axios.post(
                  'https://argosmob.com/being-petz/public/api/v1/pet/community/left-join',
                  formData,
                  {
                    headers: {'Content-Type': 'multipart/form-data'},
                  },
                );

                if (response.data.status) {
                  // If last member left, you might want to clear local state or navigate differently.
                  // Current behavior: same success alert + reset to Chats screen.
                  Alert.alert(
                    'Success',
                    'You have left the community successfully',
                    [
                      {
                        text: 'OK',
                        onPress: () =>
                          navigation.reset({
                            index: 0,
                            routes: [{name: 'Chats'}],
                          }),
                      },
                    ],
                  );
                } else {
                  setError(
                    response.data.message || 'Failed to leave community',
                  );
                }
              } catch (err) {
                setError(err.message);
              } finally {
                setExitLoading(false);
              }
            },
          },
        ],
        {cancelable: true},
      );
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  // const handleExitCommunity = async () => {
  //   console.log('userId', community?.id);
  //   Alert.alert(
  //     'Leave Community',
  //     'Are you sure you want to leave this community?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Leave',
  //         onPress: async () => {
  //           try {
  //             setExitLoading(true);
  //             const userDataString = await AsyncStorage.getItem('user_data');
  //             if (!userDataString) {
  //               throw new Error('User data not found');
  //             }

  //             const userData = JSON.parse(userDataString);
  //             const userId = userData.id;

  //             const formData = new FormData();
  //             formData.append('community_id', community?.id);
  //             formData.append('user_id', userId);

  //             const response = await axios.post(
  //               'https://argosmob.com/being-petz/public/api/v1/pet/community/left-join',
  //               formData,
  //               {
  //                 headers: {'Content-Type': 'multipart/form-data'},
  //               },
  //             );

  //             if (response.data.status) {
  //               Alert.alert(
  //                 'Success',
  //                 'You have left the community successfully',
  //                 [
  //                   {
  //                     text: 'OK',
  //                     onPress: () =>
  //                       navigation.reset({
  //                         index: 0,
  //                         routes: [{name: 'Chats'}],
  //                       }),
  //                   },
  //                 ],
  //               );
  //             } else {
  //               setError(response.data.message || 'Failed to leave community');
  //             }
  //           } catch (err) {
  //             setError(err.message);
  //           } finally {
  //             setExitLoading(false);
  //           }
  //         },
  //       },
  //     ],
  //     {cancelable: true},
  //   );
  // };

  const handleAddModerator = async userId => {
    try {
      const formData = new FormData();
      formData.append('community_id', community?.id);
      formData.append('parent_id', userId);
      formData.append('role', 'moderator');

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/community/add-role',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data.status) {
        Alert.alert('Success', 'Moderator added successfully');
        refreshCommunityData();
      } else {
        setError(response.data.message || 'Failed to add moderator');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveRole = async userId => {
    Alert.alert(
      'Remove Role',
      'Are you sure you want to remove this role?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              const formData = new FormData();
              formData.append('community_id', community?.id);
              formData.append('parent_id', userId);

              const response = await axios.post(
                'https://argosmob.com/being-petz/public/api/v1/pet/community/remove-role',
                formData,
                {
                  headers: {'Content-Type': 'multipart/form-data'},
                },
              );

              if (response.data.status) {
                Alert.alert('Success', 'Role removed successfully');
                refreshCommunityData();
              } else {
                setError(response.data.message || 'Failed to remove role');
              }
            } catch (err) {
              setError(err.message);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const navigateToAddModerator = () => {
    navigation.navigate('AddModerator', {
      communityId: community.id,
      onModeratorAdded: userId => {
        handleAddModerator(userId);
      },
    });
  };

  const renderAdminSection = () => {
    const hasModerators = communityData.members?.some(
      m => m.role === 'moderator',
    );

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {hasModerators
              ? 'Community Admin'
              : 'Community Admin (Also acts as Moderator)'}
          </Text>
        </View>

        {communityData.creator && (
          <View style={[styles.memberCard, styles.adminCard]}>
            {communityData.creator.profile ? (
              <Image
                source={{
                  uri: `https://argosmob.com/being-petz/public/${communityData.creator.profile}`,
                }}
                style={styles.memberAvatar}
              />
            ) : (
              <View style={[styles.memberAvatar, styles.placeholderAvatar]}>
                <MaterialIcons name="person" size={24} color="#8337B2" />
              </View>
            )}
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {communityData.creator.first_name}{' '}
                {communityData.creator.last_name}
              </Text>
              <Text style={styles.memberRole}>
                {hasModerators
                  ? 'Creator & Admin'
                  : 'Creator, Admin & Moderator'}
              </Text>
              <Text style={styles.memberDetails}>
                {communityData.creator.email}
              </Text>
            </View>
            {(currentUserRole === 'super_admin' ||
              currentUserRole === 'admin') &&
              communityData.creator.id !== currentUserId && (
                <View style={styles.removeButtonContainer}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveRole(communityData.creator.id)}>
                    <MaterialIcons
                      name="remove-circle"
                      size={24}
                      color="#dc3545"
                    />
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}
      </>
    );
  };

  const renderModeratorsSection = () => {
    const moderators =
      communityData.members?.filter(m => m.role === 'moderator') || [];
    const adminId = communityData.creator?.id;
    const isAdmin =
      currentUserId === adminId || currentUserRole === 'super_admin';

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Moderators</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={navigateToAddModerator}>
              <Text style={styles.addButtonText}>+ Add Moderator</Text>
            </TouchableOpacity>
          )}
        </View>

        {moderators.length > 0 ? (
          moderators.map(moderator => (
            <View
              key={moderator.id}
              style={[styles.memberCard, styles.moderatorCard]}>
              {moderator.user.avatar ? (
                <Image
                  source={{
                    uri: `https://argosmob.com/being-petz/public/${moderator.user.avatar}`,
                  }}
                  style={styles.memberAvatar}
                />
              ) : (
                <View style={[styles.memberAvatar, styles.placeholderAvatar]}>
                  <MaterialIcons name="person" size={24} color="#8337B2" />
                </View>
              )}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{moderator.user.name}</Text>
                <Text style={styles.memberRole}>Moderator</Text>
                <Text style={styles.memberDetails}>{moderator.user.email}</Text>
              </View>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveRole(moderator.parent_id)}>
                  <MaterialIcons
                    name="remove-circle"
                    size={24}
                    color="#dc3545"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noModeratorsText}>
            {isAdmin
              ? 'No moderators assigned yet - you are acting as moderator'
              : 'No moderators assigned'}
          </Text>
        )}
      </>
    );
  };

  console.log('communityData', communityData);

  const renderMembersSection = () => {
    // console.log('regularMember', communityData);
    const regularMembers =
      communityData.members?.filter(
        m =>
          m.role === 'member' ||
          (m.role === 'moderator' && communityData.type !== 'public'),
      ) || [];

    console.log('regularMember', regularMembers);

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Members</Text>
          <Text style={styles.membersCount}>
            {regularMembers.length} members
          </Text>
        </View>

        {regularMembers.length > 0 ? (
          regularMembers.map(member => (
            <View key={member.id} style={styles.memberCard}>
              {member?.user?.avatar ? (
                <Image
                  source={{
                    uri: `https://argosmob.com/being-petz/public/${member?.user?.avatar}`,
                  }}
                  style={styles.memberAvatar}
                />
              ) : (
                <View style={[styles.memberAvatar, styles.placeholderAvatar]}>
                  <MaterialIcons name="pets" size={24} color="#8337B2" />
                </View>
              )}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member?.user?.name}</Text>
                {member?.role === 'moderator' &&
                  communityData?.type !== 'public' && (
                    <Text style={styles.memberRole}>Moderator</Text>
                  )}
                <Text style={styles.memberDetails}>
                  {member?.user?.type} • {member?.user?.breed}
                </Text>
              </View>
              {(currentUserRole === 'admin' ||
                currentUserRole === 'super_admin') &&
                member?.role === 'member' &&
                communityData?.type === 'public' && (
                  <TouchableOpacity
                    style={styles.promoteButton}
                    onPress={() => handleAddModerator(member?.parent_id)}>
                    <MaterialIcons
                      name="add-circle"
                      size={24}
                      color="#28a745"
                    />
                  </TouchableOpacity>
                )}
            </View>
          ))
        ) : (
          <Text style={styles.noMembersText}>No members yet</Text>
        )}
      </>
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
      </View>
    );
  }

  if (!communityData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No community data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        {(currentUserRole === 'admin' || currentUserRole === 'super_admin') &&
        isEditing ? (
          <TouchableOpacity onPress={handleChooseImage}>
            {imageUri || communityData.profile ? (
              <Image
                source={{
                  uri:
                    imageUri ||
                    `https://argosmob.com/being-petz/public/${communityData.profile}`,
                }}
                style={styles.communityAvatar}
              />
            ) : (
              <View
                style={[
                  styles.communityAvatar,
                  styles.placeholderCommunityAvatar,
                ]}>
                <FontAwesome name="users" size={40} color="#8337B2" />
              </View>
            )}
            <View style={styles.editAvatarOverlay}>
              <MaterialIcons name="edit" size={24} color="white" />
            </View>
          </TouchableOpacity>
        ) : (
          <>
            {communityData.profile ? (
              <Image
                source={{
                  uri: `https://argosmob.com/being-petz/public/${communityData.profile}`,
                }}
                style={styles.communityAvatar}
              />
            ) : (
              <View
                style={[
                  styles.communityAvatar,
                  styles.placeholderCommunityAvatar,
                ]}>
                <FontAwesome name="users" size={40} color="#8337B2" />
              </View>
            )}
          </>
        )}

        {isEditing ? (
          <TextInput
            style={styles.editNameInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Community name"
            placeholderTextColor="#aaa"
            autoFocus={true}
          />
        ) : (
          <Text style={styles.communityName}>{communityData.name}</Text>
        )}

        <Text style={styles.communityType}>
          {communityData.type === 'public'
            ? 'Public Community'
            : 'Private Community'}
        </Text>

        {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
          <View style={styles.editButtonsContainer}>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}>
                <MaterialIcons name="edit" size={20} color="#8337B2" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setNewName(communityData.name);
                    setImageUri(null);
                    setIsEditing(false);
                  }}>
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.actionButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Community Description */}
      {communityData.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {communityData.description}
          </Text>
        </View>
      )}

      {/* Community Info Sections */}
      <View style={styles.infoContainer}>
        {/* Admin Section */}
        {renderAdminSection()}

        {/* Moderators Section */}
        {renderModeratorsSection()}

        {/* Community Info Cards */}
        <InfoCard
          icon={<MaterialIcons name="event" size={20} color="#8337B2" />}
          title="Created on"
          value={formatDate(communityData.created_at)}
        />

        <InfoCard
          icon={
            <FontAwesome
              name={communityData.type === 'public' ? 'globe' : 'lock'}
              size={20}
              color="#8337B2"
            />
          }
          title="Community Type"
          value={
            communityData?.type.charAt(0).toUpperCase() +
            communityData?.type.slice(1)
          }
        />

        {/* Members Section */}
        {renderMembersSection()}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.manageButton]}
            onPress={() =>
              navigation.navigate('ManageCommunity', {community: communityData})
            }>
            <Feather name="settings" size={20} color="white" />
            <Text style={styles.actionButtonText}>Manage Community</Text>
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          style={[styles.actionButton, styles.exitButton]}
          onPress={handleExitCommunity}
          disabled={exitLoading}>
          {exitLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Feather name="log-out" size={20} color="white" />
              <Text style={[styles.actionButtonText, {marginLeft: 10}]}>
                Exit Community
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InfoCard = ({icon, title, value}) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  communityAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  placeholderCommunityAvatar: {
    backgroundColor: '#f0e6f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 5,
    textAlign: 'center',
  },
  editNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#8337B2',
    padding: 5,
    width: '100%',
  },
  communityType: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
    marginBottom: 15,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    // marginTop: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#f0e6f6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#8337B2',
    fontWeight: 'bold',
    marginLeft: 5,
    textAlign: 'center',
    alignSelf: 'center',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 15,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
  },
  membersCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8337B2',
  },
  moderatorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  placeholderAvatar: {
    backgroundColor: '#f0e6f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#343a40',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#8337B2',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  memberDetails: {
    fontSize: 12,
    color: '#6c757d',
  },
  noModeratorsText: {
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  noMembersText: {
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 'auto',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  manageButton: {
    backgroundColor: '#8337B2',
  },
  exitButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    // marginLeft: 10,
    textAlign: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  addButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0e6f6',
  },
  addButtonText: {
    color: '#8337B2',
    fontWeight: 'bold',
  },
  removeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  removeButton: {
    padding: 5,
  },
  promoteButton: {
    padding: 5,
  },
});

export default CommunityInfo;

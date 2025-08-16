import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FriendRequestsModal from './Components/FriendRequestsModal';
import SuggestFriend from './Components/SuggestFriend';
import Header from './Components/Header';
import AdvancedFloatingButton from './Components/AdvancedFloatingButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import petIdEmitter from './Components/PetIdEmitter';
import VideoPlayer from './Components/VideoPlayer';
import UpdatePostModal from './Components/UpdatePostModal';
import DraggableButton from './Components/AdvancedFloatingButton';
import BannerCarousel from './Components/BannerCarousel';
import HomeHeader from './Components/HomeHeader';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import Video from 'react-native-video';
import LottieLoader from './Components/LottieLoader';

const Home = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const {height, width} = Dimensions.get('window');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [postsData, setPostsData] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  const [posting, setPosting] = useState(false);
  const [modalCommentVisible, setModalCommentVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [postingComment, setPostingComment] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [likingPosts, setLikingPosts] = useState({});
  const [allPosts, setAllPosts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  // const [expanded, setExpanded] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reporting, setReporting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [parentComment, setParentComment] = useState({});

  const characterLimit = 150;

  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);

    // let message = defaultMessage;
    // if (error.response) {
    //   message =
    //     error.response.data?.message ||
    //     error.response.statusText ||
    //     defaultMessage;
    // } else if (error.message) {
    //   message = error.message;
    // }

    // Dialog.show({
    //   type: ALERT_TYPE.DANGER,
    //   title: 'Error',
    //   textBody: message,
    //   button: 'OK',
    // });

    // console.log(message);

    // return message;
  };

  const isFocused = useIsFocused();

  const renderComment = ({item}) => {
    const [parentComment, setParentComment] = useState(null);
    const [loadingParent, setLoadingParent] = useState(false);

    // Fetch parent comment if this is a reply
    useEffect(() => {
      if (item?.parent_id) {
        const fetchParentComment = async () => {
          try {
            setLoadingParent(true);
            const formData = new FormData();
            formData.append('user_id', item.parent_id);

            const response = await axios.post(
              'https://argosmob.uk/being-petz/public/api/v1/auth/my-detail',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              },
            );

            if (response.data?.status && response.data?.user) {
              setParentComment(response.data.user);
            }
          } catch (error) {
            console.error('Error fetching parent comment:', error);
          } finally {
            setLoadingParent(false);
          }
        };

        fetchParentComment();
      }
    }, [item?.parent_id]);

    return (
      <View style={styles.commentItem}>
        {/* Main comment */}
        <Text
          style={styles.commentUser}
          accessible={true}
          accessibilityRole="text">
          {item?.user?.name || 'User'}
        </Text>

        {/* Show parent comment if this is a reply */}
        {item?.parent_id && (
          <View style={styles.parentCommentContainer}>
            {loadingParent ? (
              <ActivityIndicator size="small" color="#8337B2" />
            ) : (
              <>
                <Text style={styles.parentCommentLabel}>
                  Replying to {parentComment?.name || 'user'}:
                </Text>
                {parentComment?.comment && (
                  <Text style={styles.parentCommentText}>
                    {parentComment.comment}
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Current comment text */}
        <Text
          style={styles.commentText}
          accessible={true}
          accessibilityRole="text">
          {item.comment}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      if (isFocused && isMounted) {
        try {
          const response = await axios.get(
            'https://argosmob.com/being-petz/public/api/v1/post/all',
            {signal: controller.signal},
          );
          if (isMounted) {
            setAllPosts(response?.data?.data?.data);
          }
        } catch (err) {
          if (isMounted && !axios.isCancel(err)) {
            handleApiError(err, 'Failed to fetch posts');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchData();
    fetchUserData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isFocused]);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
        } else {
          throw new Error('Invalid user data format');
        }
      } else {
        throw new Error('No user data found');
      }
    } catch (error) {
      handleApiError(error, 'Error fetching user data');
    }
  };

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        'https://argosmob.com/being-petz/public/api/v1/post/all',
      );
      setAllPosts(response?.data?.data?.data);
    } catch (err) {
      handleApiError(err, 'Failed to fetch posts');
    } finally {
      setRefreshing(false);
    }
  };

  const validateUserData = () => {
    if (!userData?.id) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'User data not found. Please login again.',
        button: 'OK',
      });
      return false;
    }
    return true;
  };

  const handleLikePost = async postId => {
    if (!validateUserData()) return;

    try {
      setLikingPosts(prev => ({...prev, [postId]: true}));

      const formData = new FormData();
      formData.append('post_id', postId);
      formData.append('parent_id', userData.id.toString()); // Ensure it's a string

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/like',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status || response.data.message === 'Post liked') {
        setAllPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  likes_count:
                    response.data.likes_count ||
                    post.likes_count + (post.is_liked ? -1 : 1),
                  is_liked: !post.is_liked,
                }
              : post,
          ),
        );
      }
    } catch (error) {
      handleApiError(error, 'Failed to like post');
    } finally {
      setLikingPosts(prev => ({...prev, [postId]: false}));
    }
  };

  const PostCard = React.memo(({item}) => {
    if (item?.repost_id) {
      return <PostCardRepost item={item} />;
    } else if (item?.post_type == 'birthday') {
      return <PostCardBirthday item={item} />;
    } else {
      return <PostCardOriginal item={item} />;
    }
  });

  const handleRepost = async item => {
    try {
      if (!userData?.id) {
        throw new Error('User not authenticated');
      }

      if (!item?.id) {
        throw new Error('Invalid post');
      }

      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('post_id', item.id);
      formData.append('is_public', '1');

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/re-post',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 10000,
        },
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Post reposted successfully!',
        button: 'OK',
      });

      return response.data;
    } catch (error) {
      console.error('Repost error:', error);
      let errorMessage = 'Error in repost';
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.statusText ||
          'Server error';
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - please try again';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: errorMessage,
        button: 'OK',
      });
      throw error;
    } finally {
    }
  };

  const PostCardBirthday = ({item}) => {
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [paused, setPaused] = useState(true);
    const scrollRef = useRef(null);
    const characterLimit = 150;

    const isLongText = item?.content?.length > characterLimit;
    const displayText = expanded
      ? item?.content
      : item?.content?.slice(0, characterLimit);

    // Birthday-specific styling
    const birthdayStyles = {
      container: {
        backgroundColor: '#FFF9F9',
        borderColor: '#FFD6E7',
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
      userName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
      },
      postTime: {
        fontSize: 12,
        color: '#888',
      },
      birthdayContent: {
        backgroundColor: '#FFEEF6',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
      },
      birthdayText: {
        fontSize: 16,
        color: '#D23369',
        textAlign: 'center',
        lineHeight: 24,
      },
      petInfo: {
        // flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        justifyContent: 'center',
      },
      petAvatar: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginRight: 10,
      },
      petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D23369',
      },
      petType: {
        fontSize: 14,
        color: '#888',
      },
    };

    return (
      <View style={birthdayStyles.container}>
        {/* Post Header */}
        <View style={birthdayStyles.header}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
            }}
            style={birthdayStyles.profileImage}
          />
          <View style={{flex: 1}}>
            <Text style={birthdayStyles.userName}>
              {item?.parent?.first_name} {item?.parent?.last_name}
            </Text>
            <Text style={birthdayStyles.postTime}>
              {item?.created_at_human}
            </Text>
          </View>
          <TouchableOpacity>
            <Icon name="dots-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Birthday Content */}
        <View style={birthdayStyles.birthdayContent}>
          <Text style={birthdayStyles.birthdayText}>{item?.content}</Text>

          {/* Pet Info */}
          <View style={birthdayStyles.petInfo}>
            <Image
              source={{
                uri: `https://argosmob.com/being-petz/public/${item?.pet?.avatar}`,
              }}
              style={birthdayStyles.petAvatar}
            />
            <View>
              {/* <Text style={birthdayStyles.petName}>{item?.pet?.name}</Text>
              <Text style={birthdayStyles.petType}>
                {item?.pet?.type} • {item?.pet?.breed}
              </Text> */}
            </View>
          </View>
        </View>

        {/* Post Actions */}
        <View style={{marginTop: 10}}>
          <PostActions item={item} />
        </View>
      </View>
    );
  };

  const PostCardOriginal = ({item}) => {
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [paused, setPaused] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);
    const characterLimit = 150;
    const [imageHeight, setImageHeight] = useState(480);

    const calculateImageHeight = imageUri => {
      Image.getSize(
        imageUri,
        (widthImg, heightImg) => {
          const ratio = heightImg / widthImg;
          const calculatedHeight =
            (Dimensions.get('window').width - 32) * ratio;
          setImageHeight(calculatedHeight);
        },
        error => {
          console.error("Couldn't get image size:", error);
        },
      );
    };

    useEffect(() => {
      if (item?.featured_image) {
        const uri = `https://argosmob.com/being-petz/public/${item.featured_image}`;
        calculateImageHeight(uri);
      }
    }, [item?.featured_image]);

    const videoHeight = Dimensions.get('window').width - 32;

    const isLongText = item?.content?.length > characterLimit;
    const displayText = expanded
      ? item?.content
      : item?.content?.slice(0, characterLimit);
    const allMedia = [
      ...(item?.featured_image
        ? [{uri: item.featured_image, isVideo: false}]
        : []),
      ...(item?.featured_video
        ? [{uri: item.featured_video, isVideo: true}]
        : []),
      ...(item?.images?.map(img => ({uri: img.image_path, isVideo: false})) ||
        []),
      ...(item?.videos?.map(vid => ({uri: vid.video_path, isVideo: true})) ||
        []),
    ];

    const hasMedia = allMedia.length > 0;
    const multipleMedia = allMedia.length > 1;

    const handleMediaPress = (mediaUri, isVideo = false) => {
      setSelectedMedia({uri: mediaUri, isVideo});
      setMediaModalVisible(true);
      setPaused(false);
    };

    const onScrollEnd = event => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const viewSize = event.nativeEvent.layoutMeasurement.width;
      const pageNum = Math.round(contentOffset / viewSize);
      setCurrentIndex(pageNum);
    };

    const renderMediaItem = (media, index) => {
      const uri = `https://argosmob.com/being-petz/public/${media.uri}`;

      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleMediaPress(uri, media.isVideo)}
          activeOpacity={0.8}
          style={{
            width: width - 32,
            marginRight: multipleMedia ? 8 : 0,
            position: 'relative',
            backgroundColor: '#fff',
          }}>
          {media.isVideo ? (
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                backgroundColor: '#fff',
                width: '93%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Video
                source={{uri}}
                style={{
                  width: width - 32,
                  height: '100%',
                  borderRadius: 8,
                }}
                resizeMode="cover"
                paused={true}
                repeat={true}
                posterResizeMode="cover"
                // muted={true}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                }}>
                <Icon
                  name="play-circle"
                  size={70}
                  color="rgba(255,255,255,0.85)"
                />
              </View>
            </View>
          ) : (
            <Image
              source={{uri}}
              style={{
                width: '95.5%',
                height: 400,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 8,
          backgroundColor: '#fff',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 8,
          shadowOffset: {width: 0, height: 2},
          elevation: 2,
          paddingBottom: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingBottom: 8,
          }}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              marginRight: 12,
              backgroundColor: '#eee',
            }}
          />
          <View style={{flex: 1}}>
            <Text style={{fontWeight: '600', fontSize: 15, color: '#252525'}}>
              {item?.parent?.first_name} {item?.parent?.last_name}
            </Text>
            <Text style={{color: '#8583A8', fontSize: 13, marginTop: 2}}>
              {item?.created_at_human}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedPost(item);
              setModalVisible2(true);
            }}>
            <Icon name="dots-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {item?.content && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text
              style={{
                color: '#333',
                fontSize: 14,
                paddingLeft: 10,
              }}>
              {displayText}
              {isLongText && !expanded ? '...' : ''}
              {isLongText && (
                <Text style={{color: '#8337B2', fontWeight: '600'}}>
                  {expanded ? ' Less' : ' More'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}

        {item?.tagged_users?.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 2,
              marginLeft: 10,
            }}>
            <Icon
              name="tag"
              size={16}
              color="#8337B2"
              style={{marginRight: 4}}
            />
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {item.tagged_users.map((user, index) => (
                <View key={user.id}>
                  <Text
                    style={{color: '#8337B2', fontSize: 13, marginRight: 4}}>
                    {user.first_name} {user.last_name}
                    {index < item.tagged_users.length - 1 ? ',' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Media Carousel With Dots & Counter */}
        {hasMedia && (
          <View
            style={{
              width: width,
              alignItems: 'center',
              position: 'relative',
            }}>
            {multipleMedia && (
              <View
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 48,
                  backgroundColor: 'rgba(36,36,36,0.55)',
                  borderRadius: 14,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  zIndex: 1,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 13,
                    letterSpacing: 0.2,
                  }}>
                  {currentIndex + 1}/{allMedia.length}
                </Text>
              </View>
            )}

            <ScrollView
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ref={scrollRef}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              style={{
                width: width - 16,
                height: 400,
              }}
              onMomentumScrollEnd={onScrollEnd}>
              {allMedia.map((media, index) => renderMediaItem(media, index))}
            </ScrollView>
            {multipleMedia && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 8,
                  marginBottom: 2,
                  width: '100%',
                }}>
                {allMedia.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: currentIndex === i ? 8 : 8,
                      height: currentIndex === i ? 8 : 8,
                      borderRadius: currentIndex === i ? 7 : 4,
                      margin: 3,
                      backgroundColor:
                        currentIndex === i ? '#8337B2' : '#D3CCE3',
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{marginTop: 10}}>
          <PostActions item={item} />
        </View>
        <Modal
          visible={mediaModalVisible}
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => {
            setPaused(true);
            setMediaModalVisible(false);
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              marginTop: -StatusBar.currentHeight,
              paddingTop: StatusBar.currentHeight,
            }}>
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}>
              {selectedMedia?.isVideo ? (
                <>
                  <Video
                    source={{uri: selectedMedia.uri}}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="contain"
                    paused={paused}
                    controls={false}
                    repeat={true}
                    // muted={true}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPaused(!paused)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: paused
                        ? 'rgba(0,0,0,0.4)'
                        : 'transparent',
                    }}>
                    {paused && (
                      <View
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          width: 70,
                          height: 70,
                          borderRadius: 35,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Icon name="play" size={40} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <Image
                  source={{uri: selectedMedia?.uri}}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: StatusBar.currentHeight + 20,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 20,
                padding: 10,
              }}
              onPress={() => {
                setPaused(true);
                setMediaModalVisible(false);
              }}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const PostCardRepost = ({item}) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [paused, setPaused] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);
    const characterLimit = 150;

    // Media aggregator
    const getMediaItems = post => [
      ...(post?.featured_image
        ? [{uri: post.featured_image, isVideo: false}]
        : []),
      ...(post?.featured_video
        ? [{uri: post.featured_video, isVideo: true}]
        : []),
      ...(post?.images?.map(img => ({uri: img.image_path, isVideo: false})) ||
        []),
      ...(post?.videos?.map(vid => ({uri: vid.video_path, isVideo: true})) ||
        []),
    ];
    const originalMedia = getMediaItems(item);
    const repostMedia = item?.repost ? getMediaItems(item.repost) : [];
    const allMedia = [...originalMedia, ...repostMedia];

    const hasMedia = allMedia.length > 0;
    const multipleMedia = allMedia.length > 1;
    const videoHeight = Dimensions.get('window').width - 16;

    const isLongText = item?.content?.length > characterLimit;
    const displayText = expanded
      ? item?.content
      : item?.content?.slice(0, characterLimit);

    const handleMediaPress = (mediaUri, isVideo = false) => {
      setSelectedMedia({uri: mediaUri, isVideo});
      setMediaModalVisible(true);
      setPaused(false);
    };

    // For carousel scrolling
    const onScrollEnd = event => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const viewSize = event.nativeEvent.layoutMeasurement.width;
      const pageNum = Math.round(contentOffset / viewSize);
      setCurrentIndex(pageNum);
    };

    // Carousel media render (matches PostCardOriginal)
    const renderMediaItem = (media, index) => {
      const uri = `https://argosmob.com/being-petz/public/${media.uri}`;
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleMediaPress(uri, media.isVideo)}
          activeOpacity={0.8}
          style={{
            width: width - 32,
            marginRight: multipleMedia ? 8 : 0,
            position: 'relative',
          }}>
          {media.isVideo ? (
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                backgroundColor: '#fff',
                width: '95%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Video
                source={{uri}}
                style={{
                  width: '100%',
                  height: 400,
                  // borderRadius: 24,
                }}
                resizeMode="cover"
                paused={true}
                repeat={true}
                posterResizeMode="cover"
                // muted={true}
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                }}>
                <Icon
                  name="play-circle"
                  size={70}
                  color="rgba(255,255,255,0.85)"
                />
              </View>
            </View>
          ) : (
            <Image
              source={{uri}}
              style={{width: '95.5%', height: 400, borderRadius: 8}}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 8,
          backgroundColor: '#fff',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 8,
          shadowOffset: {width: 0, height: 2},
          elevation: 2,
          paddingBottom: 10,
        }}>
        {/* Repost banner */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingBottom: 8,
          }}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              marginRight: 12,
              backgroundColor: '#eee',
            }}
          />
          <View style={{flex: 1}}>
            <Text style={{fontWeight: '600', fontSize: 15, color: '#252525'}}>
              {item?.parent?.first_name} {item?.parent?.last_name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 1,
              }}>
              <Icon
                name="repeat"
                size={14}
                color="#888"
                style={{marginRight: 4}}
              />
              <Text style={{color: '#888', fontSize: 13}}>Reposted</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedPost(item);
              setModalVisible2(true);
            }}>
            <Icon name="dots-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {item?.content != null && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text
              style={{
                color: '#333',
                fontSize: 14,
                paddingLeft: 10,
              }}>
              {displayText}
              {isLongText && !expanded ? '...' : ''}
              {isLongText && (
                <Text style={{color: '#8337B2', fontWeight: '600'}}>
                  {expanded ? ' Less' : ' More'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}

        {/* Carousel (all original + reposted media) */}
        {hasMedia && (
          <View
            style={{
              width: width,
              alignItems: 'center',
              position: 'relative',
            }}>
            {multipleMedia && (
              <View
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 48,
                  backgroundColor: 'rgba(36,36,36,0.55)',
                  borderRadius: 14,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  zIndex: 1,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 13,
                    letterSpacing: 0.2,
                  }}>
                  {currentIndex + 1}/{allMedia.length}
                </Text>
              </View>
            )}

            <ScrollView
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
              ref={scrollRef}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              style={{
                width: width,
                height: 400,
              }}
              onMomentumScrollEnd={onScrollEnd}>
              {allMedia.map((media, index) => renderMediaItem(media, index))}
            </ScrollView>
            {multipleMedia && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 8,
                  // marginBottom: 2,
                  width: '100%',
                }}>
                {allMedia.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: currentIndex === i ? 8 : 8,
                      height: currentIndex === i ? 8 : 8,
                      borderRadius: currentIndex === i ? 7 : 4,
                      margin: 3,
                      backgroundColor:
                        currentIndex === i ? '#8337B2' : '#D3CCE3',
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        {/* Actions */}
        <View style={{marginTop: 10}}>
          <PostActions item={item} />
        </View>

        <Modal
          visible={mediaModalVisible}
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => {
            setPaused(true);
            setMediaModalVisible(false);
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              marginTop: -StatusBar.currentHeight,
              paddingTop: StatusBar.currentHeight,
            }}>
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
              }}>
              {selectedMedia?.isVideo ? (
                <>
                  <Video
                    source={{uri: selectedMedia.uri}}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="contain"
                    paused={paused}
                    controls={false}
                    repeat={true}
                    // muted={true}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPaused(!paused)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: paused
                        ? 'rgba(0,0,0,0.4)'
                        : 'transparent',
                    }}>
                    {paused && (
                      <View
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          width: 70,
                          height: 70,
                          borderRadius: 35,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Icon name="play" size={40} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <Image
                  source={{uri: selectedMedia?.uri}}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: StatusBar.currentHeight + 20,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 20,
                padding: 10,
              }}
              onPress={() => {
                setPaused(true);
                setMediaModalVisible(false);
              }}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const PostActions = ({item}) => {
    console.log('item', item);
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingTop: 8,
          marginTop: 8,
        }}>
        {/* Like Button */}
        <TouchableOpacity
          onPress={() => handleLikePost(item?.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 12,
          }}>
          <Icon
            name={item.is_liked ? 'heart' : 'heart-outline'}
            size={22}
            color={item.is_liked ? '#FF0000' : '#5A5A5A'}
          />
          <Text style={styles.actionText}>{item?.likes_count || 0}</Text>

          <Text style={{fontSize: 14, color: '#5A5A5A'}}>Like</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={() => openCommentModal(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 12,
          }}>
          <Text style={{marginRight: 6, fontSize: 18}}>💬</Text>

          <Text style={styles.actionText}>{item?.comments_count || 0}</Text>

          <Text style={{fontSize: 14, color: '#5A5A5A'}}>Comment</Text>
        </TouchableOpacity>

        {/* Repost Button */}
        <TouchableOpacity
          onPress={() => handleRepost(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 12,
          }}>
          <Text style={{marginRight: 6, fontSize: 18}}>🔄</Text>
          <Text style={{fontSize: 14, color: '#5A5A5A'}}>Repost</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const openCommentModal = post => {
    setModalCommentVisible(true);
    setSelectedPostForComment(post);
    fetchComments(post?.id);
  };

  const fetchComments = async postId => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('post_id', postId);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/get-comment',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status) {
        setComments(response.data.comment || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !selectedPostForComment) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Error',
        textBody: 'Please enter a comment',
        button: 'OK',
      });
      return;
    }

    try {
      setPostingComment(true);
      const formData = new FormData();
      formData.append('post_id', selectedPostForComment.id);
      formData.append('parent_id', userData?.id);
      formData.append('comment', newComment);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/comment',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.status) {
        setNewComment('');
        await fetchComments(selectedPostForComment.id);
      } else {
        throw new Error(response.data.message || 'Failed to post comment');
      }
    } catch (error) {
      handleApiError(error, 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const fetchFriendSuggestions = async () => {
    // if (!userData?.id) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('parent_id', userData?.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/suggestions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setSuggestions(response.data?.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load friend suggestions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('parent_id', userData?.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/get/my',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const postsWithLikeStatus =
        response.data?.data?.data?.map(post => ({
          ...post,
          is_liked: post.is_liked || false,
        })) || [];

      setPostsData(postsWithLikeStatus);
    } catch (error) {
      handleApiError(error, 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchMyPosts();
      fetchFriendSuggestions();
    }

    return () => {
      isMounted = false;
    };
  }, [userData]);

  const sendFriendRequest = async to_parent_id => {
    if (!validateUserData()) return;

    try {
      setRequestStatus(prev => ({...prev, [to_parent_id]: 'loading'}));

      const formData = new FormData();
      formData.append('from_parent_id', userData.id.toString());
      formData.append('to_parent_id', to_parent_id.toString()); // Ensure it's a string

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/send-request',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setRequestStatus(prev => ({...prev, [to_parent_id]: 'sent'}));
      setSuggestions(prev => prev.filter(friend => friend.id !== to_parent_id));

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Friend request sent successfully!',
        button: 'Close',
        autoClose: 2000,
      });
    } catch (error) {
      setRequestStatus(prev => ({...prev, [to_parent_id]: 'error'}));
      handleApiError(error, 'Failed to send friend request');
    }
  };

  const removeSuggestion = async id => {
    try {
      const removed = await AsyncStorage.getItem('removedSuggestions');
      let removedIds = removed ? JSON.parse(removed) : [];
      if (!removedIds.includes(id)) {
        removedIds.push(id);
        await AsyncStorage.setItem(
          'removedSuggestions',
          JSON.stringify(removedIds),
        );
      }

      setSuggestions(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      handleApiError(error, 'Failed to remove suggestion');
    }
  };

  const handleFloatPress = () => {
    navigation.navigate('Add');
  };

  const handleEditPost = post => {
    setSelectedPost(post);
    setShowUpdateModal(true);
  };

  const handleDelete = async post => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this post?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                const formData = new FormData();
                formData.append('post_id', post.id);

                const response = await axios.post(
                  'https://argosmob.com/being-petz/public/api/v1/post/delete',
                  formData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  },
                );

                if (response.data.status || response.status === 200) {
                  Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Post deleted successfully',
                    button: 'OK',
                  });
                  fetchPosts();
                  setModalVisible2(false);
                } else {
                  throw new Error(
                    response.data.message || 'Failed to delete post',
                  );
                }
              } catch (error) {
                handleApiError(error, 'Failed to delete post');
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      handleApiError(error, 'Error in delete confirmation');
    }
  };

  const handleHide = async post => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User data not found',
          button: 'OK',
        });
        return;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData?.id;

      if (!userId) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User ID not found',
          button: 'OK',
        });
        return;
      }

      Alert.alert(
        'Hide Post',
        'Are you sure you want to hide this post?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Hide',
            onPress: async () => {
              try {
                const formData = new FormData();
                formData.append('user_id', userId);
                formData.append('post_id', post.id);

                const response = await axios.post(
                  'https://argosmob.com/being-petz/public/api/v1/hide-post',
                  formData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  },
                );

                if (response.data.status || response.status === 200) {
                  Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Post hidden successfully',
                    button: 'OK',
                  });
                  fetchPosts();
                } else {
                  throw new Error(
                    response.data.message || 'Failed to hide post',
                  );
                }
              } catch (error) {
                handleApiError(error, 'Failed to hide post');
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      handleApiError(error, 'Error in hide post');
    }
  };

  const handleReport = async (post, reason) => {
    if (!reason || reason.trim() === '') {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Error',
        textBody: 'Please provide a reason for reporting',
        button: 'OK',
      });
      return;
    }

    setReporting(true);

    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User data not found',
          button: 'OK',
        });
        return;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData?.id;

      if (!userId) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User ID not found',
          button: 'OK',
        });
        return;
      }

      const reportPayload = {
        report_by: userId,
        type: 'post',
        post_id: post?.id,
        reason: reason,
      };

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/report/add',
        JSON.stringify(reportPayload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status || response.status === 200) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Reported',
          textBody: 'Post has been reported successfully',
          button: 'OK',
        });
        setModalVisible2(false);
        setReportMessage('');
      } else {
        throw new Error(response.data.message || 'Failed to report post');
      }
    } catch (error) {
      handleApiError(error, 'Failed to report post');
    } finally {
      setReporting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading && allPosts?.length === 0) {
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
        <TouchableOpacity
          onPress={fetchPosts}
          accessible={true}
          accessibilityLabel="Retry"
          accessibilityRole="button">
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            onChatPress={() => navigation.navigate('Chats')}
            onPeoplePress={() => setModalVisible(true)}
          />

          {/* <Image
            style={styles.banner}
            source={require('../Assests/Images/HomeBanner.png')}
            accessible={true}
            accessibilityLabel="App banner"
          /> */}
          <BannerCarousel />

          {/* {loading && <LottieLoader visible={loading} />} */}
          {loading && <ActivityIndicator size="large" color="#0000ff" />}

          <View style={styles.postsContainer}>
            <FlatList
              data={allPosts}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <PostCard item={item} />}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={21}
              removeClippedSubviews
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>

          <Text style={styles.suggestFriendText}>Suggest Friend</Text>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={suggestions}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 0}}
            renderItem={({item}) => (
              <View style={styles.suggestFriendcard}>
                <Image
                  source={{
                    uri: `https://argosmob.com/being-petz/public/${item?.profile}`,
                  }}
                  style={styles.suggestFriendprofileImage}
                  onError={() => console.log('Failed to load profile image')}
                  defaultSource={require('../Assests/Images/dog.png')}
                  accessible={true}
                  accessibilityLabel={`Profile of ${item.first_name}`}
                />
                <Text
                  style={styles.suggestFriendname}
                  accessible={true}
                  accessibilityRole="text">{`${item.first_name} ${item.last_name}`}</Text>
                <Text
                  style={styles.suggestFriendmutualFriends}
                  accessible={true}
                  accessibilityRole="text">
                  {item.breed}
                </Text>
                {requestStatus[item.id] === 'sent' ? (
                  <View
                    style={[
                      styles.suggestFriendrequestButton,
                      styles.requestSentButton,
                    ]}>
                    <Text
                      style={styles.suggestFriendrequestText}
                      accessible={true}
                      accessibilityRole="text">
                      Request Sent
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.suggestFriendrequestButton}
                    onPress={() => sendFriendRequest(item.id)}
                    disabled={requestStatus[item.id] === 'loading'}
                    accessible={true}
                    accessibilityLabel="Send friend request"
                    accessibilityRole="button">
                    {requestStatus[item.id] === 'loading' ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.suggestFriendrequestText}>
                        Send Request
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.suggestFriendremoveButton}
                  onPress={() => removeSuggestion(item.id)}
                  accessible={true}
                  accessibilityLabel="Remove suggestion"
                  accessibilityRole="button">
                  <Text style={styles.suggestFriendremoveText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <FriendRequestsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
        </ScrollView>

        <UpdatePostModal
          visible={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            fetchPosts();
          }}
          postData={selectedPost}
          onUpdateSuccess={updatedPost => {
            setModalVisible(false);
          }}
        />

        {/* 
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible2}
          onRequestClose={() => setModalVisible2(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0)',
            }}>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                width: '80%',
                maxWidth: 400,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}>
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  alignItems: 'center',
                  borderRadius: 16,
                  marginVertical: 8,
                }}
                onPress={() => {
                  setModalVisible2(false);
                  handleEditPost(selectedPost);
                }}
                accessible={true}
                accessibilityLabel="Edit post"
                accessibilityRole="button">
                <Text style={{color: '#8337B2', fontSize: 16}}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  alignItems: 'center',
                  borderRadius: 16,
                  marginVertical: 8,
                }}
                onPress={() => {
                  setModalVisible2(false);
                  handleDelete(selectedPost);
                }}
                accessible={true}
                accessibilityLabel="Delete post"
                accessibilityRole="button">
                <Text style={{color: '#8337B2', fontSize: 16}}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  alignItems: 'center',
                  borderRadius: 16,
                  marginVertical: 8,
                }}
                onPress={() => {
                  setModalVisible2(false);
                  handleHide(selectedPost);
                }}
                accessible={true}
                accessibilityLabel="Hide post"
                accessibilityRole="button">
                <Text style={{color: '#8337B2', fontSize: 16}}>Hide</Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Why are you reporting this post?"
                placeholderTextColor="#fff"
                value={reportMessage}
                onChangeText={setReportMessage}
                maxLength={100}
                style={{
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  borderRadius: 24,
                  paddingHorizontal: 12,
                  paddingLeft: 20,
                  paddingVertical: 8,
                  marginVertical: 12,
                  color: '#fff',
                  maxHeight: 200,
                  backgroundColor: '#8337B2',
                }}
                multiline
                accessible={true}
                accessibilityLabel="Report reason input"
                accessibilityRole="text"
              />

              <TouchableOpacity
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  alignItems: 'center',
                  borderRadius: 16,
                  marginVertical: 8,
                }}
                onPress={() => {
                  setModalVisible2(false);
                  handleReport(selectedPost, reportMessage);
                }}
                accessible={true}
                accessibilityLabel="Report post"
                accessibilityRole="button">
                <Text style={{color: '#8337B2', fontSize: 16}}>Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#8337B2',
                  alignItems: 'center',
                  borderRadius: 16,
                  marginVertical: 8,
                }}
                onPress={() => {
                  setModalVisible2(false);
                }}
                accessible={true}
                accessibilityLabel="Close"
                accessibilityRole="button">
                <Text style={{color: '#8337B2', fontSize: 16}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}

        <Modal
          transparent
          animationType="fade"
          visible={modalVisible2}
          onRequestClose={() => setModalVisible2(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(8,8,24,0.15)',
            }}>
            <View
              style={{
                width: '84%',
                maxWidth: 420,
                backgroundColor: '#fff',
                borderRadius: 18,
                paddingHorizontal: 20,
                paddingTop: 14,
                paddingBottom: 18,
                shadowColor: '#222',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.17,
                shadowRadius: 14,
                elevation: 8,
              }}>
              {/* Header row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                {/* <View style={{flexDirection: 'row'}}> */}
                  <TouchableOpacity
                    style={{
                      marginRight: 22,
                      paddingVertical: 4,
                    }}
                    onPress={() => {
                      setModalVisible2(false);
                      handleEditPost(selectedPost);
                    }}>
                    <Text
                      style={{
                        color: '#8337B2',
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{paddingVertical: 4}}
                    onPress={() => {
                      setModalVisible2(false);
                      handleDelete(selectedPost);
                    }}>
                    <Text
                      style={{
                        color: '#8337B2',
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                {/* </View> */}
                <TouchableOpacity
                  style={{
                    // position: 'absolute',
                    // right: 0,
                    // top: -5,
                    // padding: 8,
                    // zIndex: 3,
                  }}
                  onPress={() => setModalVisible2(false)}>
                  <Text
                    style={{fontSize: 24, color: '#8337B2', fontWeight: '700'}}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input for Report Reason */}
              <TextInput
                placeholder="Why are you reporting this post?"
                placeholderTextColor="#A569C2"
                value={reportMessage}
                onChangeText={setReportMessage}
                maxLength={100}
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1.5,
                  borderColor: '#8337B2',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  marginTop: 10,
                  marginBottom: 24,
                  fontSize: 15,
                  color: '#8337B2',
                  minHeight: 56,
                  textAlignVertical: 'top',
                }}
                multiline
                accessible={true}
                accessibilityLabel="Report reason input"
                accessibilityRole="text"
              />

              {/* Report Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#8337B2',
                  paddingVertical: 13,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 0,
                }}
                onPress={() => {
                  setModalVisible2(false);
                  handleReport(selectedPost, reportMessage);
                }}
                accessible={true}
                accessibilityLabel="Report post"
                accessibilityRole="button">
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 'bold',
                    letterSpacing: 0.4,
                  }}>
                  Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalCommentVisible}
          onRequestClose={() => setModalCommentVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.postInfo}>
                  <Image
                    source={{
                      uri: `https://argosmob.com/being-petz/public/${selectedPostForComment?.parent?.profile}`,
                    }}
                    style={styles.smallProfileImage}
                    onError={() => console.log('Failed to load profile image')}
                    defaultSource={require('../Assests/Images/dog.png')}
                    accessible={true}
                    accessibilityLabel="Profile image"
                  />
                  <Text
                    style={styles.postUser}
                    accessible={true}
                    accessibilityRole="text">
                    {selectedPostForComment?.parent?.first_name}'s post
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalCommentVisible(false)}
                  accessible={true}
                  accessibilityLabel="Close modal"
                  accessibilityRole="button">
                  <Icon name="close" size={24} color="#8337B2" />
                </TouchableOpacity>
              </View>

              <SafeAreaView style={styles.commentsContainer}>
                <FlatList
                  data={loading ? [] : comments}
                  keyExtractor={item =>
                    item.id?.toString?.() ?? Math.random().toString()
                  }
                  renderItem={({item}) => {
                    if (item?.parent_id) {
                      const fetchParentComment = async () => {
                        try {
                          const formData = new FormData();
                          formData.append('user_id', item.parent_id);
                          const response = await axios.post(
                            'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
                            formData,
                            {
                              headers: {
                                'Content-Type': 'multipart/form-data',
                              },
                            },
                          );
                          if (response.data?.status && response.data?.user) {
                            setParentComment(response.data.user);
                          }
                        } catch (error) {
                          console.error(
                            'Error fetching parent comment:',
                            error,
                          );
                        }
                      };
                      fetchParentComment();
                    }
                    return (
                      <View style={styles.commentItem}>
                        <Text
                          style={styles.commentUser}
                          accessible={true}
                          accessibilityRole="text">
                          {parentComment?.first_name ||
                            item?.user?.name ||
                            'User'}
                        </Text>
                        <Text
                          style={styles.commentText}
                          accessible={true}
                          accessibilityRole="text">
                          {item.comment}
                        </Text>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    loading ? null : (
                      <Text
                        style={styles.noComments}
                        accessible={true}
                        accessibilityRole="text">
                        No comments yet
                      </Text>
                    )
                  }
                />
                {loading && (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 16,
                    }}>
                    <ActivityIndicator size="large" color="#8337B2" />
                  </View>
                )}
              </SafeAreaView>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  editable={!postingComment}
                  accessible={true}
                  accessibilityLabel="Comment input"
                  accessibilityRole="text"
                />
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    (!newComment.trim() || postingComment) &&
                      styles.postButtonDisabled,
                  ]}
                  onPress={handlePostComment}
                  disabled={!newComment.trim() || postingComment}
                  accessible={true}
                  accessibilityLabel="Post comment"
                  accessibilityRole="button">
                  {postingComment ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.postButtonText}>Post</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagIcon: {
    marginRight: 5,
  },
  taggedUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taggedUser: {
    marginRight: 5,
  },
  taggedUserName: {
    color: '#8337B2',
    fontSize: 14,
  },
  // mediaScrollView: {
  //   marginBottom: 10,
  // },
  // mediaContainer: {
  //   width: 300,
  //   height: 300,
  //   marginRight: 10,
  //   borderRadius: 10,
  //   overflow: 'hidden',
  // },
  // postImage: {
  //   width: '100%',
  //   height: '100%',
  // },
  postVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  videoPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  fullscreenModalBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  mediaScrollView: {
    marginTop: 10,
    // height: 300,
  },
  mediaContainer: {
    // width: Dimensions.get('window').width, // Account for padding
    // maxHeight: 400,
    // marginRight: 10,
    // backgroundColor: 'red',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  /////

  taggedUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  tagIcon: {
    marginRight: 8,
  },
  taggedUsersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taggedUser: {
    marginRight: 4,
  },
  taggedUserName: {
    color: '#8337B2',
    fontSize: 14,
  },
  //////////
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  requestSentButton: {
    backgroundColor: '#ccc', // Different color for sent state
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryText: {
    color: 'blue',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  banner: {
    width: '95%',
    margin: 10,
    alignSelf: 'center',
    borderRadius: 15,
    height: 170,
  },
  postsContainer: {
    marginTop: 15,
    marginHorizontal: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D384C',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 480,
    borderRadius: 15,
    // marginBottom: 10,
    // marginVertical: 10,
    // resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  actionText: {
    marginHorizontal: 5,
    color: '#5A5A5A',
    fontSize: 16,
  },
  commentIcon: {
    marginLeft: 15,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
  },
  caption: {
    fontSize: 16,
    // fontWeight: 'bold',
    marginTop: 5,
    color: '#111',
  },
  suggestFriendText: {
    marginLeft: 16,
    color: '#1D1B1B',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
  floatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  suggestFriendcard: {
    width: 150,
    backgroundColor: '#EEF6FF',
    borderRadius: 15,
    padding: 10,
    // alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestFriendprofileImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  suggestFriendname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestFriendmutualFriends: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  suggestFriendrequestButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  suggestFriendrequestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestFriendremoveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8337B2',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  suggestFriendremoveText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  //comment styling

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8337B2',
  },
  commentsContainer: {
    flex: 1,
  },
  commentItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 4,
  },
  commentText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  postButton: {
    backgroundColor: '#8337B2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postUser: {
    fontWeight: 'bold',
    color: '#8337B2',
  },
  noComments: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  //////

  modalOverlay2: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent2: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  topRowText: {
    fontSize: 16,
    color: '#8337B2',
    fontWeight: '500',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#8337B2',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#8337B2',
    marginBottom: 20,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: '#8337B2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#8337B2',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  // modalOverlay2: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // modalContent2: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   width: '80%',
  //   elevation: 5,
  // },
  // modalOption2: {
  //   borderRadius: 24,
  //   marginVertical: 8,
  //   paddingVertical: 12,
  //   // borderWidth: 1,
  //   backgroundColor: '#8337B2',
  // },
  // modalText2: {
  //   fontSize: 16,
  //   color: '#fff',
  //   textAlign: 'center',
  // },

  //////
  repostContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 12,
    // backgroundColor: '#f0f0f0',
  },
  repostText: {
    marginLeft: 8,
    color: '#8337B2',
    fontSize: 14,
  },
  repostContent: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  //////
  fullscreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenModalBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
});

export default Home;

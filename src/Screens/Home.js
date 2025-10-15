// import {
//   useNavigation,
//   useFocusEffect,
//   useIsFocused,
// } from '@react-navigation/native';
// import React, {useState, useCallback, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Platform,
//   ActivityIndicator,
//   FlatList,
//   TouchableOpacity,
//   Modal,
//   SafeAreaView,
//   TextInput,
//   StatusBar,
//   Alert,
//   BackHandler,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import SuggestFriend from './Components/SuggestFriend';
// import AdvancedFloatingButton from './Components/AdvancedFloatingButton';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import UpdatePostModal from './Components/UpdatePostModal';
// import BannerCarousel from './Components/BannerCarousel';
// import HomeHeader from './Components/HomeHeader';
// import {
//   ALERT_TYPE,
//   Dialog,
//   AlertNotificationRoot,
// } from 'react-native-alert-notification';
// import Video from 'react-native-video';

// const Home = () => {
//   const navigation = useNavigation();
//   const {height, width} = Dimensions.get('window');

//   // Core UI state
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedPetId, setSelectedPetId] = useState(null);
//   const [suggestions, setSuggestions] = useState([]);
//   const [postsData, setPostsData] = useState([]);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [requestStatus, setRequestStatus] = useState({});
//   const [posting, setPosting] = useState(false);
//   const [modalCommentVisible, setModalCommentVisible] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [comments, setComments] = useState([]);
//   const [postingComment, setPostingComment] = useState(false);
//   const [selectedPostForComment, setSelectedPostForComment] = useState(null);
//   const [likingPosts, setLikingPosts] = useState({});
//   const [allPosts, setAllPosts] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [modalVisible2, setModalVisible2] = useState(false);
//   const [reportMessage, setReportMessage] = useState('');
//   const [reporting, setReporting] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [parentComment, setParentComment] = useState({});

//   // New: cache of users fetched for comments (prevents repeated requests & flicker)
//   const [usersById, setUsersById] = useState({});

//   // Separate loading state for comments so it doesn't conflict with main loading UI
//   const [loadingComments, setLoadingComments] = useState(false);

//   // Pagination state
//   const [page, setPage] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const perPage = 10; // adjust to your API

//   const characterLimit = 150;

//   const isFocused = useIsFocused();

//   const handleApiError = (error, defaultMessage = 'An error occurred') => {
//     console.error('API Error:', error);
//     // You can show dialogs or toast here if desired
//   };

//   // Android hardware back handling
//   useFocusEffect(
//     useCallback(() => {
//       if (Platform.OS !== 'android' || !BackHandler) return;

//       const onBackPress = () => {
//         Alert.alert(
//           'Exit App',
//           'Do you want to exit the app?',
//           [
//             {text: 'Cancel', style: 'cancel'},
//             {text: 'Exit', onPress: () => BackHandler.exitApp()},
//           ],
//           {cancelable: false},
//         );
//         return true;
//       };

//       const backHandler = BackHandler.addEventListener(
//         'hardwareBackPress',
//         onBackPress,
//       );

//       return () => backHandler.remove();
//     }, []),
//   );

//   // Fetch stored user info
//   const fetchUserData = async () => {
//     try {
//       const storedUserData = await AsyncStorage.getItem('user_data');
//       if (storedUserData) {
//         const parsedData = JSON.parse(storedUserData);
//         if (parsedData?.id) {
//           setUserData(parsedData);
//           return parsedData;
//         } else {
//           throw new Error('Invalid user data format');
//         }
//       } else {
//         throw new Error('No user data found');
//       }
//     } catch (error) {
//       handleApiError(error, 'Error fetching user data');
//     }
//   };

//   // Initial load when screen focused
//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       if (isFocused && isMounted) {
//         setLoading(true);
//         try {
//           await fetchPosts(1, true);
//         } catch (err) {
//           if (!axios.isCancel(err)) {
//             handleApiError(err, 'Failed to fetch posts');
//           }
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchData();
//     fetchUserData();

//     return () => {
//       isMounted = false;
//     };
//   }, [isFocused]);

//   // When userData is available, load user-specific bits
//   useEffect(() => {
//     let isMounted = true;
//     if (!userData) return;
//     if (isMounted) {
//       fetchMyPosts();
//       fetchFriendSuggestions();
//     }
//     return () => {
//       isMounted = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userData]);

//   // Build display list that inserts a suggest-block every N posts
//   const buildDisplayData = () => {
//     const posts = Array.isArray(allPosts) ? allPosts : [];
//     const display = [];
//     for (let i = 0; i < posts.length; i++) {
//       display.push(posts[i]);
//       if ((i + 1) % 10 === 0) {
//         display.push({__type: 'suggest', id: `suggest-${(i + 1) / 10}`});
//       }
//     }
//     return display;
//   };

//   // fetch posts with pagination
//   const fetchPosts = async (requestedPage = 1, replace = false) => {
//     try {
//       if (requestedPage === 1) {
//         setRefreshing(true);
//       } else {
//         setLoadingMore(true);
//       }
//       setError(null);

//       const response = await axios.get(
//         `https://argosmob.com/being-petz/public/api/v1/post/all`,
//         {
//           params: {page: requestedPage},
//         },
//       );

//       const fetched = Array.isArray(response?.data?.data?.data)
//         ? response.data.data.data
//         : [];

//       if (replace || requestedPage === 1) {
//         setAllPosts(fetched);
//       } else {
//         setAllPosts(prev => [...prev, ...fetched]);
//       }

//       // detect more pages
//       if (fetched.length < perPage) {
//         setHasMore(false);
//       } else {
//         setHasMore(true);
//       }
//       setPage(requestedPage);
//     } catch (err) {
//       if (!axios.isCancel(err)) {
//         handleApiError(err, 'Failed to fetch posts');
//         setError('Failed to load posts');
//       }
//     } finally {
//       setRefreshing(false);
//       setLoadingMore(false);
//     }
//   };

//   const validateUserData = () => {
//     if (!userData?.id) {
//       Dialog.show({
//         type: ALERT_TYPE.DANGER,
//         title: 'Error',
//         textBody: 'User data not found. Please login again.',
//         button: 'OK',
//       });
//       return false;
//     }
//     return true;
//   };

//   const handleLikePost = async postId => {
//     if (!validateUserData()) return;

//     try {
//       setLikingPosts(prev => ({...prev, [postId]: true}));

//       const formData = new FormData();
//       formData.append('post_id', postId);
//       formData.append('parent_id', userData.id.toString());

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/post/like',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       if (response.data.status || response.data.message === 'Post liked') {
//         setAllPosts(prevPosts =>
//           prevPosts.map(post =>
//             post.id === postId
//               ? {
//                   ...post,
//                   likes_count:
//                     response.data.likes_count ??
//                     post.likes_count + (post.is_liked ? -1 : 1),
//                   is_liked: !post.is_liked,
//                 }
//               : post,
//           ),
//         );
//       }
//     } catch (error) {
//       handleApiError(error, 'Failed to like post');
//     } finally {
//       setLikingPosts(prev => ({...prev, [postId]: false}));
//     }
//   };

//   const handleRepost = async (item, fetchPostsCallback) => {
//     try {
//       if (!userData?.id) throw new Error('User not authenticated');
//       if (!item?.id) throw new Error('Invalid post');

//       const formData = new FormData();
//       formData.append('user_id', userData.id);
//       formData.append('post_id', item.id);
//       formData.append('is_public', '1');

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/post/re-post',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//           timeout: 10000,
//         },
//       );

//       Dialog.show({
//         type: ALERT_TYPE.SUCCESS,
//         title: 'Success',
//         textBody: 'Post reposted successfully!',
//         button: 'OK',
//       });

//       if (typeof fetchPostsCallback === 'function') {
//         await fetchPostsCallback(1, true);
//       }

//       return response.data;
//     } catch (error) {
//       console.error('Repost error:', error);
//       let errorMessage = 'Error in repost';
//       if (error.response) {
//         errorMessage =
//           error.response.data?.message ||
//           error.response.statusText ||
//           'Server error';
//       } else if (error.request) {
//         errorMessage = 'Network error - please check your connection';
//       } else if (error.message.includes('timeout')) {
//         errorMessage = 'Request timeout - please try again';
//       } else {
//         errorMessage = error.message || 'Unknown error occurred';
//       }

//       Dialog.show({
//         type: ALERT_TYPE.DANGER,
//         title: 'Error',
//         textBody: errorMessage,
//         button: 'OK',
//       });
//       throw error;
//     }
//   };

//   /* ---------- PostCard components (Birthday / Original / Repost) ---------- */
//   const PostCard = React.memo(({item}) => {
//     if (!item) return null;
//     if (item?.repost_id) return <PostCardRepost item={item} />;
//     if (item?.post_type === 'birthday') return <PostCardBirthday item={item} />;
//     return <PostCardOriginal item={item} />;
//   });

//   const PostCardBirthday = ({item}) => {
//     const [expanded, setExpanded] = useState(false);
//     const isLongText = (item?.content || '').length > characterLimit;
//     const displayText = expanded
//       ? item?.content
//       : (item?.content || '').slice(0, characterLimit);

//     return (
//       <View style={styles.birthdayContainer}>
//         <View style={styles.birthdayHeader}>
//           <Image
//             source={{
//               uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
//             }}
//             style={styles.birthdayProfileImage}
//           />
//           <View style={{flex: 1}}>
//             <Text style={styles.birthdayUserName}>
//               {item?.parent?.first_name} {item?.parent?.last_name}
//             </Text>
//             <Text style={styles.birthdayPostTime}>
//               {item?.created_at_human}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.birthdayContent}>
//           <Text style={styles.birthdayText}>{item?.content}</Text>
//           <View style={styles.petInfo}>
//             <Image
//               source={{
//                 uri: `https://argosmob.com/being-petz/public/${item?.pet?.avatar}`,
//               }}
//               style={styles.petAvatar}
//             />
//           </View>
//         </View>

//         <View style={{marginTop: 10}}>
//           <PostActions item={item} />
//         </View>
//       </View>
//     );
//   };

//   const PostCardOriginal = ({item}) => {
//     const [selectedMedia, setSelectedMedia] = useState(null);
//     const [mediaModalVisible, setMediaModalVisible] = useState(false);
//     const [expanded, setExpanded] = useState(false);
//     const [paused, setPaused] = useState(true);
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const scrollRef = useRef(null);

//     const isLongText = (item?.content || '').length > characterLimit;
//     const displayText = expanded
//       ? item?.content
//       : (item?.content || '').slice(0, characterLimit);

//     const allMedia = [
//       ...(item?.featured_image
//         ? [{uri: item.featured_image, isVideo: false}]
//         : []),
//       ...(item?.featured_video
//         ? [{uri: item.featured_video, isVideo: true}]
//         : []),
//       ...(item?.images?.map(img => ({uri: img.image_path, isVideo: false})) ||
//         []),
//       ...(item?.videos?.map(vid => ({uri: vid.video_path, isVideo: true})) ||
//         []),
//     ];

//     const hasMedia = allMedia.length > 0;
//     const multipleMedia = allMedia.length > 1;

//     const handleMediaPress = (mediaUri, isVideo = false) => {
//       setSelectedMedia({uri: mediaUri, isVideo});
//       setMediaModalVisible(true);
//       setPaused(false);
//     };

//     const onScrollEnd = event => {
//       const contentOffset = event.nativeEvent.contentOffset.x;
//       const viewSize = event.nativeEvent.layoutMeasurement.width;
//       const pageNum = Math.round(contentOffset / viewSize);
//       setCurrentIndex(pageNum);
//     };

//     const renderMediaItem = (media, index) => {
//       const uri = `https://argosmob.com/being-petz/public/${media.uri}`;
//       return (
//         <TouchableOpacity
//           key={index}
//           onPress={() => handleMediaPress(uri, media.isVideo)}
//           activeOpacity={0.8}
//           style={{
//             width: width - 32,
//             marginRight: multipleMedia ? 8 : 0,
//             position: 'relative',
//           }}>
//           {media.isVideo ? (
//             <View style={styles.videoContainer}>
//               <Video
//                 source={{uri}}
//                 style={{width: width - 32, height: 400}}
//                 resizeMode="cover"
//                 paused={true}
//                 repeat={true}
//                 posterResizeMode="cover"
//                 playInBackground={false}
//                 playWhenInactive={false}
//                 ignoreSilentSwitch="obey"
//               />
//               <View style={styles.playOverlay}>
//                 <Icon
//                   name="play-circle"
//                   size={70}
//                   color="rgba(255,255,255,0.85)"
//                 />
//               </View>
//             </View>
//           ) : (
//             <Image
//               source={{uri}}
//               style={{width: '95.5%', height: 400, borderRadius: 8}}
//               resizeMode="cover"
//             />
//           )}
//         </TouchableOpacity>
//       );
//     };

//     return (
//       <View style={styles.postCard}>
//         <View style={styles.postHeaderRow}>
//           <Image
//             source={{
//               uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
//             }}
//             style={styles.postProfileImage}
//           />
//           <View style={{flex: 1}}>
//             <Text style={styles.postUserName}>
//               {item?.parent?.first_name} {item?.parent?.last_name}
//             </Text>
//             <Text style={styles.postTimeText}>{item?.created_at_human}</Text>
//           </View>
//           <TouchableOpacity
//             onPress={() => {
//               setSelectedPost(item);
//               setModalVisible2(true);
//             }}>
//             <Icon name="dots-horizontal" size={20} color="#888" />
//           </TouchableOpacity>
//         </View>

//         {item?.content ? (
//           <TouchableOpacity onPress={() => setExpanded(!expanded)}>
//             <Text style={styles.postCaption}>
//               {displayText}
//               {isLongText && !expanded ? '...' : ''}
//               {isLongText && (
//                 <Text style={{color: '#8337B2', fontWeight: '600'}}>
//                   {expanded ? ' Less' : ' More'}
//                 </Text>
//               )}
//             </Text>
//           </TouchableOpacity>
//         ) : null}

//         {item?.tagged_users?.length > 0 && (
//           <View style={styles.taggedRow}>
//             <Icon
//               name="tag"
//               size={16}
//               color="#8337B2"
//               style={{marginRight: 4}}
//             />
//             <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
//               {item.tagged_users.map((user, index) => (
//                 <Text
//                   key={user.id}
//                   style={{color: '#8337B2', fontSize: 13, marginRight: 4}}>
//                   {user.first_name} {user.last_name}
//                   {index < item.tagged_users.length - 1 ? ',' : ''}
//                 </Text>
//               ))}
//             </View>
//           </View>
//         )}

//         {hasMedia && (
//           <View
//             style={{width: width, alignItems: 'center', position: 'relative'}}>
//             {multipleMedia && (
//               <View style={styles.mediaCounter}>
//                 <Text style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
//                   {currentIndex + 1}/{allMedia.length}
//                 </Text>
//               </View>
//             )}

//             <FlatList
//               data={allMedia}
//               horizontal
//               pagingEnabled
//               snapToAlignment="center"
//               showsHorizontalScrollIndicator={false}
//               keyExtractor={(_, i) => `${i}`}
//               renderItem={({item: mItem, index}) =>
//                 renderMediaItem(mItem, index)
//               }
//               onMomentumScrollEnd={onScrollEnd}
//               style={{width: width - 16, height: 400}}
//             />

//             {multipleMedia && (
//               <View style={styles.mediaDotsRow}>
//                 {allMedia.map((_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.dot,
//                       currentIndex === i
//                         ? styles.dotActive
//                         : styles.dotInactive,
//                     ]}
//                   />
//                 ))}
//               </View>
//             )}
//           </View>
//         )}

//         <View style={{marginTop: 10}}>
//           <PostActions item={item} />
//         </View>

//         <Modal
//           visible={mediaModalVisible}
//           transparent={true}
//           statusBarTranslucent={true}
//           onRequestClose={() => {
//             setPaused(true);
//             setMediaModalVisible(false);
//           }}>
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: 'rgba(255,255,255,0.9)',
//               marginTop: -StatusBar.currentHeight,
//               paddingTop: StatusBar.currentHeight,
//             }}>
//             <View
//               style={{width: '100%', height: '100%', justifyContent: 'center'}}>
//               {selectedMedia?.isVideo ? (
//                 <>
//                   <Video
//                     source={{uri: selectedMedia.uri}}
//                     style={{width: '100%', height: '100%'}}
//                     resizeMode="contain"
//                     paused={paused}
//                     repeat={true}
//                   />
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={() => setPaused(!paused)}
//                     style={{
//                       position: 'absolute',
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       bottom: 0,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       backgroundColor: paused
//                         ? 'rgba(0,0,0,0.4)'
//                         : 'transparent',
//                     }}>
//                     {paused && (
//                       <View
//                         style={{
//                           backgroundColor: 'rgba(0,0,0,0.7)',
//                           width: 70,
//                           height: 70,
//                           borderRadius: 35,
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                         }}>
//                         <Icon name="play" size={40} color="white" />
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <Image
//                   source={{uri: selectedMedia?.uri}}
//                   style={{width: '100%', height: '100%'}}
//                   resizeMode="contain"
//                 />
//               )}
//             </View>
//             <TouchableOpacity
//               style={{
//                 position: 'absolute',
//                 top: StatusBar.currentHeight + 20,
//                 right: 20,
//                 backgroundColor: 'rgba(0,0,0,0.7)',
//                 borderRadius: 20,
//                 padding: 10,
//               }}
//               onPress={() => {
//                 setPaused(true);
//                 setMediaModalVisible(false);
//               }}>
//               <Icon name="close" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </Modal>
//       </View>
//     );
//   };

//   const PostCardRepost = ({item}) => {
//     const [expanded, setExpanded] = useState(false);
//     const [selectedMedia, setSelectedMedia] = useState(null);
//     const [mediaModalVisible, setMediaModalVisible] = useState(false);
//     const [paused, setPaused] = useState(true);
//     const [currentIndex, setCurrentIndex] = useState(0);

//     const getMediaItems = post => [
//       ...(post?.featured_image
//         ? [{uri: post.featured_image, isVideo: false}]
//         : []),
//       ...(post?.featured_video
//         ? [{uri: post.featured_video, isVideo: true}]
//         : []),
//       ...(post?.images?.map(img => ({uri: img.image_path, isVideo: false})) ||
//         []),
//       ...(post?.videos?.map(vid => ({uri: vid.video_path, isVideo: true})) ||
//         []),
//     ];

//     const originalMedia = getMediaItems(item);
//     const repostMedia = item?.repost ? getMediaItems(item.repost) : [];
//     const allMedia = [...originalMedia, ...repostMedia];

//     const hasMedia = allMedia.length > 0;
//     const multipleMedia = allMedia.length > 1;

//     const isLongText = (item?.content || '').length > characterLimit;
//     const displayText = expanded
//       ? item?.content
//       : (item?.content || '').slice(0, characterLimit);

//     const handleMediaPress = (mediaUri, isVideo = false) => {
//       setSelectedMedia({uri: mediaUri, isVideo});
//       setMediaModalVisible(true);
//       setPaused(false);
//     };

//     const onScrollEnd = event => {
//       const contentOffset = event.nativeEvent.contentOffset.x;
//       const viewSize = event.nativeEvent.layoutMeasurement.width;
//       const pageNum = Math.round(contentOffset / viewSize);
//       setCurrentIndex(pageNum);
//     };

//     const renderMediaItem = (media, index) => {
//       const uri = `https://argosmob.com/being-petz/public/${media.uri}`;
//       return (
//         <TouchableOpacity
//           key={index}
//           onPress={() => handleMediaPress(uri, media.isVideo)}
//           activeOpacity={0.8}
//           style={{
//             width: width - 32,
//             marginRight: multipleMedia ? 8 : 0,
//             position: 'relative',
//           }}>
//           {media.isVideo ? (
//             <View style={styles.videoContainer}>
//               <Video
//                 source={{uri}}
//                 style={{width: '100%', height: 400}}
//                 resizeMode="cover"
//                 paused={true}
//                 repeat={true}
//               />
//               <View style={styles.playOverlay}>
//                 <Icon
//                   name="play-circle"
//                   size={70}
//                   color="rgba(255,255,255,0.85)"
//                 />
//               </View>
//             </View>
//           ) : (
//             <Image
//               source={{uri}}
//               style={{width: '95.5%', height: 400, borderRadius: 8}}
//               resizeMode="cover"
//             />
//           )}
//         </TouchableOpacity>
//       );
//     };

//     return (
//       <View style={styles.postCard}>
//         <View style={styles.postHeaderRow}>
//           <Image
//             source={{
//               uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
//             }}
//             style={styles.postProfileImage}
//           />
//           <View style={{flex: 1}}>
//             <Text style={styles.postUserName}>
//               {item?.parent?.first_name} {item?.parent?.last_name}
//             </Text>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginTop: 1,
//               }}>
//               <Icon
//                 name="repeat"
//                 size={14}
//                 color="#888"
//                 style={{marginRight: 4}}
//               />
//               <Text style={{color: '#888', fontSize: 13}}>Reposted</Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             onPress={() => {
//               setSelectedPost(item);
//               setModalVisible2(true);
//             }}>
//             <Icon name="dots-horizontal" size={20} color="#888" />
//           </TouchableOpacity>
//         </View>

//         {item?.content != null && (
//           <TouchableOpacity onPress={() => setExpanded(!expanded)}>
//             <Text style={styles.postCaption}>
//               {displayText}
//               {isLongText && !expanded ? '...' : ''}
//               {isLongText && (
//                 <Text style={{color: '#8337B2', fontWeight: '600'}}>
//                   {expanded ? ' Less' : ' More'}
//                 </Text>
//               )}
//             </Text>
//           </TouchableOpacity>
//         )}

//         {hasMedia && (
//           <View
//             style={{width: width, alignItems: 'center', position: 'relative'}}>
//             {multipleMedia && (
//               <View style={styles.mediaCounter}>
//                 <Text style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
//                   {currentIndex + 1}/{allMedia.length}
//                 </Text>
//               </View>
//             )}

//             <FlatList
//               data={allMedia}
//               horizontal
//               pagingEnabled
//               showsHorizontalScrollIndicator={false}
//               keyExtractor={(_, i) => `${i}`}
//               renderItem={({item: mItem, index}) =>
//                 renderMediaItem(mItem, index)
//               }
//               onMomentumScrollEnd={onScrollEnd}
//               style={{width: width, height: 400}}
//             />

//             {multipleMedia && (
//               <View style={styles.mediaDotsRow}>
//                 {allMedia.map((_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.dot,
//                       currentIndex === i
//                         ? styles.dotActive
//                         : styles.dotInactive,
//                     ]}
//                   />
//                 ))}
//               </View>
//             )}
//           </View>
//         )}

//         <View style={{marginTop: 10}}>
//           <PostActions item={item} />
//         </View>

//         <Modal
//           visible={mediaModalVisible}
//           transparent
//           statusBarTranslucent
//           onRequestClose={() => {
//             setPaused(true);
//             setMediaModalVisible(false);
//           }}>
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: 'rgba(255,255,255,0.9)',
//               marginTop: -StatusBar.currentHeight,
//               paddingTop: StatusBar.currentHeight,
//             }}>
//             <View
//               style={{width: '100%', height: '100%', justifyContent: 'center'}}>
//               {selectedMedia?.isVideo ? (
//                 <>
//                   <Video
//                     source={{uri: selectedMedia.uri}}
//                     style={{width: '100%', height: '100%'}}
//                     resizeMode="contain"
//                     paused={paused}
//                     repeat
//                   />
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     onPress={() => setPaused(!paused)}
//                     style={{
//                       position: 'absolute',
//                       top: 0,
//                       left: 0,
//                       right: 0,
//                       bottom: 0,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       backgroundColor: paused
//                         ? 'rgba(0,0,0,0.4)'
//                         : 'transparent',
//                     }}>
//                     {paused && (
//                       <View
//                         style={{
//                           backgroundColor: 'rgba(0,0,0,0.7)',
//                           width: 70,
//                           height: 70,
//                           borderRadius: 35,
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                         }}>
//                         <Icon name="play" size={40} color="white" />
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <Image
//                   source={{uri: selectedMedia?.uri}}
//                   style={{width: '100%', height: '100%'}}
//                   resizeMode="contain"
//                 />
//               )}
//             </View>
//             <TouchableOpacity
//               style={{
//                 position: 'absolute',
//                 top: StatusBar.currentHeight + 20,
//                 right: 20,
//                 backgroundColor: 'rgba(0,0,0,0.7)',
//                 borderRadius: 20,
//                 padding: 10,
//               }}
//               onPress={() => {
//                 setPaused(true);
//                 setMediaModalVisible(false);
//               }}>
//               <Icon name="close" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </Modal>
//       </View>
//     );
//   };

//   const PostActions = ({item}) => {
//     return (
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           borderTopWidth: 1,
//           borderTopColor: '#eee',
//           paddingTop: 8,
//           marginTop: 8,
//         }}>
//         <TouchableOpacity
//           onPress={() => handleLikePost(item?.id)}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             paddingVertical: 4,
//             paddingHorizontal: 12,
//           }}>
//           <Icon
//             name={item.is_liked ? 'heart' : 'heart-outline'}
//             size={22}
//             color={item.is_liked ? '#FF0000' : '#5A5A5A'}
//           />
//           <Text style={styles.actionText}>{item?.likes_count || 0}</Text>
//           <Text style={{fontSize: 14, color: '#5A5A5A'}}>Like</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => openCommentModal(item)}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             paddingVertical: 4,
//             paddingHorizontal: 12,
//           }}>
//           <Text style={{marginRight: 6, fontSize: 18}}>💬</Text>
//           <Text style={styles.actionText}>{item?.comments_count || 0}</Text>
//           <Text style={{fontSize: 14, color: '#5A5A5A'}}>Comment</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => handleRepost(item, fetchPosts)}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             paddingVertical: 4,
//             paddingHorizontal: 12,
//           }}>
//           <Text style={{marginRight: 6, fontSize: 18}}>🔄</Text>
//           <Text style={{fontSize: 14, color: '#5A5A5A'}}>Repost</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const openCommentModal = post => {
//     setModalCommentVisible(true);
//     setSelectedPostForComment(post);
//     fetchComments(post?.id);
//   };

//   /**
//    * fetchComments:
//    * - fetches comments for a post
//    * - stores comments
//    * - ensures users referenced in comments are available in usersById
//    *
//    * Important: NO async operations inside render. We fetch everything here
//    * and later the FlatList render just reads from item.user || usersById[parent_id]
//    */
//   const fetchComments = async postId => {
//     if (!postId) return;
//     setLoadingComments(true);

//     try {
//       const formData = new FormData();
//       formData.append('post_id', postId);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/post/get-comment',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       if (!response.data?.status) {
//         throw new Error(response.data?.message || 'Failed to fetch comments');
//       }

//       const fetchedComments = response.data.comment || [];

//       // Collect unique parent IDs from comments (the id of the author of each comment)
//       const parentIds = [
//         ...new Set(
//           fetchedComments.map(c => c?.parent_id ?? c?.user?.id).filter(Boolean),
//         ),
//       ];

//       // Build newUsers object from any users already returned by API inside the comment objects
//       const newUsersFromComments = {};
//       fetchedComments.forEach(c => {
//         if (c?.user && c.user?.id) {
//           newUsersFromComments[c.user.id] = c.user;
//         }
//       });

//       // Determine which parentIds are missing in cache (usersById)
//       const missingIds = parentIds.filter(
//         id => !usersById[id] && !newUsersFromComments[id],
//       );

//       // Fetch missing users (if any). Note: be careful about rate-limits; if you expect many missing IDs you should batch.
//       if (missingIds.length > 0) {
//         const fetches = missingIds.map(id => {
//           const fd = new FormData();
//           fd.append('user_id', id);
//           return axios
//             .post(
//               'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
//               fd,
//               {headers: {'Content-Type': 'multipart/form-data'}},
//             )
//             .then(res => ({id, user: res.data?.user}))
//             .catch(err => {
//               console.warn('Failed to fetch comment user', id, err);
//               return null;
//             });
//         });

//         const results = await Promise.all(fetches);
//         const fetchedUserMap = results.reduce((acc, r) => {
//           if (r && r.id && r.user) acc[r.id] = r.user;
//           return acc;
//         }, {});

//         // Merge new user results + any user objects already in comments into usersById
//         setUsersById(prev => ({
//           ...prev,
//           ...newUsersFromComments,
//           ...fetchedUserMap,
//         }));
//       } else {
//         // No missing ids: just merge any users included directly inside comments
//         setUsersById(prev => ({...prev, ...newUsersFromComments}));
//       }

//       // finally set comments
//       setComments(fetchedComments);
//     } catch (error) {
//       handleApiError(error, 'Failed to load comments');
//       setComments([]);
//     } finally {
//       setLoadingComments(false);
//     }
//   };

//   const handlePostComment = async () => {
//     if (!newComment.trim() || !selectedPostForComment) {
//       Dialog.show({
//         type: ALERT_TYPE.WARNING,
//         title: 'Error',
//         textBody: 'Please enter a comment',
//         button: 'OK',
//       });
//       return;
//     }

//     if (!userData?.id) {
//       Dialog.show({
//         type: ALERT_TYPE.DANGER,
//         title: 'Error',
//         textBody: 'User not found. Please login again.',
//         button: 'OK',
//       });
//       return;
//     }

//     try {
//       setPostingComment(true);
//       const formData = new FormData();
//       formData.append('post_id', selectedPostForComment.id);
//       formData.append('parent_id', userData?.id);
//       formData.append('comment', newComment);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/post/comment',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       if (response.data.status) {
//         setNewComment('');
//         // Re-fetch comments and posts to update counts
//         await fetchComments(selectedPostForComment.id);
//         await fetchPosts(1, true);
//       } else {
//         throw new Error(response.data.message || 'Failed to post comment');
//       }
//     } catch (error) {
//       handleApiError(error, 'Failed to post comment');
//     } finally {
//       setPostingComment(false);
//     }
//   };

//   const fetchFriendSuggestions = async () => {
//     if (!userData?.id) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append('parent_id', userData?.id);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/pet/friends/suggestions',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       setSuggestions(response.data?.data || []);
//     } catch (error) {
//       handleApiError(error, 'Failed to load friend suggestions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMyPosts = async () => {
//     if (!userData?.id) return;
//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append('parent_id', userData?.id);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/post/get/my',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       const postsWithLikeStatus =
//         response.data?.data?.data?.map(post => ({
//           ...post,
//           is_liked: post.is_liked || false,
//         })) || [];
//       setPostsData(postsWithLikeStatus);
//     } catch (error) {
//       handleApiError(error, 'Failed to load posts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendFriendRequest = async to_parent_id => {
//     if (!validateUserData()) return;

//     try {
//       setRequestStatus(prev => ({...prev, [to_parent_id]: 'loading'}));

//       const formData = new FormData();
//       formData.append('from_parent_id', userData.id.toString());
//       formData.append('to_parent_id', to_parent_id.toString());

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/pet/friends/send-request',
//         formData,
//         {
//           headers: {'Content-Type': 'multipart/form-data'},
//         },
//       );

//       setRequestStatus(prev => ({...prev, [to_parent_id]: 'sent'}));
//       setSuggestions(prev => prev.filter(friend => friend.id !== to_parent_id));

//       Dialog.show({
//         type: ALERT_TYPE.SUCCESS,
//         title: 'Success',
//         textBody: 'Friend request sent successfully!',
//         button: 'Close',
//         autoClose: 2000,
//       });
//     } catch (error) {
//       setRequestStatus(prev => ({...prev, [to_parent_id]: 'error'}));
//       handleApiError(error, 'Failed to send friend request');
//     }
//   };

//   const removeSuggestion = async id => {
//     try {
//       const removed = await AsyncStorage.getItem('removedSuggestions');
//       let removedIds = removed ? JSON.parse(removed) : [];
//       if (!removedIds.includes(id)) {
//         removedIds.push(id);
//         await AsyncStorage.setItem(
//           'removedSuggestions',
//           JSON.stringify(removedIds),
//         );
//       }
//       setSuggestions(prev => prev.filter(item => item.id !== id));
//     } catch (error) {
//       handleApiError(error, 'Failed to remove suggestion');
//     }
//   };

//   const handleFloatPress = () => navigation.navigate('Add');

//   const handleEditPost = post => {
//     setSelectedPost(post);
//     setShowUpdateModal(true);
//   };

//   const handleDelete = async post => {
//     if (!userData?.id) {
//       Dialog.show({
//         type: ALERT_TYPE.DANGER,
//         title: 'Error',
//         textBody: 'User data not found',
//         button: 'OK',
//       });
//       return;
//     }
//     if (post?.parent_id !== userData?.id) {
//       Dialog.show({
//         type: ALERT_TYPE.WARNING,
//         title: 'Permission Denied',
//         textBody: 'You can only delete your own posts',
//         button: 'OK',
//       });
//       return;
//     }

//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this post?',
//       [
//         {text: 'Cancel', style: 'cancel'},
//         {
//           text: 'Delete',
//           onPress: async () => {
//             try {
//               const formData = new FormData();
//               formData.append('post_id', post.id);

//               const response = await axios.post(
//                 'https://argosmob.com/being-petz/public/api/v1/post/delete',
//                 formData,
//                 {
//                   headers: {'Content-Type': 'multipart/form-data'},
//                 },
//               );

//               if (response.data.status || response.status === 200) {
//                 Dialog.show({
//                   type: ALERT_TYPE.SUCCESS,
//                   title: 'Success',
//                   textBody: 'Post deleted successfully',
//                   button: 'OK',
//                 });
//                 await fetchPosts(1, true);
//                 setModalVisible2(false);
//               } else {
//                 throw new Error(
//                   response.data.message || 'Failed to delete post',
//                 );
//               }
//             } catch (error) {
//               handleApiError(error, 'Failed to delete post');
//             }
//           },
//         },
//       ],
//       {cancelable: false},
//     );
//   };

//   const handleHide = async post => {
//     try {
//       const stored = await AsyncStorage.getItem('user_data');
//       if (!stored) {
//         Dialog.show({
//           type: ALERT_TYPE.DANGER,
//           title: 'Error',
//           textBody: 'User data not found',
//           button: 'OK',
//         });
//         return;
//       }
//       const parsed = JSON.parse(stored);
//       const userId = parsed?.id;
//       if (!userId) {
//         Dialog.show({
//           type: ALERT_TYPE.DANGER,
//           title: 'Error',
//           textBody: 'User ID not found',
//           button: 'OK',
//         });
//         return;
//       }

//       Alert.alert(
//         'Hide Post',
//         'Are you sure you want to hide this post?',
//         [
//           {text: 'Cancel', style: 'cancel'},
//           {
//             text: 'Hide',
//             onPress: async () => {
//               try {
//                 const formData = new FormData();
//                 formData.append('user_id', userId);
//                 formData.append('post_id', post.id);

//                 const response = await axios.post(
//                   'https://argosmob.com/being-petz/public/api/v1/hide-post',
//                   formData,
//                   {
//                     headers: {'Content-Type': 'multipart/form-data'},
//                   },
//                 );

//                 if (response.data.status || response.status === 200) {
//                   Dialog.show({
//                     type: ALERT_TYPE.SUCCESS,
//                     title: 'Success',
//                     textBody: 'Post hidden successfully',
//                     button: 'OK',
//                   });
//                   await fetchPosts(1, true);
//                 } else {
//                   throw new Error(
//                     response.data.message || 'Failed to hide post',
//                   );
//                 }
//               } catch (error) {
//                 handleApiError(error, 'Failed to hide post');
//               }
//             },
//           },
//         ],
//         {cancelable: false},
//       );
//     } catch (error) {
//       handleApiError(error, 'Error in hide post');
//     }
//   };

//   const handleReport = async (post, reason) => {
//     if (!reason || reason.trim() === '') {
//       Dialog.show({
//         type: ALERT_TYPE.WARNING,
//         title: 'Error',
//         textBody: 'Please provide a reason for reporting',
//         button: 'OK',
//       });
//       return;
//     }

//     setReporting(true);

//     try {
//       const stored = await AsyncStorage.getItem('user_data');
//       if (!stored) {
//         Dialog.show({
//           type: ALERT_TYPE.DANGER,
//           title: 'Error',
//           textBody: 'User data not found',
//           button: 'OK',
//         });
//         return;
//       }
//       const parsed = JSON.parse(stored);
//       const userId = parsed?.id;
//       if (!userId) {
//         Dialog.show({
//           type: ALERT_TYPE.DANGER,
//           title: 'Error',
//           textBody: 'User ID not found',
//           button: 'OK',
//         });
//         return;
//       }

//       const reportPayload = {
//         report_by: userId,
//         type: 'post',
//         post_id: post?.id,
//         reason,
//       };

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/report/add',
//         JSON.stringify(reportPayload),
//         {
//           headers: {'Content-Type': 'application/json'},
//         },
//       );

//       if (response.status || response.status === 200) {
//         Dialog.show({
//           type: ALERT_TYPE.DANGER,
//           title: 'Reported',
//           textBody: 'Post has been reported successfully',
//           button: 'OK',
//         });
//         setModalVisible2(false);
//         setReportMessage('');
//       } else {
//         throw new Error(response.data.message || 'Failed to report post');
//       }
//     } catch (error) {
//       handleApiError(error, 'Failed to report post');
//     } finally {
//       setReporting(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setHasMore(true);
//     await fetchPosts(1, true);
//     fetchFriendSuggestions();
//   };

//   const handleLoadMore = async () => {
//     if (loadingMore || refreshing || !hasMore) return;
//     const nextPage = page + 1;
//     await fetchPosts(nextPage, false);
//   };

//   /* ---------------------- Render ---------------------- */

//   if (loading && allPosts?.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8337B2" />
//       </View>
//     );
//   }

//   if (error && allPosts.length === 0) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           onPress={() => fetchPosts(1, true)}
//           accessibilityLabel="Retry"
//           accessibilityRole="button">
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Render a Suggest block used inside the main FlatList
//   const RenderSuggestBlock = () => (
//     <View style={{paddingVertical: 12}}>
//       <Text style={styles.suggestFriendText}>Suggest Friend</Text>
//       <FlatList
//         showsHorizontalScrollIndicator={false}
//         horizontal
//         data={suggestions}
//         keyExtractor={s => (s?.id ?? Math.random()).toString()}
//         contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 0}}
//         renderItem={({item: sItem}) => (
//           <View style={styles.suggestFriendcard}>
//             <Image
//               source={{
//                 uri: `https://argosmob.com/being-petz/public/${sItem?.profile}`,
//               }}
//               style={styles.suggestFriendprofileImage}
//               defaultSource={require('../Assests/Images/dog.png')}
//             />
//             <Text
//               style={
//                 styles.suggestFriendname
//               }>{`${sItem.first_name} ${sItem.last_name}`}</Text>
//             <Text style={styles.suggestFriendmutualFriends}>{sItem.breed}</Text>

//             {requestStatus[sItem.id] === 'sent' ? (
//               <View
//                 style={[
//                   styles.suggestFriendrequestButton,
//                   styles.requestSentButton,
//                 ]}>
//                 <Text style={styles.suggestFriendrequestText}>
//                   Request Sent
//                 </Text>
//               </View>
//             ) : (
//               <TouchableOpacity
//                 style={styles.suggestFriendrequestButton}
//                 onPress={() => sendFriendRequest(sItem.id)}
//                 disabled={requestStatus[sItem.id] === 'loading'}>
//                 {requestStatus[sItem.id] === 'loading' ? (
//                   <ActivityIndicator color="#FFFFFF" size="small" />
//                 ) : (
//                   <Text style={styles.suggestFriendrequestText}>
//                     Send Request
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.suggestFriendremoveButton}
//               onPress={() => removeSuggestion(sItem.id)}>
//               <Text style={styles.suggestFriendremoveText}>Remove</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//     </View>
//   );

//   return (
//     <AlertNotificationRoot>
//       <View style={styles.container}>
//         <FlatList
//           data={buildDisplayData()}
//           keyExtractor={item =>
//             item?.__type === 'suggest'
//               ? item.id
//               : item?.id?.toString?.() ?? Math.random().toString()
//           }
//           renderItem={({item}) => {
//             if (item?.__type === 'suggest') return <RenderSuggestBlock />;
//             return <PostCard item={item} />;
//           }}
//           ListHeaderComponent={
//             <>
//               <HomeHeader
//                 onChatPress={() => navigation.navigate('Chats')}
//                 onPeoplePress={() => setModalVisible(true)}
//               />
//               <BannerCarousel />
//               {loading && (
//                 <ActivityIndicator
//                   size="large"
//                   color="#0000ff"
//                   style={{marginVertical: 12}}
//                 />
//               )}
//             </>
//           }
//           initialNumToRender={10}
//           maxToRenderPerBatch={10}
//           windowSize={21}
//           removeClippedSubviews
//           refreshing={refreshing}
//           onRefresh={handleRefresh}
//           onEndReachedThreshold={0.8}
//           onEndReached={handleLoadMore}
//           ListFooterComponent={() =>
//             loadingMore ? (
//               <View style={{paddingVertical: 12}}>
//                 <ActivityIndicator size="small" color="#8337B2" />
//               </View>
//             ) : null
//           }
//           contentContainerStyle={styles.listContent}
//         />

//         <FriendRequestsModal
//           visible={modalVisible}
//           onClose={() => setModalVisible(false)}
//         />

//         <UpdatePostModal
//           visible={showUpdateModal}
//           onClose={() => {
//             setShowUpdateModal(false);
//             fetchPosts(1, true);
//           }}
//           postData={selectedPost}
//           onUpdateSuccess={updatedPost => {
//             setShowUpdateModal(false);
//             fetchPosts(1, true);
//           }}
//         />

//         {/* Post options modal */}
//         <Modal
//           transparent
//           animationType="fade"
//           visible={modalVisible2}
//           onRequestClose={() => setModalVisible2(false)}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalBox}>
//               <View style={styles.modalTopRow}>
//                 <TouchableOpacity
//                   style={{
//                     opacity: selectedPost?.parent_id === userData?.id ? 1 : 0.5,
//                   }}
//                   onPress={() => {
//                     if (selectedPost?.parent_id === userData?.id) {
//                       setModalVisible2(false);
//                       handleEditPost(selectedPost);
//                     }
//                   }}
//                   disabled={selectedPost?.parent_id !== userData?.id}>
//                   <Text
//                     style={{
//                       color:
//                         selectedPost?.parent_id === userData?.id
//                           ? '#8337B2'
//                           : '#fff',
//                       fontSize: 16,
//                       fontWeight: '600',
//                     }}>
//                     Edit
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={{
//                     opacity: selectedPost?.parent_id === userData?.id ? 1 : 0.5,
//                   }}
//                   onPress={() => {
//                     if (selectedPost?.parent_id === userData?.id) {
//                       setModalVisible2(false);
//                       handleDelete(selectedPost);
//                     }
//                   }}
//                   disabled={selectedPost?.parent_id !== userData?.id}>
//                   <Text
//                     style={{
//                       color:
//                         selectedPost?.parent_id === userData?.id
//                           ? '#8337B2'
//                           : '#fff',
//                       fontSize: 16,
//                       fontWeight: '600',
//                     }}>
//                     Delete
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => setModalVisible2(false)}>
//                   <Text
//                     style={{fontSize: 24, color: '#8337B2', fontWeight: '700'}}>
//                     ×
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <TextInput
//                 placeholder="Why are you reporting this post?"
//                 placeholderTextColor="#A569C2"
//                 value={reportMessage}
//                 onChangeText={setReportMessage}
//                 maxLength={100}
//                 style={styles.reportInput}
//                 multiline
//               />

//               <TouchableOpacity
//                 style={styles.submitButton}
//                 onPress={() => {
//                   setModalVisible2(false);
//                   handleReport(selectedPost, reportMessage);
//                 }}>
//                 <Text style={styles.submitButtonText}>Report</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         {/* Comments modal */}
//         <Modal
//           animationType="fade"
//           transparent
//           visible={modalCommentVisible}
//           onRequestClose={() => setModalCommentVisible(false)}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <View style={styles.postInfo}>
//                   <Image
//                     source={{
//                       uri: `https://argosmob.com/being-petz/public/${selectedPostForComment?.parent?.profile}`,
//                     }}
//                     style={styles.smallProfileImage}
//                     defaultSource={require('../Assests/Images/dog.png')}
//                   />
//                   <Text style={styles.postUser}>
//                     {selectedPostForComment?.parent?.first_name}'s post
//                   </Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setModalCommentVisible(false)}>
//                   <Icon name="close" size={24} color="#8337B2" />
//                 </TouchableOpacity>
//               </View>

//               <SafeAreaView style={styles.commentsContainer}>
//                 <FlatList
//                   data={loadingComments ? [] : comments}
//                   keyExtractor={item =>
//                     item.id?.toString?.() ?? Math.random().toString()
//                   }
//                   renderItem={({item}) => {
//                     // Determine user for this comment:
//                     // 1) If API included item.user, use that (preferred)
//                     // 2) else look up cached usersById[item.parent_id]
//                     const commentUser =
//                       item.user || usersById[item.parent_id] || null;
//                     const displayName =
//                       commentUser?.first_name && commentUser?.last_name
//                         ? `${commentUser.first_name} ${commentUser.last_name}`
//                         : commentUser?.first_name ||
//                           commentUser?.last_name ||
//                           'User';

//                     return (
//                       <View style={styles.commentItem}>
//                         <Text style={styles.commentUser}>{displayName}</Text>
//                         <Text style={styles.commentText}>{item.comment}</Text>
//                       </View>
//                     );
//                   }}
//                   ListEmptyComponent={
//                     !loadingComments ? (
//                       <Text style={styles.noComments}>No comments yet</Text>
//                     ) : null
//                   }
//                 />
//                 {loadingComments && (
//                   <View
//                     style={{
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       paddingVertical: 16,
//                     }}>
//                     <ActivityIndicator size="large" color="#8337B2" />
//                   </View>
//                 )}
//               </SafeAreaView>

//               <View style={styles.inputContainer}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Add a comment..."
//                   value={newComment}
//                   onChangeText={setNewComment}
//                   multiline
//                   editable={!postingComment}
//                 />
//                 <TouchableOpacity
//                   style={[
//                     styles.postButton,
//                     (!newComment.trim() || postingComment) &&
//                       styles.postButtonDisabled,
//                   ]}
//                   onPress={handlePostComment}
//                   disabled={!newComment.trim() || postingComment}>
//                   {postingComment ? (
//                     <ActivityIndicator color="white" />
//                   ) : (
//                     <Text style={styles.postButtonText}>Post</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </AlertNotificationRoot>
//   );
// };

// /* ---------------------- Styles ---------------------- */
// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#fff'},
//   listContent: {paddingBottom: 100},
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%',
//   },
//   errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
//   errorText: {color: 'red', marginBottom: 10},
//   retryText: {color: 'blue'},
//   // Post card
//   postCard: {
//     marginTop: 10,
//     marginHorizontal: 8,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowRadius: 8,
//     shadowOffset: {width: 0, height: 2},
//     elevation: 2,
//     paddingBottom: 10,
//   },
//   postHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     paddingBottom: 8,
//   },
//   postProfileImage: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     marginRight: 12,
//     backgroundColor: '#eee',
//   },
//   postUserName: {fontWeight: '600', fontSize: 15, color: '#252525'},
//   postTimeText: {color: '#8583A8', fontSize: 13, marginTop: 2},
//   postCaption: {color: '#333', fontSize: 14, paddingLeft: 10},
//   actionText: {marginHorizontal: 5, color: '#5A5A5A', fontSize: 16},
//   taggedRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 2,
//     marginLeft: 10,
//   },
//   // Birthday styles
//   birthdayContainer: {
//     backgroundColor: '#FFF9F9',
//     borderColor: '#FFD6E7',
//     borderWidth: 1,
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//   },
//   birthdayHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   birthdayProfileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   birthdayUserName: {fontWeight: 'bold', fontSize: 16, color: '#333'},
//   birthdayPostTime: {fontSize: 12, color: '#888'},
//   birthdayContent: {
//     backgroundColor: '#FFEEF6',
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   birthdayText: {
//     fontSize: 16,
//     color: '#D23369',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   petInfo: {alignItems: 'center', marginTop: 10, justifyContent: 'center'},
//   petAvatar: {
//     height: 400,
//     width: '95.5%',
//     borderRadius: 30,
//     marginRight: 10,
//     resizeMode: 'contain',
//   },
//   // Suggest friend
//   suggestFriendText: {
//     marginLeft: 16,
//     color: '#1D1B1B',
//     fontWeight: '600',
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   suggestFriendcard: {
//     width: 150,
//     backgroundColor: '#EEF6FF',
//     borderRadius: 15,
//     padding: 10,
//     marginRight: 10,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   suggestFriendprofileImage: {
//     width: '100%',
//     height: 100,
//     borderRadius: 10,
//     resizeMode: 'cover',
//     marginBottom: 8,
//   },
//   suggestFriendname: {fontSize: 16, fontWeight: 'bold', marginBottom: 4},
//   suggestFriendmutualFriends: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 10,
//   },
//   suggestFriendrequestButton: {
//     backgroundColor: '#8337B2',
//     paddingVertical: 6,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   suggestFriendrequestText: {color: '#FFFFFF', fontSize: 14, fontWeight: '600'},
//   suggestFriendremoveButton: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#8337B2',
//     paddingVertical: 6,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   suggestFriendremoveText: {color: '#374151', fontSize: 14, fontWeight: '600'},
//   requestSentButton: {backgroundColor: '#ccc'},

//   // Media / carousel helper styles
//   videoContainer: {
//     overflow: 'hidden',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     width: '95%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.15)',
//   },
//   mediaCounter: {
//     position: 'absolute',
//     top: 16,
//     right: 48,
//     backgroundColor: 'rgba(36,36,36,0.55)',
//     borderRadius: 14,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     zIndex: 1,
//   },
//   mediaDotsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 8,
//     marginBottom: 2,
//     width: '100%',
//   },
//   dot: {width: 8, height: 8, borderRadius: 8, margin: 3},
//   dotActive: {backgroundColor: '#8337B2'},
//   dotInactive: {backgroundColor: '#D3CCE3'},

//   // modals & comments
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: '50%',
//     padding: 16,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 12,
//     marginBottom: 12,
//   },
//   modalTitle: {fontSize: 20, fontWeight: 'bold', color: '#8337B2'},
//   commentsContainer: {flex: 1},
//   commentItem: {
//     backgroundColor: '#f8f8f8',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   commentUser: {fontWeight: 'bold', color: '#8337B2', marginBottom: 4},
//   commentText: {color: '#333'},
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 12,
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     maxHeight: 100,
//   },
//   postButton: {
//     backgroundColor: '#8337B2',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   postButtonText: {color: 'white', fontWeight: 'bold'},
//   postButtonDisabled: {opacity: 0.6},
//   smallProfileImage: {width: 30, height: 30, borderRadius: 15, marginRight: 10},
//   postInfo: {flexDirection: 'row', alignItems: 'center'},
//   postUser: {fontWeight: 'bold', color: '#8337B2'},
//   noComments: {textAlign: 'center', marginTop: 20, color: '#888'},

//   // Option modal styles
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(8,8,24,0.15)',
//   },
//   modalBox: {
//     width: '84%',
//     maxWidth: 420,
//     backgroundColor: '#fff',
//     borderRadius: 18,
//     paddingHorizontal: 20,
//     paddingTop: 14,
//     paddingBottom: 18,
//     shadowColor: '#222',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.17,
//     shadowRadius: 14,
//     elevation: 8,
//   },
//   modalTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   reportInput: {
//     backgroundColor: '#fff',
//     borderWidth: 1.5,
//     borderColor: '#8337B2',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 13,
//     marginTop: 10,
//     marginBottom: 24,
//     fontSize: 15,
//     color: '#8337B2',
//     minHeight: 56,
//     textAlignVertical: 'top',
//   },
//   submitButton: {
//     backgroundColor: '#8337B2',
//     paddingVertical: 13,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     letterSpacing: 0.4,
//   },
// });

// export default Home;






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
  Dimensions,
  Platform,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FriendRequestsModal from './Components/FriendRequestsModal';
import SuggestFriend from './Components/SuggestFriend';
import AdvancedFloatingButton from './Components/AdvancedFloatingButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import UpdatePostModal from './Components/UpdatePostModal';
import BannerCarousel from './Components/BannerCarousel';
import HomeHeader from './Components/HomeHeader';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from 'react-native-alert-notification';
import Video from 'react-native-video';

const {height, width} = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();

  // Core UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [postsData, setPostsData] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [postingComment, setPostingComment] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [likingPosts, setLikingPosts] = useState({});
  const [allPosts, setAllPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reporting, setReporting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [parentComment, setParentComment] = useState({});
  const [usersById, setUsersById] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 10; // adjust to your API

  const characterLimit = 150;
  const isFocused = useIsFocused();

  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    // Optionally show dialogs/toasts here
  };

  // Animated comment modal state + ref
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const animTranslateY = useRef(new Animated.Value(height)).current;

  // Android hardware back handling
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !BackHandler) return;

      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Do you want to exit the app?',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Exit', onPress: () => BackHandler.exitApp()},
          ],
          {cancelable: false},
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, []),
  );

  // Fetch stored user info
  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData?.id) {
          setUserData(parsedData);
          return parsedData;
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

  // Initial load when screen focused
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isFocused && isMounted) {
        setLoading(true);
        try {
          await fetchPosts(1, true);
        } catch (err) {
          if (!axios.isCancel(err)) {
            handleApiError(err, 'Failed to fetch posts');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  // When userData is available, load user-specific bits
  useEffect(() => {
    let isMounted = true;
    if (!userData) return;
    if (isMounted) {
      fetchMyPosts();
      fetchFriendSuggestions();
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // Build display list that inserts a suggest-block every N posts
  const buildDisplayData = () => {
    const posts = Array.isArray(allPosts) ? allPosts : [];
    const display = [];
    for (let i = 0; i < posts.length; i++) {
      display.push(posts[i]);
      if ((i + 1) % 10 === 0) {
        display.push({__type: 'suggest', id: `suggest-${(i + 1) / 10}`});
      }
    }
    return display;
  };

  // fetch posts with pagination
  const fetchPosts = async (requestedPage = 1, replace = false) => {
    try {
      if (requestedPage === 1) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await axios.get(
        `https://argosmob.com/being-petz/public/api/v1/post/all`,
        {
          params: {page: requestedPage},
        },
      );

      const fetched = Array.isArray(response?.data?.data?.data)
        ? response.data.data.data
        : [];

      if (replace || requestedPage === 1) {
        setAllPosts(fetched);
      } else {
        setAllPosts(prev => [...prev, ...fetched]);
      }

      // detect more pages
      if (fetched.length < perPage) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPage(requestedPage);
    } catch (err) {
      if (!axios.isCancel(err)) {
        handleApiError(err, 'Failed to fetch posts');
        setError('Failed to load posts');
      }
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
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
      formData.append('parent_id', userData.id.toString());

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/like',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data.status || response.data.message === 'Post liked') {
        setAllPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  likes_count:
                    response.data.likes_count ??
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

  const handleRepost = async (item, fetchPostsCallback) => {
    try {
      if (!userData?.id) throw new Error('User not authenticated');
      if (!item?.id) throw new Error('Invalid post');

      const formData = new FormData();
      formData.append('user_id', userData.id);
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

      if (typeof fetchPostsCallback === 'function') {
        await fetchPostsCallback(1, true);
      }

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
      } else if (error.message?.includes('timeout')) {
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
    }
  };

  /* ---------- PostCard components (Birthday / Original / Repost) ---------- */
  const PostCard = React.memo(({item}) => {
    if (!item) return null;
    if (item?.repost_id) return <PostCardRepost item={item} />;
    if (item?.post_type === 'birthday') return <PostCardBirthday item={item} />;
    return <PostCardOriginal item={item} />;
  });

  const PostCardBirthday = ({item}) => {
    const [expanded, setExpanded] = useState(false);
    const isLongText = (item?.content || '').length > characterLimit;
    const displayText = expanded
      ? item?.content
      : (item?.content || '').slice(0, characterLimit);

    return (
      <View style={styles.birthdayContainer}>
        <View style={styles.birthdayHeader}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
            }}
            style={styles.birthdayProfileImage}
          />
          <View style={{flex: 1}}>
            <Text style={styles.birthdayUserName}>
              {item?.parent?.first_name} {item?.parent?.last_name}
            </Text>
            <Text style={styles.birthdayPostTime}>
              {item?.created_at_human}
            </Text>
          </View>
        </View>

        <View style={styles.birthdayContent}>
          <Text style={styles.birthdayText}>{item?.content}</Text>
          <View style={styles.petInfo}>
            <Image
              source={{
                uri: `https://argosmob.com/being-petz/public/${item?.pet?.avatar}`,
              }}
              style={styles.petAvatar}
            />
          </View>
        </View>

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

    const isLongText = (item?.content || '').length > characterLimit;
    const displayText = expanded
      ? item?.content
      : (item?.content || '').slice(0, characterLimit);

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
          }}>
          {media.isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{uri}}
                style={{width: width - 32, height: 400}}
                resizeMode="cover"
                paused={true}
                repeat={true}
                posterResizeMode="cover"
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
              />
              <View style={styles.playOverlay}>
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
      <View style={styles.postCard}>
        <View style={styles.postHeaderRow}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}`,
            }}
            style={styles.postProfileImage}
          />
          <View style={{flex: 1}}>
            <Text style={styles.postUserName}>
              {item?.parent?.first_name} {item?.parent?.last_name}
            </Text>
            <Text style={styles.postTimeText}>{item?.created_at_human}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedPost(item);
              setModalVisible2(true);
            }}>
            <Icon name="dots-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {item?.content ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.postCaption}>
              {displayText}
              {isLongText && !expanded ? '...' : ''}
              {isLongText && (
                <Text style={{color: '#8337B2', fontWeight: '600'}}>
                  {expanded ? ' Less' : ' More'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ) : null}

        {item?.tagged_users?.length > 0 && (
          <View style={styles.taggedRow}>
            <Icon
              name="tag"
              size={16}
              color="#8337B2"
              style={{marginRight: 4}}
            />
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {item.tagged_users.map((user, index) => (
                <Text
                  key={user.id}
                  style={{color: '#8337B2', fontSize: 13, marginRight: 4}}>
                  {user.first_name} {user.last_name}
                  {index < item.tagged_users.length - 1 ? ',' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}

        {hasMedia && (
          <View
            style={{width: width, alignItems: 'center', position: 'relative'}}>
            {multipleMedia && (
              <View style={styles.mediaCounter}>
                <Text style={{color: '#fff', fontWeight: '600', fontSize: 13}}>
                  {currentIndex + 1}/{allMedia.length}
                </Text>
              </View>
            )}

            <FlatList
              data={allMedia}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `${i}`}
              renderItem={({item: mItem, index}) =>
                renderMediaItem(mItem, index)
              }
              onMomentumScrollEnd={onScrollEnd}
              style={{width: width - 16, height: 400}}
            />

            {multipleMedia && (
              <View style={styles.mediaDotsRow}>
                {allMedia.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      currentIndex === i
                        ? styles.dotActive
                        : styles.dotInactive,
                    ]}
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
              backgroundColor: 'rgba(255,255,255,0.9)',
              marginTop: -StatusBar.currentHeight,
              paddingTop: StatusBar.currentHeight,
            }}>
            <View style={{width: '100%', height: '100%', justifyContent: 'center'}}>
              {selectedMedia?.isVideo ? (
                <>
                  <Video
                    source={{uri: selectedMedia.uri}}
                    style={{width: '100%', height: '100%'}}
                    resizeMode="contain"
                    paused={paused}
                    repeat={true}
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
                      backgroundColor: paused ? 'rgba(0,0,0,0.4)' : 'transparent',
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
                  style={{width: '100%', height: '100%'}}
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

    const getMediaItems = post => [
      ...(post?.featured_image ? [{uri: post.featured_image, isVideo: false}] : []),
      ...(post?.featured_video ? [{uri: post.featured_video, isVideo: true}] : []),
      ...(post?.images?.map(img => ({uri: img.image_path, isVideo: false})) || []),
      ...(post?.videos?.map(vid => ({uri: vid.video_path, isVideo: true})) || []),
    ];

    const originalMedia = getMediaItems(item);
    const repostMedia = item?.repost ? getMediaItems(item.repost) : [];
    const allMedia = [...originalMedia, ...repostMedia];

    const hasMedia = allMedia.length > 0;
    const multipleMedia = allMedia.length > 1;

    const isLongText = (item?.content || '').length > characterLimit;
    const displayText = expanded
      ? item?.content
      : (item?.content || '').slice(0, characterLimit);

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
          }}>
          {media.isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{uri}}
                style={{width: '100%', height: 400}}
                resizeMode="cover"
                paused={true}
                repeat={true}
              />
              <View style={styles.playOverlay}>
                <Icon name="play-circle" size={70} color="rgba(255,255,255,0.85)" />
              </View>
            </View>
          ) : (
            <Image source={{uri}} style={{width: '95.5%', height: 400, borderRadius: 8}} resizeMode="cover" />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeaderRow}>
          <Image
            source={{ uri: `https://argosmob.com/being-petz/public/${item?.parent?.profile}` }}
            style={styles.postProfileImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.postUserName}>{item?.parent?.first_name} {item?.parent?.last_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
              <Icon name="repeat" size={14} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: '#888', fontSize: 13 }}>Reposted</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { setSelectedPost(item); setModalVisible2(true); }}>
            <Icon name="dots-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {item?.content != null && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.postCaption}>
              {displayText}
              {isLongText && !expanded ? '...' : ''}
              {isLongText && (
                <Text style={{ color: '#8337B2', fontWeight: '600' }}>
                  {expanded ? ' Less' : ' More'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}

        {hasMedia && (
          <View style={{ width: width, alignItems: 'center', position: 'relative' }}>
            {multipleMedia && (
              <View style={styles.mediaCounter}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{currentIndex + 1}/{allMedia.length}</Text>
              </View>
            )}

            <FlatList
              data={allMedia}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `${i}`}
              renderItem={({ item: mItem, index }) => renderMediaItem(mItem, index)}
              onMomentumScrollEnd={onScrollEnd}
              style={{ width: width, height: 400 }}
            />

            {multipleMedia && (
              <View style={styles.mediaDotsRow}>
                {allMedia.map((_, i) => (
                  <View key={i} style={[styles.dot, currentIndex === i ? styles.dotActive : styles.dotInactive]} />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ marginTop: 10 }}>
          <PostActions item={item} />
        </View>

        <Modal
          visible={mediaModalVisible}
          transparent
          statusBarTranslucent
          onRequestClose={() => { setPaused(true); setMediaModalVisible(false); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', marginTop: -StatusBar.currentHeight, paddingTop: StatusBar.currentHeight }}>
            <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
              {selectedMedia?.isVideo ? (
                <>
                  <Video source={{ uri: selectedMedia.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" paused={paused} repeat />
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setPaused(!paused)} style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: paused ? 'rgba(0,0,0,0.4)' : 'transparent'
                  }}>
                    {paused && <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' }}>
                      <Icon name="play" size={40} color="white" />
                    </View>}
                  </TouchableOpacity>
                </>
              ) : (
                <Image source={{ uri: selectedMedia?.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              )}
            </View>
            <TouchableOpacity style={{ position: 'absolute', top: StatusBar.currentHeight + 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: 10 }} onPress={() => { setPaused(true); setMediaModalVisible(false); }}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  const PostActions = ({item}) => {
    console.log("hhhhh",item)
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
        marginTop: 8,
      }}>
        <TouchableOpacity onPress={() => handleLikePost(item?.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 }}>
          <Icon name={item.is_liked ? 'heart' : 'heart-outline'} size={22} color={item.is_liked ? '#FF0000' : '#5A5A5A'} />
          <Text style={styles.actionText}>{item?.likes_count || 0}</Text>
          <Text style={{ fontSize: 14, color: '#5A5A5A' }}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openCommentModal(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 }}>
          <Text style={{ marginRight: 6, fontSize: 18 }}>💬</Text>
          <Text style={styles.actionText}>{item?.comments_count || 0}</Text>
          <Text style={{ fontSize: 14, color: '#5A5A5A' }}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleRepost(item, fetchPosts)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 }}>
          <Text style={{ marginRight: 6, fontSize: 18 }}>🔄</Text>
          <Text style={{ fontSize: 14, color: '#5A5A5A' }}>Repost</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // open comment modal (animated modal)
  const openCommentModal = post => {
    if (!post) return;
    setSelectedPostForComment(post);

    // show modal and animate up
    setCommentModalVisible(true);
    animTranslateY.setValue(height);
    Animated.timing(animTranslateY, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();

    // fetch comments
    fetchComments(post?.id);
  };

  const closeCommentModal = () => {
    Animated.timing(animTranslateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCommentModalVisible(false);
      setSelectedPostForComment(null);
      setComments([]);
      setNewComment('');
    });
  };

  /**
   * fetchComments:
   * - fetches comments for a post
   * - stores comments
   * - ensures users referenced in comments are available in usersById
   */
  const fetchComments = async postId => {
    if (!postId) return;
    setLoadingComments(true);

    try {
      const formData = new FormData();
      formData.append('post_id', postId);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/get-comment',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (!response.data?.status) {
        throw new Error(response.data?.message || 'Failed to fetch comments');
      }

      const fetchedComments = response.data.comment || [];

      // Collect unique parent IDs from comments
      const parentIds = [
        ...new Set(
          fetchedComments.map(c => c?.parent_id ?? c?.user?.id).filter(Boolean),
        ),
      ];

      // Build newUsers object from any users already returned by API inside the comment objects
      const newUsersFromComments = {};
      fetchedComments.forEach(c => {
        if (c?.user && c.user?.id) {
          newUsersFromComments[c.user.id] = c.user;
        }
      });

      // Determine which parentIds are missing in cache (usersById)
      const missingIds = parentIds.filter(
        id => !usersById[id] && !newUsersFromComments[id],
      );

      // Fetch missing users (if any).
      if (missingIds.length > 0) {
        const fetches = missingIds.map(id => {
          const fd = new FormData();
          fd.append('user_id', id);
          return axios
            .post(
              'https://argosmob.com/being-petz/public/api/v1/auth/my-detail',
              fd,
              {headers: {'Content-Type': 'multipart/form-data'}},
            )
            .then(res => ({id, user: res.data?.user}))
            .catch(err => {
              console.warn('Failed to fetch comment user', id, err);
              return null;
            });
        });

        const results = await Promise.all(fetches);
        const fetchedUserMap = results.reduce((acc, r) => {
          if (r && r.id && r.user) acc[r.id] = r.user;
          return acc;
        }, {});

        // Merge new user results + any user objects already in comments into usersById
        setUsersById(prev => ({
          ...prev,
          ...newUsersFromComments,
          ...fetchedUserMap,
        }));
      } else {
        // No missing ids: just merge any users included directly inside comments
        setUsersById(prev => ({...prev, ...newUsersFromComments}));
      }

      // finally set comments
      setComments(fetchedComments);
    } catch (error) {
      handleApiError(error, 'Failed to load comments');
      setComments([]);
    } finally {
      setLoadingComments(false);
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

    if (!userData?.id) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'User not found. Please login again.',
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
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );

      if (response.data.status) {
        setNewComment('');
        Keyboard.dismiss();
        // Re-fetch comments and posts to update counts
        await fetchComments(selectedPostForComment.id);
        await fetchPosts(1, true);
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
    if (!userData?.id) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('parent_id', userData?.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/suggestions',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
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
    if (!userData?.id) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('parent_id', userData?.id);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/post/get/my',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
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

  const sendFriendRequest = async to_parent_id => {
    if (!validateUserData()) return;

    try {
      setRequestStatus(prev => ({...prev, [to_parent_id]: 'loading'}));

      const formData = new FormData();
      formData.append('from_parent_id', userData.id.toString());
      formData.append('to_parent_id', to_parent_id.toString());

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/pet/friends/send-request',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
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
        await AsyncStorage.setItem('removedSuggestions', JSON.stringify(removedIds));
      }
      setSuggestions(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      handleApiError(error, 'Failed to remove suggestion');
    }
  };

  const handleFloatPress = () => navigation.navigate('Add');

  const handleEditPost = post => {
    setSelectedPost(post);
    setShowUpdateModal(true);
  };

  const handleDelete = async post => {
    if (!userData?.id) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'User data not found',
        button: 'OK',
      });
      return;
    }
    if (post?.parent_id !== userData?.id) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Permission Denied',
        textBody: 'You can only delete your own posts',
        button: 'OK',
      });
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post?',
      [
        {text: 'Cancel', style: 'cancel'},
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
                  headers: {'Content-Type': 'multipart/form-data'},
                },
              );

              if (response.data.status || response.status === 200) {
                Dialog.show({
                  type: ALERT_TYPE.SUCCESS,
                  title: 'Success',
                  textBody: 'Post deleted successfully',
                  button: 'OK',
                });
                await fetchPosts(1, true);
                setModalVisible2(false);
              } else {
                throw new Error(response.data.message || 'Failed to delete post');
              }
            } catch (error) {
              handleApiError(error, 'Failed to delete post');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleHide = async post => {
    try {
      const stored = await AsyncStorage.getItem('user_data');
      if (!stored) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User data not found',
          button: 'OK',
        });
        return;
      }
      const parsed = JSON.parse(stored);
      const userId = parsed?.id;
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
          {text: 'Cancel', style: 'cancel'},
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
                    headers: {'Content-Type': 'multipart/form-data'},
                  },
                );

                if (response.data.status || response.status === 200) {
                  Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Post hidden successfully',
                    button: 'OK',
                  });
                  await fetchPosts(1, true);
                } else {
                  throw new Error(response.data.message || 'Failed to hide post');
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
      const stored = await AsyncStorage.getItem('user_data');
      if (!stored) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'User data not found',
          button: 'OK',
        });
        return;
      }
      const parsed = JSON.parse(stored);
      const userId = parsed?.id;
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
        reason,
      };

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/report/add',
        JSON.stringify(reportPayload),
        {
          headers: {'Content-Type': 'application/json'},
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
    setHasMore(true);
    await fetchPosts(1, true);
    fetchFriendSuggestions();
  };

  const handleLoadMore = async () => {
    if (loadingMore || refreshing || !hasMore) return;
    const nextPage = page + 1;
    await fetchPosts(nextPage, false);
  };

  /* ---------------------- Render ---------------------- */

  if (loading && allPosts?.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  if (error && allPosts.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchPosts(1, true)} accessibilityLabel="Retry" accessibilityRole="button">
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render a Suggest block used inside the main FlatList
  const RenderSuggestBlock = () => (
    <View style={{paddingVertical: 12}}>
      <Text style={styles.suggestFriendText}>Suggest Friend</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={suggestions}
        keyExtractor={s => (s?.id ?? Math.random()).toString()}
        contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 0}}
        renderItem={({item: sItem}) => (
          <View style={styles.suggestFriendcard}>
            <Image
              source={{
                uri: `https://argosmob.com/being-petz/public/${sItem?.profile}`,
              }}
              style={styles.suggestFriendprofileImage}
              defaultSource={require('../Assests/Images/dog.png')}
            />
            <Text style={styles.suggestFriendname}>{`${sItem.first_name} ${sItem.last_name}`}</Text>
            <Text style={styles.suggestFriendmutualFriends}>{sItem.breed}</Text>

            {requestStatus[sItem.id] === 'sent' ? (
              <View style={[styles.suggestFriendrequestButton, styles.requestSentButton]}>
                <Text style={styles.suggestFriendrequestText}>Request Sent</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.suggestFriendrequestButton} onPress={() => sendFriendRequest(sItem.id)} disabled={requestStatus[sItem.id] === 'loading'}>
                {requestStatus[sItem.id] === 'loading' ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.suggestFriendrequestText}>Send Request</Text>}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.suggestFriendremoveButton} onPress={() => removeSuggestion(sItem.id)}>
              <Text style={styles.suggestFriendremoveText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <FlatList
          data={buildDisplayData()}
          keyExtractor={item =>
            item?.__type === 'suggest' ? item.id : item?.id?.toString?.() ?? Math.random().toString()
          }
          renderItem={({item}) => {
            if (item?.__type === 'suggest') return <RenderSuggestBlock />;
            return <PostCard item={item} />;
          }}
          ListHeaderComponent={
            <>
              <HomeHeader onChatPress={() => navigation.navigate('Chats')} onPeoplePress={() => setModalVisible(true)} />
              <BannerCarousel />
              {loading && (
                <ActivityIndicator size="large" color="#0000ff" style={{marginVertical: 12}} />
              )}
            </>
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReachedThreshold={0.8}
          onEndReached={handleLoadMore}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={{paddingVertical: 12}}>
                <ActivityIndicator size="small" color="#8337B2" />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />

        <FriendRequestsModal visible={modalVisible} onClose={() => setModalVisible(false)} />

        <UpdatePostModal
          visible={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            fetchPosts(1, true);
          }}
          postData={selectedPost}
          onUpdateSuccess={updatedPost => {
            setShowUpdateModal(false);
            fetchPosts(1, true);
          }}
        />

        {/* Post options modal (kept as-is) */}
        <Modal transparent animationType="fade" visible={modalVisible2} onRequestClose={() => setModalVisible2(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalTopRow}>
                <TouchableOpacity
                  style={{opacity: selectedPost?.parent_id === userData?.id ? 1 : 0.5}}
                  onPress={() => {
                    if (selectedPost?.parent_id === userData?.id) {
                      setModalVisible2(false);
                      handleEditPost(selectedPost);
                    }
                  }}
                  disabled={selectedPost?.parent_id !== userData?.id}>
                  <Text style={{color: selectedPost?.parent_id === userData?.id ? '#8337B2' : '#fff', fontSize: 16, fontWeight: '600'}}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{opacity: selectedPost?.parent_id === userData?.id ? 1 : 0.5}}
                  onPress={() => {
                    if (selectedPost?.parent_id === userData?.id) {
                      setModalVisible2(false);
                      handleDelete(selectedPost);
                    }
                  }}
                  disabled={selectedPost?.parent_id !== userData?.id}>
                  <Text style={{color: selectedPost?.parent_id === userData?.id ? '#8337B2' : '#fff', fontSize: 16, fontWeight: '600'}}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalVisible2(false)}>
                  <Text style={{fontSize: 24, color: '#8337B2', fontWeight: '700'}}>×</Text>
                </TouchableOpacity>
              </View>

              <TextInput placeholder="Why are you reporting this post?" placeholderTextColor="#A569C2" value={reportMessage} onChangeText={setReportMessage} maxLength={100} style={styles.reportInput} multiline />

              <TouchableOpacity style={styles.submitButton} onPress={() => { setModalVisible2(false); handleReport(selectedPost, reportMessage); }}>
                <Text style={styles.submitButtonText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ---------------- Comment modal (Animated slide-up) ---------------- */}
        <Modal
          visible={commentModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeCommentModal}
        >
          {/* backdrop */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={closeCommentModal}
          />

          <Animated.View
            style={[
              styles.animatedSheet,
              { transform: [{ translateY: animTranslateY }] },
            ]}
          >
            {/* header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetPostInfo}>
                <Image
                  source={{uri: `https://argosmob.com/being-petz/public/${selectedPostForComment?.parent?.profile}`}}
                  style={styles.smallProfileImage}
                  defaultSource={require('../Assests/Images/dog.png')}
                />
                <Text style={styles.postUser}>
                  {selectedPostForComment?.parent?.first_name ? `${selectedPostForComment.parent.first_name}'s post` : 'Comments'}
                </Text>
              </View>
              <TouchableOpacity onPress={closeCommentModal}>
                <Icon name="close" size={20} color="#8337B2" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              {loadingComments ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size="large" color="#8337B2" />
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={item => item.id?.toString?.() ?? Math.random().toString()}
                  renderItem={({item}) => {
                    const commentUser = item.user || usersById[item.parent_id] || null;
                    const displayName =
                      commentUser?.first_name && commentUser?.last_name
                        ? `${commentUser.first_name} ${commentUser.last_name}`
                        : commentUser?.first_name || commentUser?.last_name || 'User';

                    return (
                      <View style={styles.commentItem}>
                        <Text style={styles.commentUser}>{displayName}</Text>
                        <Text style={styles.commentText}>{item.comment}</Text>
                      </View>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.noComments}>No comments yet</Text>}
                  contentContainerStyle={{paddingBottom: 12}}
                  style={{flex: 1}}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.sheetInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  editable={!postingComment}
                />
                <TouchableOpacity
                  style={[styles.postButton, (!newComment.trim() || postingComment) && styles.postButtonDisabled]}
                  onPress={handlePostComment}
                  disabled={!newComment.trim() || postingComment}>
                  {postingComment ? <ActivityIndicator color="white" /> : <Text style={styles.postButtonText}>Post</Text>}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </Modal>

        {/* <AdvancedFloatingButton onPress={handleFloatPress} /> */}
      </View>
    </AlertNotificationRoot>
  );
};

/* ---------------------- Styles ---------------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  listContent: {paddingBottom: 100},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorText: {color: 'red', marginBottom: 10},
  retryText: {color: 'blue'},
  // Post card
  postCard: {
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
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  postProfileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  postUserName: {fontWeight: '600', fontSize: 15, color: '#252525'},
  postTimeText: {color: '#8583A8', fontSize: 13, marginTop: 2},
  postCaption: {color: '#333', fontSize: 14, paddingLeft: 10},
  actionText: {marginHorizontal: 5, color: '#5A5A5A', fontSize: 16},
  taggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    marginLeft: 10,
  },
  // Birthday styles
  birthdayContainer: {
    backgroundColor: '#FFF9F9',
    borderColor: '#FFD6E7',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  birthdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  birthdayProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  birthdayUserName: {fontWeight: 'bold', fontSize: 16, color: '#333'},
  birthdayPostTime: {fontSize: 12, color: '#888'},
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
  petInfo: {alignItems: 'center', marginTop: 10, justifyContent: 'center'},
  petAvatar: {
    height: 400,
    width: '95.5%',
    borderRadius: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  // Suggest friend
  suggestFriendText: {
    marginLeft: 16,
    color: '#1D1B1B',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
  suggestFriendcard: {
    width: 150,
    backgroundColor: '#EEF6FF',
    borderRadius: 15,
    padding: 10,
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
  suggestFriendname: {fontSize: 16, fontWeight: 'bold', marginBottom: 4},
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
  suggestFriendrequestText: {color: '#FFFFFF', fontSize: 14, fontWeight: '600'},
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
  suggestFriendremoveText: {color: '#374151', fontSize: 14, fontWeight: '600'},
  requestSentButton: {backgroundColor: '#ccc'},

  // Media / carousel helper styles
  videoContainer: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  mediaCounter: {
    position: 'absolute',
    top: 16,
    right: 48,
    backgroundColor: 'rgba(36,36,36,0.55)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 1,
  },
  mediaDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 2,
    width: '100%',
  },
  dot: {width: 8, height: 8, borderRadius: 8, margin: 3},
  dotActive: {backgroundColor: '#8337B2'},
  dotInactive: {backgroundColor: '#D3CCE3'},

  // bottom sheet header & body (kept names)
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sheetPostInfo: {flexDirection: 'row', alignItems: 'center'},
  sheetBody: {flex: 1, paddingHorizontal: 16, paddingTop: 12},

  // animated modal specific styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  animatedSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // same as your snappoint
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 10,
  },

  // modals & comments (kept some original names for reuse)
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    overflow: 'hidden',
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
  modalTitle: {fontSize: 20, fontWeight: 'bold', color: '#8337B2'},
  commentsContainer: {flex: 1},
  commentItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentUser: {fontWeight: 'bold', color: '#8337B2', marginBottom: 4},
  commentText: {color: '#333'},
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
    backgroundColor: '#fff',
  },
  postButton: {
    backgroundColor: '#8337B2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {color: 'white', fontWeight: 'bold'},
  postButtonDisabled: {opacity: 0.6},
  smallProfileImage: {width: 30, height: 30, borderRadius: 15, marginRight: 10},
  postInfo: {flexDirection: 'row', alignItems: 'center'},
  postUser: {fontWeight: 'bold', color: '#8337B2'},
  noComments: {textAlign: 'center', marginTop: 20, color: '#888'},

  sheetInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },

  // Option modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8,8,24,0.15)',
  },
  modalBox: {
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
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportInput: {
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
  },
  submitButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
});

export default Home;

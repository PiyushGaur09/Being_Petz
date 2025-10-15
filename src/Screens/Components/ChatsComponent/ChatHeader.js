// import {useNavigation} from '@react-navigation/native';
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Platform,
//   Share,
//   ActivityIndicator,
//   Alert,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';
// import LinearGradient from 'react-native-linear-gradient';

// const ChatHeader = ({community = {}, onBack}) => {
//   const [communityData, setCommunityData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigation = useNavigation();

//   // placeholder image require — adjust path if your asset structure differs
//   const placeholderImage = require('../../../Assests/Images/dog.png');

//   useEffect(() => {
//     let cancelled = false;
//     const source = axios.CancelToken.source();

//     const fetchCommunityDetails = async () => {
//       if (!community?.id) {
//         setLoading(false);
//         setError('No community specified');
//         return;
//       }

//       try {
//         const formData = new FormData();
//         formData.append('community_id', community.id);

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/pet/community/details',
//           formData,
//           {
//             headers: {'Content-Type': 'multipart/form-data'},
//             cancelToken: source.token,
//           },
//         );

//         if (cancelled) return;

//         if (response?.data?.status) {
//           setCommunityData(response.data.data ?? null);
//           setError(null);
//         } else {
//           setCommunityData(null);
//           setError(
//             response?.data?.message || 'Failed to fetch community details',
//           );
//         }
//       } catch (err) {
//         if (axios.isCancel(err)) {
//           // request cancelled, do nothing
//         } else {
//           setError(err.message || 'Error fetching community');
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchCommunityDetails();

//     return () => {
//       cancelled = true;
//       source.cancel('Component unmounted — cancel fetch');
//     };
//   }, [community]);

//   const handleShare = async () => {
//     try {
//       const playStoreWebLink =
//         'https://play.google.com/store/apps/details?id=com.being_petz&pcampaignid=web_share';
//       const iosAppStoreLink = 'https://apps.apple.com/app/idYOUR_APP_ID'; // update if available

//       // Deep link your app can handle
//       const deepLink = `beingpetz://community/${community?.id}`;

//       // Compose a friendly message with deep link + fallback store link
//       const message = `Join ${
//         community?.name || 'this community'
//       } on BeingPetz! 🎉\n\nOpen in app: ${deepLink}\nIf you don't have the app, download here:\n${
//         Platform.OS === 'ios' ? iosAppStoreLink : playStoreWebLink
//       }`;

//       // Try to open the deep link first (if user wants to open directly)
//       // but still present the share sheet so the user can copy / send links.
//       try {
//         const canOpenDeep = await Linking.canOpenURL(deepLink);
//         if (canOpenDeep) {
//           // optionally open it directly, but better to let user choose; we will open share sheet
//           // await Linking.openURL(deepLink);
//         }
//       } catch (err) {
//         // ignore — we'll still open the share sheet
//       }

//       await Share.share({
//         message,
//         title: `${community?.name || 'BeingPetz'} Community`,
//       });
//     } catch (error) {
//       console.error('Error sharing community link:', error);
//       Alert.alert('Error', 'Could not open share sheet. Please try again.');
//     }
//   };

//   const profileUri =
//     communityData?.profile && typeof communityData.profile === 'string'
//       ? {uri: `https://argosmob.com/being-petz/public/${communityData.profile}`}
//       : placeholderImage;

//   return (
//     <LinearGradient
//       colors={['#8337B2', '#3B0060']}
//       start={{x: 0, y: 0}}
//       end={{x: 1, y: 0}}
//       style={styles.header}>
//       <View style={styles.headerContent}>
//         <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
//           <TouchableOpacity
//             onPress={onBack}
//             accessibilityLabel="Back"
//             accessibilityRole="button">
//             <Icon name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>

//           {loading ? (
//             <View style={styles.loadingWrapper}>
//               <ActivityIndicator size="small" color="#fff" />
//             </View>
//           ) : (
//             <>
//               <Image source={profileUri} style={styles.profileImage} />

//               <TouchableOpacity
//                 style={styles.headerText}
//                 onPress={() =>
//                   navigation.navigate('CommunityInfo', {community})
//                 }
//                 accessibilityRole="button"
//                 accessibilityLabel="Open community info">
//                 <Text style={styles.headerName} numberOfLines={1}>
//                   {community?.name ?? 'Community'}
//                 </Text>

//                 <Text style={styles.membersCount}>
//                   {Array.isArray(communityData?.members)
//                     ? `${communityData.members.length} members`
//                     : '0 members'}
//                 </Text>

//                 <Text style={styles.headerStatus}>
//                   Tap here for contacts info
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>

//         <TouchableOpacity
//           onPress={handleShare}
//           accessibilityRole="button"
//           accessibilityLabel="Share community">
//           <Icon name="share-social-outline" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {error ? (
//         <View style={styles.errorRow}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : null}
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     paddingTop: 24,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   loadingWrapper: {
//     marginLeft: 12,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginHorizontal: 12,
//     borderWidth: 0.5,
//     borderColor: '#111',
//     backgroundColor: '#fff',
//   },
//   headerText: {
//     flex: 1,
//     minWidth: 0, // allow truncation
//   },
//   headerName: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   headerStatus: {
//     color: 'rgba(255,255,255,0.85)',
//     fontSize: 12,
//   },
//   membersCount: {
//     fontSize: 14,
//     color: '#fff',
//   },
//   errorRow: {
//     marginTop: 8,
//   },
//   errorText: {
//     color: '#ffdcdc',
//     fontSize: 12,
//   },
// });

// export default ChatHeader;

// import {useNavigation} from '@react-navigation/native';
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Platform,
//   Share,
//   ActivityIndicator,
//   Alert,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';
// import LinearGradient from 'react-native-linear-gradient';

// const ChatHeader = ({community = {}, onBack}) => {
//   const [communityData, setCommunityData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigation = useNavigation();

//   // placeholder image require — adjust path if your asset structure differs
//   const placeholderImage = require('../../../Assests/Images/dog.png');

//   useEffect(() => {
//     let cancelled = false;
//     const source = axios.CancelToken.source();

//     const fetchCommunityDetails = async () => {
//       if (!community?.id) {
//         setLoading(false);
//         setError('No community specified');
//         return;
//       }

//       try {
//         const formData = new FormData();
//         formData.append('community_id', community.id);

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/pet/community/details',
//           formData,
//           {
//             headers: {'Content-Type': 'multipart/form-data'},
//             cancelToken: source.token,
//           },
//         );

//         if (cancelled) return;

//         if (response?.data?.status) {
//           setCommunityData(response.data.data ?? null);
//           setError(null);
//         } else {
//           setCommunityData(null);
//           setError(
//             response?.data?.message || 'Failed to fetch community details',
//           );
//         }
//       } catch (err) {
//         if (axios.isCancel(err)) {
//           // request cancelled, do nothing
//         } else {
//           setError(err.message || 'Error fetching community');
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchCommunityDetails();

//     return () => {
//       cancelled = true;
//       source.cancel('Component unmounted — cancel fetch');
//     };
//   }, [community]);

//   const handleShare = async () => {
//   try {
//     const communityId = community?.id ?? communityData?.id;
//     const communityName = encodeURIComponent(community?.name ?? communityData?.name ?? 'Community');

//     if (!communityId) {
//       Alert.alert('Error', 'Community id not available to share.');
//       return;
//     }

//     // clickable https link (prefer this)
//     const httpsLink = `https://beingpetz.app/community/${communityId}?name=${communityName}`;
//     // custom scheme fallback
//     const deepLink = `beingpetz://community/${communityId}?name=${communityName}`;

//     const message = `Join ${decodeURIComponent(communityName)} on BeingPetz! 🎉

// Open in app (clickable): ${httpsLink}

// If you don't have the app, download here:
// https://play.google.com/store/apps/details?id=com.being_petz`;

//     await Share.share({
//       message,
//       title: `${decodeURIComponent(communityName)} - BeingPetz Community`,
//     });
//   } catch (error) {
//     console.error('Error sharing community link:', error);
//     Alert.alert('Error', 'Could not share link. Please try again.');
//   }
// };

//   // const handleShare = async () => {
//   //   try {
//   //     const playStoreWebLink =
//   //       'https://play.google.com/store/apps/details?id=com.being_petz&pcampaignid=web_share';
//   //     const iosAppStoreLink = 'https://apps.apple.com/app/idYOUR_APP_ID'; // update if available

//   //     // Deep link your app can handle. Include name as a query param so AllCommunitiesScreen can prefill search.
//   //     const communityId = community?.id ?? communityData?.id;
//   //     const communityName =
//   //       community?.name ?? communityData?.name ?? 'BeingPetz Community';

//   //     if (!communityId) {
//   //       Alert.alert('Error', 'Community id not available to share.');
//   //       return;
//   //     }

//   //     const deepLink = `beingpetz://community/${encodeURIComponent(communityName)}`;

//   //     const message = `Join ${communityName} on BeingPetz! 🎉\n\nOpen in app: ${deepLink}\nIf you don't have the app, download here:\n${
//   //       Platform.OS === 'ios' ? iosAppStoreLink : playStoreWebLink
//   //     }`;

//   //     // Try to detect whether the deep link can be opened on device (optional)
//   //     try {
//   //       const canOpen = await Linking.canOpenURL(deepLink);
//   //       // We won't force open it here, but we could. We still show the share sheet.
//   //     } catch (err) {
//   //       // ignore
//   //     }

//   //     await Share.share({
//   //       message,
//   //       title: `${communityName} - BeingPetz Community`,
//   //     });
//   //   } catch (error) {
//   //     console.error('Error sharing community link:', error);
//   //     Alert.alert('Error', 'Could not open share sheet. Please try again.');
//   //   }
//   // };

//   const profileUri =
//     communityData?.profile && typeof communityData.profile === 'string'
//       ? {uri: `https://argosmob.com/being-petz/public/${communityData.profile}`}
//       : placeholderImage;

//   return (
//     <LinearGradient
//       colors={['#8337B2', '#3B0060']}
//       start={{x: 0, y: 0}}
//       end={{x: 1, y: 0}}
//       style={styles.header}>
//       <View style={styles.headerContent}>
//         <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
//           <TouchableOpacity
//             onPress={onBack}
//             accessibilityLabel="Back"
//             accessibilityRole="button">
//             <Icon name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>

//           {loading ? (
//             <View style={styles.loadingWrapper}>
//               <ActivityIndicator size="small" color="#fff" />
//             </View>
//           ) : (
//             <>
//               <Image source={profileUri} style={styles.profileImage} />

//               <TouchableOpacity
//                 style={styles.headerText}
//                 onPress={() =>
//                   navigation.navigate('CommunityInfo', {community})
//                 }
//                 accessibilityRole="button"
//                 accessibilityLabel="Open community info">
//                 <Text style={styles.headerName} numberOfLines={1}>
//                   {community?.name ?? communityData?.name ?? 'Community'}
//                 </Text>

//                 <Text style={styles.membersCount}>
//                   {Array.isArray(communityData?.members)
//                     ? `${communityData.members.length} members`
//                     : '0 members'}
//                 </Text>

//                 <Text style={styles.headerStatus}>
//                   Tap here for contacts info
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>

//         <TouchableOpacity
//           onPress={handleShare}
//           accessibilityRole="button"
//           accessibilityLabel="Share community">
//           <Icon name="share-social-outline" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {error ? (
//         <View style={styles.errorRow}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : null}
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     paddingTop: 24,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   loadingWrapper: {
//     marginLeft: 12,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginHorizontal: 12,
//     borderWidth: 0.5,
//     borderColor: '#111',
//     backgroundColor: '#fff',
//   },
//   headerText: {
//     flex: 1,
//     minWidth: 0, // allow truncation
//   },
//   headerName: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   headerStatus: {
//     color: 'rgba(255,255,255,0.85)',
//     fontSize: 12,
//   },
//   membersCount: {
//     fontSize: 14,
//     color: '#fff',
//   },
//   errorRow: {
//     marginTop: 8,
//   },
//   errorText: {
//     color: '#ffdcdc',
//     fontSize: 12,
//   },
// });

// export default ChatHeader;

import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Share,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatHeader = ({community = {}, onBack}) => {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('user_data');
        if (jsonValue != null) {
          const parsedData = JSON.parse(jsonValue);
          setUserData(parsedData);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      }
    };

    getUserData();
  }, []);

  console.log('userData', userData);

  // placeholder image require — adjust path if your asset structure differs
  const placeholderImage = require('../../../Assests/Images/dog.png');

  useEffect(() => {
    let cancelled = false;
    const source = axios.CancelToken.source();

    const fetchCommunityDetails = async () => {
      if (!community?.id) {
        setLoading(false);
        setError('No community specified');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('community_id', community.id);

        const response = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/pet/community/details',
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
            cancelToken: source.token,
          },
        );

        if (cancelled) return;

        if (response?.data?.status) {
          setCommunityData(response.data.data ?? null);
          setError(null);
        } else {
          setCommunityData(null);
          setError(
            response?.data?.message || 'Failed to fetch community details',
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          // request cancelled, do nothing
        } else {
          setError(err.message || 'Error fetching community');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCommunityDetails();

    return () => {
      cancelled = true;
      source.cancel('Component unmounted — cancel fetch');
    };
  }, [community]);

  /**
   * Updated share wording as requested:
   *
   * Hey ! You’ve been invited !!
   *
   * Your friend <sender’s name> thinks you’d love our community on Beingpetz. We know you’re passionate about pet communities and want you to connect with other people like us.
   *
   * <community link>
   *
   * Join the community !!
   */
  const handleShare = async () => {
    try {
      const communityId = community?.id ?? communityData?.id;
      const rawCommunityName =
        community?.name ?? communityData?.name ?? 'Community';

      if (!communityId) {
        Alert.alert('Error', 'Community id not available to share.');
        return;
      }

      // Try to get a reasonable "sender" name from communityData or fallback
      // (adjust these keys based on your API's response structure)
      const senderName =
        `${userData?.first_name} ${userData?.last_name}` ||
        communityData?.creator?.first_name ||
        community?.shared_by_name;
      // 'Your friend';

      // Community link (https preferred)
      const urlSafeName = encodeURIComponent(rawCommunityName);
      const httpsLink = `https://beingpetz.app/community/${communityId}?name=${urlSafeName}`;
      const playStoreUrl =
        'https://play.google.com/store/apps/details?id=com.being_petz';

      // Compose the message exactly as requested
      const message = `Hey ! You’ve been invited !!

Your friend ${senderName} thinks you’d love our community on Beingpetz. We know you’re passionate about pet communities and want you to connect with other people like us.

${httpsLink}

 If you don't have the app, download here: ${playStoreUrl}
Join the community !!`;

      // Use the native share dialog
      await Share.share({
        message,
        title: `${rawCommunityName} - BeingPetz Community`,
      });
    } catch (error) {
      console.error('Error sharing community link:', error);
      Alert.alert('Error', 'Could not share link. Please try again.');
    }
  };

  const profileUri =
    communityData?.profile && typeof communityData.profile === 'string'
      ? {uri: `https://argosmob.com/being-petz/public/${communityData.profile}`}
      : placeholderImage;

  return (
    <LinearGradient
      colors={['#8337B2', '#3B0060']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.header}>
      <View style={styles.headerContent}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Back"
            accessibilityRole="button">
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <>
              <Image source={profileUri} style={styles.profileImage} />

              <TouchableOpacity
                style={styles.headerText}
                onPress={() =>
                  navigation.navigate('CommunityInfo', {community})
                }
                accessibilityRole="button"
                accessibilityLabel="Open community info">
                <Text style={styles.headerName} numberOfLines={1}>
                  {community?.name ?? communityData?.name ?? 'Community'}
                </Text>

                <Text style={styles.membersCount}>
                  {Array.isArray(communityData?.members)
                    ? `${communityData.members.length} members`
                    : '0 members'}
                </Text>

                <Text style={styles.headerStatus}>
                  Tap here for contacts info
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share community">
          <Icon name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingWrapper: {
    marginLeft: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 0.5,
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  headerText: {
    flex: 1,
    minWidth: 0, // allow truncation
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  membersCount: {
    fontSize: 14,
    color: '#fff',
  },
  errorRow: {
    marginTop: 8,
  },
  errorText: {
    color: '#ffdcdc',
    fontSize: 12,
  },
});

export default ChatHeader;

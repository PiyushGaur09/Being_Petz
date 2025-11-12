// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   Share,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation} from '@react-navigation/native';
// import CommonHeader from './Components/CommonHeader';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import BannerCarousel from './Components/BannerCarousel';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const BASE_URL = 'https://beingpetz.com/petz-info/public';
// const API_URL = `${BASE_URL}/api/v1/pet/all-adoptions`;
// const DELETE_URL = `${BASE_URL}/api/v1/pet/delete-adoption`;

// const AdoptPet = () => {
//   const navigation = useNavigation();
//   const [pets, setPets] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userId, setUserId] = useState(null);

//   // ✅ Fetch user_id from AsyncStorage
//   const getUserId = async () => {
//     try {
//       const stored = await AsyncStorage.getItem('user_data');
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         setUserId(parsed?.id);
//       }
//     } catch (error) {
//       console.error('Error fetching user id:', error);
//     }
//   };

//   const fetchPets = async () => {
//     try {
//       const response = await fetch(API_URL, {method: 'POST'});
//       const data = await response.json();
//       if (data.status) {
//         setPets(data.data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching pets:', error);
//     }
//   };

//   useEffect(() => {
//     getUserId();
//     fetchPets();
//   }, []);

//   // ✅ handle delete
//   const handleDelete = async listingId => {
//     try {
//       const formData = new FormData();
//       formData.append('user_id', userId?.toString());
//       formData.append('listing_id', listingId.toString());

//       const response = await axios.post(DELETE_URL, formData, {
//         headers: {'Content-Type': 'multipart/form-data'},
//       });

//       if (response.data?.status) {
//         Alert.alert('Success', 'Listing deleted successfully');
//         fetchPets(); // refresh list
//       } else {
//         Alert.alert('Error', response.data?.message || 'Failed to delete');
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       Alert.alert('Error', 'Something went wrong while deleting');
//     }
//   };

//   const handleShare = async item => {
//     try {
//       const imageUrl = item.featured_image
//         ? `${BASE_URL}/${item.featured_image}`
//         : '';

//       const message = `
// Adopt Pet Alert 🐾

// Breed: ${item.breed || 'Unknown Breed'}
// Description: ${item.description || 'No description provided'}
// Location: ${item.location || 'Unknown'}
// Age: ${
//         item.dob
//           ? `${Math.floor(
//               (new Date() - new Date(item.dob)) / (1000 * 60 * 60 * 24 * 30.44),
//             )} months`
//           : 'Unknown'
//       }

// ${imageUrl ? 'Photo: ' + imageUrl : ''}

// Adopt or share via our app: https://play.google.com/store/apps/details?id=com.being_petz&pcampaignid=web_share
//       `.trim();

//       await Share.share({message});
//     } catch (error) {
//       console.error('Error sharing pet info:', error);
//     }
//   };

//   const renderItem = ({item}) => {
//     const petDOB = item.dob ? new Date(item.dob) : null;
//     const age =
//       petDOB && !isNaN(petDOB)
//         ? `${Math.floor(
//             (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
//           )} months`
//         : 'Unknown age';

//     // console.log('jjjj', `${BASE_URL}/${item.featured_image}`);

//     return (
//       <View style={styles.card}>
//         {/* Pet image with delete icon */}
//         <View style={styles.imageWrapper}>
//           <Image
//             source={{
//               uri: item.featured_image
//                 ? `https://beingpetz.com/petz-info/public/${item.featured_image}`
//                 : 'https://demofree.sirv.com/nope-not-here.jpg',
//             }}
//             style={styles.petImage}
//           />

//           {/* ✅ Show delete only if current user created the listing */}
//           {item.user_id === userId && (
//             <TouchableOpacity
//               style={styles.deleteIcon}
//               onPress={() =>
//                 Alert.alert(
//                   'Confirm Delete',
//                   'Are you sure you want to delete this listing?',
//                   [
//                     {text: 'Cancel', style: 'cancel'},
//                     {
//                       text: 'Delete',
//                       style: 'destructive',
//                       onPress: () => handleDelete(item.id),
//                     },
//                   ],
//                 )
//               }>
//               <Icon name="trash-can" size={20} color="red" />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Pet info */}
//         <TouchableOpacity
//           style={{width: '100%'}}
//           onPress={() =>
//             navigation.navigate('PetAdoptionDetails', {pet: item})
//           }>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               width: '100%',
//             }}>
//             <View>
//               <Text style={styles.petName}>{item.pet_name}</Text>
//               <Text style={styles.petAge}>{age}</Text>
//             </View>
//             <View style={styles.iconContainer}>
//               <Icon
//                 name="send"
//                 size={20}
//                 color="#000"
//                 onPress={() => handleShare(item)}
//               />
//             </View>
//           </View>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <CommonHeader
//         onChatPress={() => navigation.navigate('Chats')}
//         onPeoplePress={() => setModalVisible(true)}
//       />

//       <View style={styles.headerRow}>
//         <Text style={styles.title}>Pets For Adoption</Text>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('GiveForAdoption')}
//           style={styles.adoptButton}>
//           <Text style={{color: '#fff'}}>Find a forever home</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={pets}
//         keyExtractor={item => item.id.toString()}
//         numColumns={2}
//         ListHeaderComponent={<BannerCarousel />}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//       />

//       <FriendRequestsModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </View>
//   );
// };

// export default AdoptPet;

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#FFF'},
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 10,
//     marginHorizontal: 16,
//   },
//   title: {fontSize: 20, fontWeight: '700', color: '#8337B2'},
//   adoptButton: {backgroundColor: '#8337B2', padding: 10, borderRadius: 8},
//   card: {
//     flex: 1,
//     margin: 5,
//     borderRadius: 15,
//     padding: 10,
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   imageWrapper: {
//     width: '100%',
//     position: 'relative',
//   },
//   petImage: {width: '100%', height: 220, borderRadius: 15},
//   deleteIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 5,
//     elevation: 3,
//   },
//   petName: {fontSize: 18, fontWeight: '700', marginTop: 5},
//   petAge: {fontSize: 14, color: '#555'},
//   iconContainer: {justifyContent: 'center', marginTop: 5},
// });

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import BannerCarousel from './Components/BannerCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://beingpetz.com/petz-info/public';
const API_URL = `${BASE_URL}/api/v1/pet/all-adoptions`;
const DELETE_URL = `${BASE_URL}/api/v1/pet/delete-adoption`;

const AdoptPet = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  const getUserId = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserId(parsed?.id);
      }
    } catch (error) {
      console.error('Error fetching user id:', error);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await fetch(API_URL, {method: 'POST'});
      const data = await response.json();
      if (data.status) {
        setPets(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  useEffect(() => {
    getUserId();
    fetchPets();
  }, []);

  const handleDelete = async listingId => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId?.toString());
      formData.append('listing_id', listingId.toString());

      const response = await axios.post(DELETE_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data?.status) {
        Alert.alert('Success', 'Listing deleted successfully');
        fetchPets();
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Something went wrong while deleting');
    }
  };

  const handleShare = async item => {
    try {
      const imageUrl = item.featured_image
        ? `${BASE_URL}/${item.featured_image}`
        : '';

      const message = `
Adopt Pet Alert 🐾

Breed: ${item.breed || 'Unknown Breed'}
Description: ${item.description || 'No description provided'}
Location: ${item.location || 'Unknown'}
Age: ${
        item.dob
          ? `${Math.floor(
              (new Date() - new Date(item.dob)) / (1000 * 60 * 60 * 24 * 30.44),
            )} months`
          : 'Unknown'
      }

${imageUrl ? 'Photo: ' + imageUrl : ''}

Adopt or share via our app: https://play.google.com/store/apps/details?id=com.being_petz&pcampaignid=web_share
      `.trim();

      await Share.share({message});
    } catch (error) {
      console.error('Error sharing pet info:', error);
    }
  };

  const renderItem = ({item}) => {
    const petDOB = item.dob ? new Date(item.dob) : null;
    const age =
      petDOB && !isNaN(petDOB)
        ? `${Math.floor(
            (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
          )} months`
        : 'Unknown age';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PetAdoptionDetails', {pet: item})}>
        {/* Pet image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: item.featured_image
                ? `${BASE_URL}/${item.featured_image}`
                : 'https://demofree.sirv.com/nope-not-here.jpg',
            }}
            style={styles.petImage}
          />

          {/* Delete icon */}
          {item.user_id === userId && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() =>
                Alert.alert(
                  'Confirm Delete',
                  'Are you sure you want to delete this listing?',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => handleDelete(item.id),
                    },
                  ],
                )
              }>
              <Icon name="trash-can" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {/* Pet info */}
        <View style={styles.infoWrapper}>
          <Text style={styles.petName}>{item.pet_name}</Text>
          <Text style={styles.petAge}>{age}</Text>

          {/* Share icon */}
          <TouchableOpacity
            style={styles.shareIcon}
            onPress={() => handleShare(item)}>
            <Icon name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <View style={styles.headerRow}>
        <Text style={styles.title}>Pets For Adoption</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('GiveForAdoption')}
          style={styles.adoptButton}>
          <Text style={{color: '#fff'}}>Find a forever home</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pets}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={<BannerCarousel />}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default AdoptPet;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  title: {fontSize: 20, fontWeight: '700', color: '#8337B2'},
  adoptButton: {backgroundColor: '#8337B2', padding: 10, borderRadius: 8},
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    position: 'relative',
  },
  petImage: {width: '100%', height: 220, borderRadius: 15},
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  infoWrapper: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {fontSize: 16, fontWeight: '700'},
  petAge: {fontSize: 14, color: '#555'},
  shareIcon: {padding: 5},
});

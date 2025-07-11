// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   FlatList,
//   TouchableOpacity,
//   Share,
// } from 'react-native';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation} from '@react-navigation/native';
// import Header from './Components/Header';
// import CommonHeader from './Components/CommonHeader';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import BannerCarousel from './Components/BannerCarousel';

// const BASE_URL = 'https://argosmob.uk/being-petz/public';
// const API_URL = `${BASE_URL}/api/v1/pet/lost-found/all`;

// const AdoptPet = () => {
//   const navigation = useNavigation();
//   const [allPets, setAllPets] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'

//   useEffect(() => {
//     const fetchLostPets = async () => {
//       try {
//         const response = await axios.get(API_URL);
//         setAllPets(response.data?.data?.data || []);
//       } catch (error) {
//         console.error('Error fetching lost pets:', error);
//       }
//     };

//     fetchLostPets();
//   }, []);

//   // Filter pets based on active tab
//   const filteredPets = allPets.filter(pet => pet.report_type === activeTab);

//   const renderItem = ({item}) => {
//     const imageUrl = item.images?.[0]
//       ? `${BASE_URL}/${item.images[0]}`
//       : 'https://via.placeholder.com/150';

//     const petDOB = item.pet_dob ? new Date(item.pet_dob) : null;
//     const age =
//       petDOB && !isNaN(petDOB)
//         ? `${Math.floor(
//             (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
//           )} months`
//         : 'Unknown age';

//     const handleShare = async item => {
//       try {
//         const imageUrl = item.images?.[0]
//           ? `${BASE_URL}/${item.images[0]}`
//           : '';

//         const message = `
// ${item.report_type === 'lost' ? 'Lost' : 'Found'} Pet Alert 🐾

// Breed: ${item.breed || 'Unknown Breed'}
// Description: ${item.description || 'No description provided'}
// Location: ${item.location || 'Unknown'}
// Date ${item.report_type === 'lost' ? 'Lost' : 'Found'}: ${
//           item.occurred_at?.split('T')[0] || 'Unknown'
//         }
// Age: ${item.pet_dob ? age : 'Unknown'}

// ${imageUrl ? 'Photo: ' + imageUrl : ''}

// Please help ${
//           item.report_type === 'lost'
//             ? 'reunite this pet with its owner'
//             : 'identify this found pet'
//         }! 🐶🐱
//     `;

//         await Share.share({
//           message,
//         });
//       } catch (error) {
//         console.error('Error sharing pet info:', error);
//       }
//     };

//     return (
//       <TouchableOpacity
//         style={styles.card}
//         onPress={() => {
//           navigation.navigate('PetDetails', {pet: item});
//         }}>
//         <Image source={{uri: imageUrl}} style={styles.petImage} />
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             width: '100%',
//           }}>
//           <View>
//             <Text style={styles.petName}>{item.breed || 'Unknown Breed'}</Text>
//             <Text style={styles.petAge}>{age}</Text>
//             <Text style={styles.petStatus}>
//               {item.report_type === 'lost' ? 'Lost' : 'Found'} on{' '}
//               {item.occurred_at?.split('T')[0] || 'Unknown date'}
//             </Text>
//           </View>
//           <View style={styles.iconContainer}>
//             <Icon
//               name="send"
//               size={20}
//               color="#000"
//               onPress={() => handleShare(item)}
//             />
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <CommonHeader
//         onChatPress={() => navigation.navigate('Chats')}
//         onPeoplePress={() => setModalVisible(true)}
//       />

//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginVertical: 10,
//           marginHorizontal: 16,
//         }}>
//         <Text style={{fontSize: 20, fontWeight: '700',color:'#8337B2'}}>
//           {activeTab === 'lost' ? 'Lost pets' : 'Found pets'}
//         </Text>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate('AddLostAndFound', {
//               onRefresh: () => {
//                 // Re-fetch data or force update here
//                 fetchLostPets();
//               },
//             })
//           }
//           style={{backgroundColor: '#8337B2', borderRadius: 8}}>
//           <Text
//             style={{paddingVertical: 6, paddingHorizontal: 12, color: '#fff'}}>
//             Report and Reunite
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'lost' && styles.activeTabButton,
//           ]}
//           onPress={() => setActiveTab('lost')}>
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'lost' && styles.activeTabText,
//             ]}>
//             Lost Pets
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.tabButton,
//             activeTab === 'found' && styles.activeTabButton,
//           ]}
//           onPress={() => setActiveTab('found')}>
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'found' && styles.activeTabText,
//             ]}>
//             Found Pets
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <View style={{flex: 1}}>
//         <FlatList
//           showsVerticalScrollIndicator={false}
//           data={filteredPets}
//           keyExtractor={item => item.id.toString()}
//           numColumns={2}
//           ListHeaderComponent={
//             <BannerCarousel/>
//           }
//           renderItem={renderItem}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No {activeTab} pets found. Be the first to report one!
//             </Text>
//           }
//         />
//       </View>
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
//   header: {flexDirection: 'row', alignItems: 'center', padding: 10},
//   profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
//   name: {fontSize: 18, fontWeight: 'bold'},
//   breed: {fontSize: 14, color: '#555'},
//   age: {fontSize: 12, color: '#777'},
//   notificationIcon: {marginLeft: 'auto'},
//   imageContainer: {
//     flex: 1,
//     margin: 5,
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   image: {
//     width: '100%',
//     height: 150,
//     borderRadius: 15,
//   },
//   card: {
//     flex: 1,
//     margin: 5,
//     borderRadius: 15,
//     padding: 10,
//     alignItems: 'center',
//   },
//   petImage: {width: '100%', height: 220, borderRadius: 15},
//   petName: {fontSize: 18, fontWeight: '700', marginTop: 5},
//   petAge: {fontSize: 14, color: '#555'},
//   petStatus: {fontSize: 12, color: '#777', marginTop: 2},
//   iconContainer: {
//     justifyContent: 'center',
//     marginTop: 5,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginHorizontal: 16,
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   activeTabButton: {
//     borderBottomColor: '#8337B2',
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#555',
//   },
//   activeTabText: {
//     color: '#8337B2',
//     fontWeight: 'bold',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: '#777',
//     paddingHorizontal: 20,
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import BannerCarousel from './Components/BannerCarousel';

const BASE_URL = 'https://argosmob.uk/being-petz/public';
const API_URL = `${BASE_URL}/api/v1/pet/lost-found/all`;

const AdoptPet = () => {
  const navigation = useNavigation();
  const [allPets, setAllPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'

  const fetchLostPets = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllPets(response.data?.data?.data || []);
    } catch (error) {
      console.error('Error fetching lost pets:', error);
    }
  };

  useEffect(() => {
    fetchLostPets();
  }, []);

  // Filter pets based on active tab
  const filteredPets = allPets.filter(pet => pet.report_type === activeTab);

  const renderItem = ({item}) => {
    const imageUrl = item.images?.[0]
      ? `${BASE_URL}/${item.images[0]}`
      : 'https://via.placeholder.com/150';

    const petDOB = item.pet_dob ? new Date(item.pet_dob) : null;
    const age =
      petDOB && !isNaN(petDOB)
        ? `${Math.floor(
            (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
          )} months`
        : 'Unknown age';

    const handleShare = async item => {
      try {
        const imageUrl = item.images?.[0]
          ? `${BASE_URL}/${item.images[0]}`
          : '';

        const message = `
${item.report_type === 'lost' ? 'Lost' : 'Found'} Pet Alert 🐾

Breed: ${item.breed || 'Unknown Breed'}
Description: ${item.description || 'No description provided'}
Location: ${item.location || 'Unknown'}
Date ${item.report_type === 'lost' ? 'Lost' : 'Found'}: ${
          item.occurred_at?.split('T')[0] || 'Unknown'
        }
Age: ${item.pet_dob ? age : 'Unknown'}

${imageUrl ? 'Photo: ' + imageUrl : ''}

Please help ${
          item.report_type === 'lost'
            ? 'reunite this pet with its owner'
            : 'identify this found pet'
        }! 🐶🐱
    `;

        await Share.share({
          message,
        });
      } catch (error) {
        console.error('Error sharing pet info:', error);
      }
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('PetDetails', {pet: item});
        }}>
        <Image source={{uri: imageUrl}} style={styles.petImage} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <View>
            <Text style={styles.petName}>{item.breed || 'Unknown Breed'}</Text>
            <Text style={styles.petAge}>{age}</Text>
            <Text style={styles.petStatus}>
              {item.report_type === 'lost' ? 'Lost' : 'Found'} on{' '}
              {item.occurred_at?.split('T')[0] || 'Unknown date'}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Icon
              name="send"
              size={20}
              color="#000"
              onPress={() => handleShare(item)}
            />
          </View>
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
          marginHorizontal: 16,
        }}>
        <View>
          <Text style={{fontSize: 20, fontWeight: '700', color: '#8337B2'}}>
            {activeTab === 'lost' ? 'Lost pets' : 'Found pets'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddLostAndFound', {
              onRefresh: fetchLostPets,
            })
          }
          style={{backgroundColor: '#8337B2', borderRadius: 8}}>
          <Text
            style={{paddingVertical: 6, paddingHorizontal: 12, color: '#fff'}}>
            Report and Reunite
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'lost' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('lost')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'lost' && styles.activeTabText,
            ]}>
            Lost Pets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'found' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('found')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'found' && styles.activeTabText,
            ]}>
            Found Pets
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredPets}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          ListHeaderComponent={<BannerCarousel />}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No {activeTab} pets found. Be the first to report one!
            </Text>
          }
        />
      </View>
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
  header: {flexDirection: 'row', alignItems: 'center', padding: 10},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  name: {fontSize: 18, fontWeight: 'bold'},
  breed: {fontSize: 14, color: '#555'},
  age: {fontSize: 12, color: '#777'},
  notificationIcon: {marginLeft: 'auto'},
  imageContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 15,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
  petImage: {width: '100%', height: 220, borderRadius: 15},
  petName: {fontSize: 18, fontWeight: '700', marginTop: 5},
  petAge: {fontSize: 14, color: '#555'},
  petStatus: {fontSize: 12, color: '#777', marginTop: 2},
  iconContainer: {
    justifyContent: 'center',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
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
  activeTabButton: {
    borderBottomColor: '#8337B2',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#8337B2',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
    paddingHorizontal: 20,
  },
});

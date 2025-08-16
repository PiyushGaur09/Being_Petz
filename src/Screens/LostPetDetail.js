// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Header from './Components/Header';
// import {useNavigation} from '@react-navigation/native';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import CommonHeader from './Components/CommonHeader';

// const PetsDetail = ({route}) => {
//   console.log('pet', route.params?.pet);
//   const pet = route?.params?.pet || {};
//   const user = pet?.user || {};
//   const BASE_URL = 'https://argosmob.com/being-petz/public';

//   const petImage = pet?.images?.[0]
//     ? {
//         uri: `${BASE_URL}/${pet.images[0]}`,
//       }
//     : null;

//   const petImage2 = `${BASE_URL}${pet?.featured_image}`;

//   const petName = pet?.id ? pet?.pet_name : 'Not Available';
//   const breed = pet?.breed || 'Not Available';
//   const gender = pet?.pet_gender || 'Not Available';
//   const location = pet?.location || 'Not Available';
//   const contact = pet?.phone || 'Not Available';
//   const aboutPet = pet?.about_pet || 'Not Available';

//   const age =  pet?.pet_dob ? calculateAgeInMonths(pet.pet_dob) :'Not Available';

//  function calculateAgeInMonths(dob) {
//   const birthDate = new Date(dob);
//   const today = new Date();

//   let years = today.getFullYear() - birthDate.getFullYear();
//   let months = today.getMonth() - birthDate.getMonth();
//   let days = today.getDate() - birthDate.getDate();

//   // If days are negative, adjust the month count
//   if (days < 0) {
//     months--;
//   }

//   // Total months = years * 12 + months
//   let totalMonths = years * 12 + months;

//   // In case the birth date is later in the current month/year, adjust
//   if (totalMonths < 0) {
//     totalMonths = 0;
//   }

//   return `${totalMonths} months`;
// }

//   const handleDialPress = phoneNumber => {
//     if (!phoneNumber || phoneNumber === 'Not Available') {
//       Alert.alert('Invalid Phone Number');
//       return;
//     }

//     const url = `tel:${phoneNumber}`;
//     Linking.openURL(url).catch(err => {
//       console.error('Error opening dialer:', err);
//     });
//   };

//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <CommonHeader
//         onChatPress={() => navigation.navigate('Chats')}
//         onPeoplePress={() => setModalVisible(true)}
//       />

//       {/* Pet Image */}
//       {petImage ? (
//         <Image source={petImage} style={styles.petImage} />
//       ) : (
//         <View style={styles.placeholderImage}>
//           <Text style={styles.placeholderText}>No Image Available</Text>
//         </View>
//       )}

//       {/* Pet Name */}
//       <Text style={styles.petName}>{petName}</Text>

//       {/* Pet Tags (Breed, Gender, Location, Contact) */}
//       <View style={styles.tagsContainer}>
//         <DetailTag icon="paw" label="Breed" value={breed} />
//         <DetailTag icon="gender-male" label="Gender" value={gender} />
//         <DetailTag icon="map-marker" label="Location" value={location} />
//         <DetailTag icon="phone" label="Contact" value={contact} />
//       </View>

//       {/* Pet Age */}
//       <View style={styles.tagsContainer}>
//         <DetailTag icon="calendar" label="Age" value={age} />
//       </View>

//       {/* About Pet */}
//       <Text style={styles.aboutTitle}>About {petName}</Text>
//       <Text style={styles.aboutText}>{aboutPet}</Text>

//       {/* Call Button */}
//       <TouchableOpacity
//         onPress={() => {
//           handleDialPress(contact);
//         }}
//         style={styles.callButton}>
//         <Text style={styles.callButtonText}>Call Now</Text>
//       </TouchableOpacity>

//       <FriendRequestsModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </ScrollView>
//   );
// };

// const DetailTag = ({icon, label, value}) => (
//   <View style={styles.tag}>
//     <View style={{flexDirection: 'row'}}>
//       <Icon name={icon} size={18} color="#000" />
//       <Text style={styles.tagText}>{label}</Text>
//     </View>
//     <Text style={styles.tagText}>{value}</Text>
//   </View>
// );

// export default PetsDetail;

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#FFF'},
//   petImage: {
//     width: '90%',
//     height: 250,
//     borderRadius: 15,
//     alignSelf: 'center',
//     marginTop: 10,
//     resizeMode: 'cover'
//   },
//   placeholderImage: {
//     width: '90%',
//     height: 250,
//     borderRadius: 15,
//     backgroundColor: '#ddd',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 10,
//     padding: 16,
//     alignSelf: 'center',
//   },
//   placeholderText: {
//     fontSize: 16,
//     color: '#999',
//   },
//   petName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 10,
//   },
//   tagsContainer: {
//     justifyContent: 'space-between',
//     margin: 16,
//     padding: 16,
//     borderRadius: 24,
//     backgroundColor: '#F1E9F7',
//   },
//   tag: {
//     // flex: 1,
//     alignItems: 'center',
//     // backgroundColor: '#F1E9F7',
//     padding: 10,
//     borderRadius: 10,
//     marginHorizontal: 5,
//     textAlign: 'center',
//   },
//   tagText: {marginLeft: 5, fontSize: 16, color: '#2F3236'},
//   aboutTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginTop: 10,
//     marginHorizontal: 20,
//     color: '#2F3236',
//   },
//   aboutText: {
//     fontSize: 16,
//     marginTop: 5,
//     lineHeight: 20,
//     color: '#4B4B4B',
//     marginHorizontal: 20,
//   },
//   callButton: {
//     backgroundColor: '#8337B2',
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: 20,
//   },
//   callButtonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
// });

// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useNavigation} from '@react-navigation/native';
// import FriendRequestsModal from './Components/FriendRequestsModal';
// import CommonHeader from './Components/CommonHeader';

// const PetsDetail = ({route}) => {
//   const pet = route?.params?.pet || {};
//   const user = pet?.user || {};
//   const BASE_URL = 'https://argosmob.com/being-petz/public';
//   const [modalVisible, setModalVisible] = useState(false);
//   const navigation = useNavigation();

//   // Determine if this is a lost or found pet
//   const isLostPet = pet?.report_type === 'lost';

//   // Pet image
//   const petImage = pet?.images?.[0]
//     ? {uri: `${BASE_URL}/${pet.images[0]}`}
//     : require('../Assests/Images/placeHolderImages.png'); // Add your placeholder image

//   // Pet details
//   const petName = pet?.pet_name || 'Not Available';
//   const breed = pet?.breed ? pet.breed.replace(/_/g, ' ') : 'Not Available';
//   const gender = pet?.pet_gender || 'Not Available';
//   const location = pet?.location || 'Not Available';
//   const contact = pet?.phone || 'Not Available';
//   const aboutPet = pet?.about_pet || 'No description available';
//   const occurredAt = pet?.occurred_at ? new Date(pet.occurred_at).toLocaleDateString() : 'Not Available';

//   // Calculate age
//   const age = pet?.pet_dob ? calculateAgeInMonths(pet.pet_dob) : 'Age not available';

//   function calculateAgeInMonths(dob) {
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
//     months += today.getMonth() - birthDate.getMonth();
//     return `${months} months`;
//   }

//   const handleCallPress = () => {
//     if (!contact || contact === 'Not Available') {
//       Alert.alert('No contact number available');
//       return;
//     }
//     Linking.openURL(`tel:${contact}`).catch(err =>
//       console.error('Error opening dialer:', err)
//     );
//   };

//   // Health indicators (for lost pets)
//   const healthIndicators = [
//     {
//       id: 1,
//       name: 'Dewormed',
//       status: pet?.is_healthy, // Assuming is_healthy covers deworming
//       icon: 'worm'
//     },
//     {
//       id: 2,
//       name: 'Neutered',
//       status: false, // Not in API - default to false
//       icon: 'scissors-cutting'
//     },
//     {
//       id: 3,
//       name: 'Vaccinated',
//       status: pet?.vaccination_done,
//       icon: 'needle'
//     }
//   ];

//   return (
//     <View style={styles.container}>
//       <CommonHeader
//         onChatPress={() => navigation.navigate('Chats')}
//         onPeoplePress={() => setModalVisible(true)}
//       />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header with Lost/Found label */}
//         <View style={styles.headerContainer}>
//           <Text style={styles.headerText}>
//             {isLostPet ? 'Lost Pet' : 'Pet Found'}
//           </Text>
//           {petName !== 'Not Available' && (
//             <Text style={styles.petName}>{petName}</Text>
//           )}
//         </View>

//         {/* Pet Image */}
//         <Image source={petImage} style={styles.petImage} resizeMode="cover" />

//         {/* Basic Info */}
//         <View style={styles.infoContainer}>
//           <Text style={styles.infoText}>
//             {breed}, {gender.toLowerCase()}, {age}
//           </Text>
//           <Text style={styles.infoText}>{location}</Text>

//           {/* Health indicators for lost pets */}
//           {isLostPet && (
//             <View style={styles.healthContainer}>
//               {healthIndicators.map(indicator => (
//                 <View key={indicator.id} style={styles.healthItem}>
//                   <Icon
//                     name={indicator.icon}
//                     size={16}
//                     color={indicator.status ? '#4CAF50' : '#F44336'}
//                   />
//                   <Text style={styles.healthText}>{indicator.name}</Text>
//                   {indicator.status ? (
//                     <Icon name="check" size={16} color="#4CAF50" />
//                   ) : (
//                     <Icon name="close" size={16} color="#F44336" />
//                   )}
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Identification Section */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionTitle}>
//             {isLostPet ? 'How to identify your pet?' : 'Any identification?'}
//           </Text>
//           <Text style={styles.sectionText}>{aboutPet}</Text>
//         </View>

//         {/* Location/Contact Section */}
//         <View style={styles.sectionContainer}>
//           {isLostPet ? (
//             <>
//               <Text style={styles.sectionTitle}>Location last seen</Text>
//               <Text style={styles.sectionText}>{location}</Text>
//               <Text style={[styles.sectionTitle, {marginTop: 12}]}>Missing since</Text>
//               <Text style={styles.sectionText}>{occurredAt}</Text>
//             </>
//           ) : (
//             <>
//               <Text style={styles.sectionTitle}>Contact person</Text>
//               <Text style={styles.sectionText}>
//                 {user?.first_name} {user?.last_name}
//               </Text>
//               <Text style={[styles.sectionTitle, {marginTop: 12}]}>How to contact?</Text>
//               <Text style={styles.sectionText}>Call or WhatsApp</Text>
//               <Text style={[styles.sectionTitle, {marginTop: 12}]}>Contact number</Text>
//               <Text style={styles.sectionText}>{contact}</Text>
//             </>
//           )}
//         </View>

//         {/* Call Button */}
//         <TouchableOpacity
//           style={styles.callButton}
//           onPress={handleCallPress}
//         >
//           <Icon name="phone" size={24} color="#FFF" />
//           <Text style={styles.callButtonText}>Call</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       <FriendRequestsModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//   },
//   headerContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 8,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   petName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 4,
//   },
//   petImage: {
//     width: '100%',
//     height: 300,
//   },
//   infoContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   infoText: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#333',
//   },
//   healthContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     paddingHorizontal: 20,
//   },
//   healthItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   healthText: {
//     fontSize: 14,
//     marginHorizontal: 6,
//     color: '#333',
//   },
//   sectionContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEE',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   sectionText: {
//     fontSize: 16,
//     color: '#555',
//     lineHeight: 24,
//   },
//   callButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#8337B2',
//     paddingVertical: 16,
//     borderRadius: 8,
//     margin: 20,
//   },
//   callButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
// });

// export default PetsDetail;

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const PetDetails = ({route}) => {
  const pet = route?.params?.pet || {};
  const user = pet?.user || {};
  const BASE_URL = 'https://argosmob.com/being-petz/public';
  const [modalVisible, setModalVisible] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  console.log('PEt', pet);

  // Determine if this is a lost, found, or adoption pet
  const isLostPet = pet?.report_type === 'lost';
  const isFoundPet = pet?.report_type === 'found';
  const isAdoptionPet = !isLostPet && !isFoundPet;

  // Pet image
  const petImage =
    pet?.featured_image || pet?.images?.[0]
      ? {uri: `${BASE_URL}/${pet.featured_image || pet.images[0]}`}
      : require('../Assests/Images/placeHolderImages.png');

  // Pet details
  const petName = pet?.pet_name || 'Not Available';
  const breed = pet?.breed ? pet.breed.replace(/_/g, ' ') : 'Not Available';
  const gender = pet?.gender || pet?.pet_gender || 'Not Available';
  const location = pet?.location || 'Not Available';
  const contact = pet?.contact_phone || pet?.phone || 'Not Available';
  const aboutPet = pet?.about_pet || 'No description available';
  const occurredAt = pet?.occurred_at
    ? new Date(pet.occurred_at).toLocaleDateString()
    : 'Not Available';
  const userName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : 'Not Available';

  // Calculate age
  const age =
    pet?.dob || pet?.pet_dob
      ? calculateAge(pet.dob || pet.pet_dob)
      : 'Age not available';

  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();

    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ${years === 1 ? 'year' : 'years'}${
        remainingMonths > 0
          ? ` ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
          : ''
      }`;
    }
  }

  const handleCallPress = () => {
    if (!contact || contact === 'Not Available') {
      Alert.alert('No contact number available');
      return;
    }
    Linking.openURL(`tel:${contact}`).catch(err =>
      console.error('Error opening dialer:', err),
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${petName}, a ${breed} ${
          isLostPet ? 'lost' : isFoundPet ? 'found' : 'available for adoption'
        }!`,
        url: pet?.featured_image ? `${BASE_URL}/${pet.featured_image}` : '',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Health indicators
  const healthIndicators = [
    {
      id: 1,
      name: 'Dewormed',
      status: pet?.isDewormed,
      icon: 'worm',
      color: '#fff',
      backgroundColor: '#c486eb',
    },
    {
      id: 2,
      name: 'Neutered',
      status: pet?.isHealthy || false,
      icon: 'scissors-cutting',
      color: '#fff',
      backgroundColor: '#03adfc',
    },
    {
      id: 3,
      name: 'Vaccinated',
      status: pet?.isVaccinated,
      icon: 'needle',
      color: '#fff',
      backgroundColor: '#fc9403',
    },
  ];

  // Helper functions
  const capitalizeFirstLetter = str => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getGenderIcon = gender => {
    const lowerGender = gender?.toLowerCase();
    if (lowerGender === 'male') return 'gender-male';
    if (lowerGender === 'female') return 'gender-female';
    return 'dog';
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}>
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image source={petImage} style={styles.petImage} resizeMode='stretch' />

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}>
            <Icon name="share-variant" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Status Badge */}
          {(isLostPet || isFoundPet) && (
            <View
              style={[
                styles.statusBadge,
                isLostPet ? styles.lostBadge : styles.foundBadge,
              ]}>
              <Text style={styles.statusBadgeText}>
                {isLostPet ? 'Lost' : 'Found'}
              </Text>
            </View>
          )}
        </View>

        {/* Pet Info Section */}
        <View style={styles.contentContainer}>
          {/* Pet Name and Basic Info */}
          <View style={styles.headerSection}>
            {/* <Text style={styles.petName}>{petName}</Text> */}

            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon
                    name={getGenderIcon(gender)}
                    size={18}
                    color={'#8337B2'}
                  />
                  <Text style={styles.metaText}>
                    {capitalizeFirstLetter(gender)}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Icon name={'paw'} size={18} color={'#8337B2'} />
                  <Text style={styles.metaText}>{age}</Text>
                </View>
              </View>

              {breed && (
                <View style={styles.metaItem}>
                  <Icon name={'dog'} size={18} color={'#8337B2'} />
                  <Text style={styles.metaText}>
                    {capitalizeFirstLetter(breed)}
                  </Text>
                </View>
              )}

              <View style={styles.metaItem}>
                <Icon name="map-marker" size={18} color="#8337B2" />
                <Text style={styles.metaText}>
                  {capitalizeFirstLetter(location)}
                </Text>
              </View>
            </View>
          </View>

          {/* Health Indicators */}
          {(isAdoptionPet || isLostPet) && (
            <View style={styles.healthContainer}>
              <Text style={styles.sectionTitle}>Health Status</Text>
              <View style={styles.healthGrid}>
                {healthIndicators.map(indicator => (
                  <View
                    key={indicator.id}
                    style={[
                      styles.healthItem,
                      {backgroundColor: indicator?.backgroundColor},
                    ]}>
                    <View style={styles.healthIconContainer}>
                      <Icon name={indicator.icon} size={28} color={'#fff'} />
                    </View>
                    <Text style={styles.healthLabel}>{indicator.name}</Text>
                    <Text style={styles.healthStatus}>
                      {indicator.status ? (
                        <Icon
                          name={'check-circle-outline'}
                          size={24}
                          color={'#fff'}
                        />
                      ) : (
                        <Icon
                          name={'close-circle-outline'}
                          size={24}
                          color={'#fff'}
                        />
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* About Section */}
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>
              {isLostPet
                ? 'How to identify your pet?'
                : isFoundPet
                ? 'Any identification?'
                : `About ${petName}`}
            </Text>
            <Text style={styles.aboutText}>{aboutPet}</Text>
          </View>

          {/* Additional Info for Lost/Found Pets */}
          {(isLostPet || isFoundPet) && (
            <View style={styles.additionalInfoContainer}>
              {isLostPet ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Missing since:</Text>
                    <Text style={styles.infoValue}>{occurredAt}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Contact person:</Text>
                    <Text style={styles.infoValue}>{userName}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Footer with Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCallPress}>
          <Icon name="phone" size={20} color="#FFF" />
          <Text style={[styles.actionButtonText, {color: '#FFF'}]}>
            {isLostPet ? 'Report Sighting' : 'Contact Reporter'}
          </Text>
        </TouchableOpacity>
      </View>

      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    height: width * 0.8,
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
  },
  petImage: {
    width: '90%',
    height: '100%',
    borderRadius: 20,
  },
  shareButton: {
    position: 'absolute',
    top: 20,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    left: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  lostBadge: {
    backgroundColor: '#FF5252',
  },
  foundBadge: {
    backgroundColor: '#4CAF50',
  },
  statusBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 24,
  },
  petName: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  metaContainer: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 16,
    color: '#111',
  },
  healthContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    // marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  healthItem: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 16,
  },
  healthLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 8,
  },
  healthIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutContainer: {
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
  },
  additionalInfoContainer: {
    marginBottom: 24,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#8337B2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PetDetails;

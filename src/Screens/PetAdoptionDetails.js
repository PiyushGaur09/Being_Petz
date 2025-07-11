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

const {width} = Dimensions.get('window');

const PetAdoptionDetails = ({route = {params: {}}}) => {
  const pet = route?.params?.pet || {};
  const user = pet?.user || {};
  const BASE_URL = 'https://argosmob.uk/being-petz/public';
  const [modalVisible, setModalVisible] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  // Pet details
  const petImage = pet?.featured_image
    ? {uri: `${BASE_URL}/${pet.featured_image}`}
    : require('../Assests/Images/placeHolderImages.png');

  const petName = pet?.pet_name || 'Not Available';
  const breed = pet?.breed ? pet.breed.replace(/_/g, ' ') : 'Not Available';
  const gender = pet?.gender || 'Not Available';
  const location = pet?.location || 'Not Available';
  const aboutPet = pet?.about_pet || 'No description available';
  const contact = pet?.contact_phone || 'Not Available';

  // Calculate age
  const age = pet?.dob ? calculateAge(pet.dob) : 'Age not available';

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
        message: `Check out ${petName}, a ${breed} available for adoption!`,
        url: pet?.featured_image ? `${BASE_URL}/${pet.featured_image}` : '',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Health indicators - updated to match screenshot layout
  const healthIndicators = [
    {
      id: 1,
      name: 'Dewormed',
      status: pet?.is_healthy,
      icon: 'abjad-hebrew',
      color: '#fff',
      backgroundColor: '#c486eb',
    },
    {
      id: 2,
      name: 'Neutered',
      status: pet?.is_neutered || false, // Added neutered status
      icon: 'scissors-cutting',
      color: '#fff',
      backgroundColor: '#03adfc',
    },
    {
      id: 3,
      name: 'Vaccinated',
      status: pet?.vaccination_done,
      icon: 'needle',
      color: '#fff',
      backgroundColor: '#fc9403',
    },
  ];

  // Animated header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const capitalizeFirstLetter = str => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
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
          <Image source={petImage} style={styles.petImage} resizeMode="cover" />

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}>
            <Icon name="share-variant" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Pet Info Section */}
        <View style={styles.contentContainer}>
          {/* Pet Name and Basic Info */}
          <View style={styles.headerSection}>
            <Text style={styles.petName}>{petName}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  gap: 5,
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {gender.toLowerCase() === 'male' ? (
                      <Icon name={'gender-male'} size={18} color={'#8337B2'} />
                    ) : gender.toLowerCase() === 'female' ? (
                      <Icon
                        name={'gender-female'}
                        size={18}
                        color={'#8337B2'}
                      />
                    ) : (
                      <Icon name={'dog'} size={18} color={'#8337B2'} />
                    )}
                    <Text style={styles.petMetaText}>
                      {capitalizeFirstLetter(gender)}
                    </Text>
                  </View>
                  {breed && (
                    <View style={styles.petMeta}>
                      <Text
                        style={
                          styles.petMetaText
                        }>{`Breed - ${capitalizeFirstLetter(breed)}`}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}>
              <Icon name={'paw'} size={18} color={'#8337B2'} />
              <Text style={styles.petMetaText}>{age}</Text>
            </View>

            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={18} color="#8337B2" />
              <Text style={styles.locationText}>
                {capitalizeFirstLetter(location)}
              </Text>
            </View>
          </View>

          {/* Health Indicators - Updated to match screenshot */}
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

                  <Text
                    style={[
                      styles.healthStatus,
                      indicator.status ? styles.statusYes : styles.statusNo,
                    ]}>
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

          {/* About Section */}
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>About {petName}</Text>
            <Text style={styles.aboutText}>{aboutPet}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCallPress}>
          <Icon name="phone" size={20} color="#FFF" />
          <Text style={[styles.actionButtonText, {color: '#FFF'}]}>
            Call Now
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
    marginBottom: 4,
    textAlign: 'center',
  },
  petMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 8,
    justifyContent: 'center',
  },
  petMetaText: {
    fontSize: 16,
    color: '#111',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    // justifyContent: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#8337B2',
    marginLeft: 4,
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
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    // marginBottom: 2,
    textAlign: 'center',
  },
  healthIconContainer: {
    // width: 50,
    // height: 50,
    // borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 2,
    // backgroundColor: '#F5F5F5',
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusYes: {
    color: '#fff',
  },
  statusNo: {
    color: '#fff',
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
    backgroundColor: '#8337B2', // Add a valid color
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PetAdoptionDetails;

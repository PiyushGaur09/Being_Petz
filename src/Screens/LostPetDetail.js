import React, {useState, useRef, useEffect} from 'react';
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

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PetDetails = ({route}) => {
  const pet = route?.params?.pet || {};
  console.log('Pet', pet);
  const user = pet?.user || {};
  const BASE_URL = 'https://beingpetz.com/petz-info/public';
  const [modalVisible, setModalVisible] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const navigation = useNavigation();
  // persist Animated.Value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Determine if this is a lost, found, or adoption pet
  const isLostPet = pet?.report_type === 'lost';
  const isFoundPet = pet?.report_type === 'found';
  const isAdoptionPet = !isLostPet && !isFoundPet;

  // Pet image (object: either {uri: ...} or local require)
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

  const handleShare = async item => {
    try {
      const imageUrl = item.images?.[0] ? `${BASE_URL}/${item.images[0]}` : '';
      const occurredDate = item.occurred_at?.split('T')[0] || 'Unknown';
      const formattedDate = occurredDate.split('').join('\u200B');

      const isAdoption = item.post_type === 'adoption';
      const isLostFound =
        item.report_type === 'lost' || item.report_type === 'found';

      let message = '';

      if (isAdoption) {
        message = `
  Adoption Alert 🐾🐾
  Adopt or please share with someone who is looking to adopt a pet!
  
  Breed: ${item.breed || 'Unknown Breed'}
  Description: ${item.description || 'No description provided'}
  Age: ${item.pet_dob ? age : 'Unknown'}
  
  ${imageUrl ? 'Photo: ' + imageUrl : ''}
  
  Join Beingpetz to see more pets looking for a forever loving home.
        `;
      } else if (isLostFound) {
        message = `
  ${item.report_type === 'lost' ? 'Lost' : 'Found'} Pet Alert 🐾🐾
  
  Breed: ${item.breed || 'Unknown Breed'}
  Description: ${item.description || 'No description provided'}
  Location: ${item.location || 'Unknown'}
  Date ${item.report_type === 'lost' ? 'Lost' : 'Found'}: ${formattedDate}
  Age: ${item.pet_dob ? age : 'Unknown'}
  
  ${imageUrl ? 'Photo: ' + imageUrl : ''}
  
  Please help ${
    item.report_type === 'lost'
      ? 'reunite this pet with pet parent'
      : 'identify this found pet'
  }!
        `;
      } else {
        message = `
  Pet Alert 🐾🐾
  
  Breed: ${item.breed || 'Unknown Breed'}
  Description: ${item.description || 'No description provided'}
  
  ${imageUrl ? 'Photo: ' + imageUrl : ''}
  
  Join Beingpetz for more pet-related information.
        `;
      }

      await Share.share({message});
    } catch (error) {
      console.error('Error sharing pet info:', error);
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

  // ---------------------
  // Dynamic image sizing
  // ---------------------
  const DISPLAYED_WIDTH = Math.round(SCREEN_WIDTH * 0.9); // 90% screen width
  const MAX_IMAGE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.7); // cap at 70% of screen height

  const [intrinsicSize, setIntrinsicSize] = useState({width: 0, height: 0});
  const [displaySize, setDisplaySize] = useState({
    width: DISPLAYED_WIDTH,
    height: Math.round(DISPLAYED_WIDTH * 0.6), // fallback aspect ratio
  });

  useEffect(() => {
    let mounted = true;

    const computeSize = async () => {
      try {
        if (petImage && petImage.uri) {
          // remote image
          Image.getSize(
            petImage.uri,
            (w, h) => {
              if (!mounted) return;
              setIntrinsicSize({width: w, height: h});
              const scale = DISPLAYED_WIDTH / (w || DISPLAYED_WIDTH);
              let computedHeight = Math.max(60, Math.round(h * scale));
              if (computedHeight > MAX_IMAGE_HEIGHT)
                computedHeight = MAX_IMAGE_HEIGHT;
              setDisplaySize({width: DISPLAYED_WIDTH, height: computedHeight});
            },
            error => {
              if (!mounted) return;
              console.warn('Image.getSize failed, using fallback size', error);
              // keep fallback displaySize
            },
          );
        } else {
          // local asset
          const resolved = Image.resolveAssetSource(petImage);
          if (resolved && resolved.width && resolved.height) {
            if (!mounted) return;
            setIntrinsicSize({width: resolved.width, height: resolved.height});
            const scale = DISPLAYED_WIDTH / (resolved.width || DISPLAYED_WIDTH);
            let computedHeight = Math.max(
              60,
              Math.round(resolved.height * scale),
            );
            if (computedHeight > MAX_IMAGE_HEIGHT)
              computedHeight = MAX_IMAGE_HEIGHT;
            setDisplaySize({width: DISPLAYED_WIDTH, height: computedHeight});
          }
        }
      } catch (err) {
        console.warn('Error computing image size', err);
      }
    };

    computeSize();
    return () => {
      mounted = false;
    };
  }, [petImage]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

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
        {/* Dynamic Image Container */}
        <View
          style={[styles.imageContainer, {height: displaySize.height + 20}]}>
          <Image
            source={petImage}
            style={[
              styles.petImage,
              {width: displaySize.width, height: displaySize.height},
            ]}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(pet)}
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

        {isLostPet && (
          <Text style={[styles.petName, {textAlign: 'center'}]}>
            {capitalizeFirstLetter(petName)}
          </Text>
        )}

        {/* Pet Info */}
        <View style={styles.contentContainer}>
          <View style={styles.headerSection}>
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

          {(isLostPet || isFoundPet) && (
            <View style={styles.additionalInfoContainer}>
              {isLostPet ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Missing since:</Text>
                  <Text style={styles.infoValue}>{occurredAt}</Text>
                </View>
              ) : (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact person:</Text>
                  <Text style={styles.infoValue}>{userName}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
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
  container: {flex: 1, backgroundColor: '#FFF'},
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  petImage: {
    borderRadius: 20,
    overflow: 'hidden',
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
    marginVertical: 6,
  },
  metaText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 6,
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

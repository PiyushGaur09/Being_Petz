import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const apiMap = {
  'Pet Training': 'https://argosmob.uk/being-petz/public/api/v1/pet/trainers',
  'Pet Store': 'https://argosmob.uk/being-petz/public/api/v1/pet/shops',
  Grooming: 'https://argosmob.uk/being-petz/public/api/v1/pet/groomers',
  'Pet Shelter': 'https://argosmob.uk/being-petz/public/api/v1/pet/shelters',
  'Pet Walker': 'https://argosmob.uk/being-petz/public/api/v1/pet/sitters',
  Veterinary: 'https://argosmob.uk/being-petz/public/api/v1/veterinary/doctors',
  'Pet Sitter': 'https://argosmob.uk/being-petz/public/api/v1/pet/sitters',
  'Pet Resort': 'https://argosmob.uk/being-petz/public/api/v1/pet/resorts',
};

const favoriteApiMap = {
  'Pet Training':
    'https://argosmob.uk/being-petz/public/api/v1/favorite/trainer',
  'Pet Store': 'https://argosmob.uk/being-petz/public/api/v1/favorite/shop',
  Grooming: 'https://argosmob.uk/being-petz/public/api/v1/favorite/groomer',
  'Pet Shelter':
    'https://argosmob.uk/being-petz/public/api/v1/favorite/shelter',
  'Pet Walker': 'https://argosmob.uk/being-petz/public/api/v1/favorite/sitter',
  'Pet Sitter': 'https://argosmob.uk/being-petz/public/api/v1/favorite/sitter',
  'Pet Resort':
    'https://argosmob.uk/being-petz/public/api/v1/favorite/resort-owner',
  Veterinary:
    'https://argosmob.uk/being-petz/public/api/v1/favorite/veterinary',
};

const BASE_URL = 'https://argosmob.uk/being-petz/public/';

// Reusable Action Button Component
const ActionButton = ({icon, text, onPress, color}) => (
  <View style={buttonStyles.container}>
    <Icon.Button
      name={icon}
      backgroundColor={color || '#8337B2'}
      borderRadius={8}
      onPress={onPress}
      iconStyle={buttonStyles.icon}>
      <Text style={buttonStyles.text}>{text}</Text>
    </Icon.Button>
  </View>
);

const ServicesDescription = ({route}) => {
  const serviceName = route.params?.name || 'Pet Training';
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  console.log('4444444', serviceData);
  useEffect(() => {
    setFilteredData(serviceData);
  }, [serviceData]);

  const apiUrl = apiMap[serviceName];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id || parsedData.user_id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // console.log('kkk', userId);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const res = await axios.get(apiUrl);
        setServiceData(res.data?.data || []);
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [apiUrl]);

  const handleCallPress = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = email => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleDirectionPress = address => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    );
  };

  const handleSavePress = async item => {
    if (!userId) {
      alert('Please login to save favorites');
      return;
    }

    try {
      const favoriteApiUrl = favoriteApiMap[serviceName];
      // console.log('favoriteApiUrl',favoriteApiUrl)
      if (!favoriteApiUrl) {
        alert('Favorite functionality not available for this service');
        return;
      }

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('service_id', item?.id);

      const response = await axios.post(favoriteApiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        alert(
          `Saved ${
            item.name ||
            item.clinic_name ||
            item.shop_name ||
            item.business_name ||
            'service'
          } to favorites!`,
        );
      } else {
        alert(response.data.message || 'Failed to save favorite');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      alert('Error saving favorite. Please try again.');
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#8337B2" style={{marginTop: 50}} />
    );
  }

  if (!serviceData.length) {
    return (
      <Text style={{textAlign: 'center', marginTop: 50}}>
        No service data found.
      </Text>
    );
  }

  const serviceDescriptions = {
    'Pet Training':
      'From basic obedience to tail-wagging tricks—build a well-mannered, confident pet with training that’s as fun as it is effective!',
    'Pet Store':
      'Treat your furry friend to the best! 🐕🐾 From tasty treats to toys and essentials, our pet stores has everything to keep tails wagging and whiskers twitching—all under one roof.',
    Grooming:
      'From scruffy to fluffy! ✨ Our pet grooming services pamper your furry friend with gentle care, stylish cuts, and a tail-wagging spa experience they’ll love.',
    'Pet Shelter':
      'Where comfort meets cuddles! 🏡 While you’re away, your pet enjoys a safe, cozy stay with plenty of play, pampering, and personalized care—just like home, but with more belly rubs.',
    'Pet Walker':
      'Happy paws, happy walks! 🐾 Give your pet the joy of daily adventures, fresh air, and tail-wagging fun with walks that are as safe as they are spirited.',
    Veterinary:
      'Compassion meets care! 🩺 From routine checkups to specialized treatments, our trusted vets are here to keep your pet healthy, happy, and thriving—every pawstep of the way.',
    'Pet Sitter':
      'Loving care when you’re not there—trusted companionship for your furry friend.',
    'Pet Resort':
      'Paws, play, and pampering! 🏖️ Our pet resort offers tail-wagging luxury, round-the-clock care, and vacation vibes for your furry family—because they deserve a getaway too.',
  };

  const ServiceHeader = () => (
    <View style={styles.headerOverlay}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 0}}>
          <Icon name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {serviceName === 'Pet Shelter' ? 'Pet Boarding' : serviceName}
        </Text>
      </View>
      <Text style={styles.headerDescription}>
        {serviceDescriptions[serviceName]}
      </Text>
    </View>
  );

  // Render different UI based on service type
  const renderServiceCard = (item, index) => {
    switch (serviceName) {
      case 'Veterinary':
        return <VeterinaryCard item={item} key={index} />;
      case 'Pet Store':
        return <PetStoreCard item={item} key={index} />;
      case 'Grooming':
        return <GroomingCard item={item} key={index} />;
      case 'Pet Training':
        return <TrainingCard item={item} key={index} />;
      case 'Pet Walker':
        return <WalkerCard item={item} key={index} />;
      case 'Pet Shelter':
        return <ShelterCard item={item} key={index} />;
      case 'Pet Sitter':
        return <PetSitterCard item={item} key={index} />;
      case 'Pet Resort':
        return <PetResortCard item={item} key={index} />;
      default:
        return <DefaultCard item={item} key={index} />;
    }
  };

  // Veterinary Card Component
  const VeterinaryCard = ({item}) => {
    const address = `${item.clinic_location}, ${item.city}, ${item.state} - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.clinic_picture_logo && (
            <Image
              source={{uri: `${BASE_URL}${item.clinic_picture_logo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.clinic_name}</Text>
            <Text style={styles.subtitle}>{item.veterinarian_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email_address)}>
            {item.email_address}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Timings</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_open} - {item.weekday_close}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_open} - {item.weekend_close}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="verified-user" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Credentials</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>License:</Text>
          <Text style={styles.infoText}>{item.medical_license_number}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>{item.years_of_experience} years</Text>
        </View>
        {item.special_certification && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Specialty:</Text>
            <Text style={styles.infoText}>{item.special_certification}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Pet Store Card Component
  const PetStoreCard = ({item}) => {
    const address = `${item.address_line_1}${
      item.address_line_2 ? `, ${item.address_line_2}` : ''
    }${item.address_line_3 ? `, ${item.address_line_3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.shop_logo && (
            <Image
              source={{uri: `${BASE_URL}${item.shop_logo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.shop_name}</Text>
            <Text style={styles.subtitle}>Owner: {item.owner_name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Store Hours</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_open} - {item.weekday_close}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_open} - {item.weekend_close}
          </Text>
        </View>

        {/* <View style={styles.sectionHeader}>
          <Icon name="business" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Business Details</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>GST:</Text>
          <Text style={styles.infoText}>{item.gst_number}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Licenses:</Text>
          <Text style={styles.infoText}>{item.licenses}</Text>
        </View> */}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Grooming Card Component
  const GroomingCard = ({item}) => {
    const address = `${item.address_line1}${
      item.address_line2 ? `, ${item.address_line2}` : ''
    }${item.address_line3 ? `, ${item.address_line3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.business_logo && (
            <Image
              source={{uri: `${BASE_URL}${item.business_logo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.business_name}</Text>
            <Text style={styles.subtitle}>Groomer: {item.owner_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.5 (80 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Business Hours</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_open} - {item.weekday_close}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_open} - {item.weekend_close}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="verified" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Professional Details</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Certifications:</Text>
          <Text style={styles.infoText}>{item.certifications}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>{item.experience_range}</Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View> */}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Training Card Component
  const TrainingCard = ({item}) => {
    const address = `${item.address_line1}${
      item.address_line2 ? `, ${item.address_line2}` : ''
    }${item.address_line3 ? `, ${item.address_line3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.logo && (
            <Image
              source={{uri: `${BASE_URL}${item.logo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.training_business_name}</Text>
            <Text style={styles.subtitle}>Trainer: {item.trainer_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.7 (95 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="school" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Training Details</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Certifications:</Text>
          <Text style={styles.infoText}>{item.certifications}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>{item.experience_years} years</Text>
        </View>
        {item.licenses && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Licenses:</Text>
            <Text style={styles.infoText}>{item.licenses}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Walker Card Component
  const WalkerCard = ({item}) => {
    const address = `${item.address_line1}${
      item.address_line2 ? `, ${item.address_line2}` : ''
    }${item.address_line3 ? `, ${item.address_line3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.walker_photo && (
            <Image source={{uri: item.walker_photo}} style={styles.logo} />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.business_name}</Text>
            <Text style={styles.subtitle}>Walker: {item.walker_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.9 (150 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="pets" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Walker Details</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Certifications:</Text>
          <Text style={styles.infoText}>{item.certifications}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>{item.experience} years</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>First Aid Trained:</Text>
          <Text style={styles.infoText}>
            {item.is_first_aid_trained ? 'Yes' : 'No'}
          </Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View> */}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Shelter Card Component
  const ShelterCard = ({item}) => {
    const address = `${item.address_line_1}${
      item.address_line_2 ? `, ${item.address_line_2}` : ''
    }${item.address_line_3 ? `, ${item.address_line_3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.shelter_logo && (
            <Image
              source={{uri: `${BASE_URL}${item.shelter_logo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.shelter_name}</Text>
            <Text style={styles.subtitle}>Manager: {item.owner_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.6 (200 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Visiting Hours</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_opening} - {item.weekday_closing}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_opening} - {item.weekend_closing}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="info" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Shelter Information</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Years Operating:</Text>
          <Text style={styles.infoText}>{item.years_of_operation}</Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.legal_registration_number}</Text>
        </View> */}
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vet Staff:</Text>
          <Text style={styles.infoText}>
            {item.licensed_vet_staff === 'yes' ? 'Available' : 'Not Available'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>NGO Collaboration:</Text>
          <Text style={styles.infoText}>
            {item.ngo_collaboration === 'yes' ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Pet Sitter Card Component
  const PetSitterCard = ({item}) => {
    const address = `${item.address_line1}${
      item.address_line2 ? `, ${item.address_line2}` : ''
    }${item.address_line3 ? `, ${item.address_line3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.sitter_photo && (
            <Image
              source={{uri: `${BASE_URL}${item.sitter_photo}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.business_name}</Text>
            <Text style={styles.subtitle}>Owner: {item.owner_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.7 (85 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Availability</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_open} - {item.weekday_close}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_open} - {item.weekend_close}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="verified-user" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Sitter Details</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>In-Home Sitting:</Text>
          <Text style={styles.infoText}>
            {item.in_home_sitting === 'yes' ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>First Aid Trained:</Text>
          <Text style={styles.infoText}>
            {item.first_aid_training === 'yes' ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Certifications:</Text>
          <Text style={styles.infoText}>{item.certifications}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>
            {item.experience === '1-3'
              ? '1-3 years'
              : item.experience === '4-6'
              ? '4-6 years'
              : item.experience === '7+'
              ? '7+ years'
              : item.experience}
          </Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View> */}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Pet Resort Card Component
  const PetResortCard = ({item}) => {
    const address = `${item.address_line1}${
      item.address_line2 ? `, ${item.address_line2}` : ''
    }${item.address_line3 ? `, ${item.address_line3}` : ''}, ${item.city}, ${
      item.state
    } - ${item.pincode}`;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          {item.logo_path && (
            <Image
              source={{uri: `${BASE_URL}${item.logo_path}`}}
              style={styles.logo}
            />
          )}
          <View style={{flex: 1}}>
            <Text style={styles.title}>{item.resort_name}</Text>
            <Text style={styles.subtitle}>Owner: {item.owner_name}</Text>
            {/* <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Icon name="phone" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleCallPress(item.contact_number)}>
            {item.contact_number}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="email" size={18} color="#8337B2" />
          <Text
            style={[styles.infoText, styles.link]}
            onPress={() => handleEmailPress(item.email)}>
            {item.email}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={18} color="#8337B2" />
          <Text style={styles.infoText}>{address}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Business Hours</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekdays:</Text>
          <Text style={styles.infoText}>
            {item.weekday_open} - {item.weekday_close}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Weekends:</Text>
          <Text style={styles.infoText}>
            {item.weekend_open} - {item.weekend_close}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="home" size={18} color="#8337B2" />
          <Text style={styles.sectionTitle}>Resort Facilities</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vet Staff:</Text>
          <Text style={styles.infoText}>
            {item.vet_staff ? 'Available' : 'Not Available'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Emergency Care:</Text>
          <Text style={styles.infoText}>
            {item.emergency_care ? 'Available' : 'Not Available'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Updates Preference:</Text>
          <Text style={styles.infoText}>
            {item.updates_preference ? 'Regular Updates' : 'No Updates'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Certifications:</Text>
          <Text style={styles.infoText}>{item.certifications}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoText}>
            {item.experience_years === '1-3'
              ? '1-3 years'
              : item.experience_years === '4-6'
              ? '4-6 years'
              : item.experience_years === '7+'
              ? '7+ years'
              : item.experience_years === '10+'
              ? '10+ years'
              : item.experience_years}
          </Text>
        </View>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoText}>{item.registration_number}</Text>
        </View> */}

        <View style={styles.actionsContainer}>
          <ActionButton
            icon="phone"
            text="Call"
            onPress={() => handleCallPress(item.contact_number)}
          />
          <ActionButton
            icon="directions"
            text="Directions"
            onPress={() => handleDirectionPress(address)}
            color="#4CAF50"
          />
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  // Default Card Component (fallback)
  const DefaultCard = ({item}) => {
    const address = item.address || '';

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name || 'Service Provider'}</Text>
        {item.contact_number && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoText}>{item.contact_number}</Text>
          </View>
        )}
        {item.email && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
        )}
        {address && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoText}>{address}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          {item.contact_number && (
            <ActionButton
              icon="phone"
              text="Call"
              onPress={() => handleCallPress(item.contact_number)}
            />
          )}
          {address && (
            <ActionButton
              icon="directions"
              text="Directions"
              onPress={() => handleDirectionPress(address)}
              color="#4CAF50"
            />
          )}
          <ActionButton
            icon="bookmark"
            text="Save"
            onPress={() => handleSavePress(item)}
            color="#FF5722"
          />
        </View>
      </View>
    );
  };

  const handleSearch = query => {
    setSearchQuery(query);
    if (query) {
      const filtered = serviceData.filter(
        item =>
          item.business_name.toLowerCase().includes(query.toLowerCase()) ||
          item.city.toLowerCase().includes(query.toLowerCase()) ||
          item.owner_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(serviceData);
    }
  };

  console.log('ServiceData', serviceData);

  return (
    <ScrollView style={styles.container}>
      <ServiceHeader />
      <TextInput
        style={styles.searchInput}
        placeholder="Search stores..."
        placeholderTextColor={'#111'}
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {filteredData.map((item, index) => renderServiceCard(item, index))}
    </ScrollView>
  );
};

const buttonStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8337B2',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    width: 100,
  },
  infoText: {
    flex: 1,
    color: '#333',
  },
  link: {
    color: '#8337B2',
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  /////
  headerOverlay: {
    padding: 20,
    paddingBottom: 25,
    backgroundColor: '#fff', // white background
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333', // dark gray text
    // marginBottom: 8,
  },
  headerDescription: {
    marginTop: 22,
    fontSize: 16,
    color: '#666', // medium gray text
    lineHeight: 22,
  },
  /////
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
});

export default ServicesDescription;

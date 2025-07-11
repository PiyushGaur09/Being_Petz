import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Favorite = ({navigation, route}) => {
  // Get favorites data from props
  const favoritesData = route.params?.favorites?.data || {
    pet_groomers: [],
    pet_trainers: [],
    pet_sitters: [],
    pet_shops: [],
    pet_shelters: [],
    pet_resort_owners: [],
    pet_behaviourists: [],
  };

  const renderServiceCard = (service, type) => {
    // Handle different nested object names
    const serviceTypeMap = {
      pet_groomers: 'pet_groomer',
      pet_trainers: 'pet_trainer',
      pet_sitters: 'pet_sitter',
      pet_shops: 'pet_shop',
      pet_shelters: 'pet_shelter',
      pet_resort_owners: 'pet_resort_owner',
      pet_behaviourists: 'pet_behaviourist',
    };

    const serviceKey = serviceTypeMap[type];
    const serviceData = service[serviceKey];

    let title, name, details;

    switch (type) {
      case 'pet_groomers':
        title = serviceData.business_name;
        name = serviceData.owner_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      case 'pet_trainers':
        title = serviceData.training_business_name;
        name = serviceData.trainer_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      case 'pet_sitters':
        title = serviceData.business_name;
        name = serviceData.owner_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      case 'pet_shops':
        title = serviceData.shop_name;
        name = serviceData.owner_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      case 'pet_resort_owners':
        title = serviceData.resort_name;
        name = serviceData.owner_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      case 'pet_behaviourists':
        title = serviceData.business_name;
        name = serviceData.full_name;
        details = `${serviceData.city}, ${serviceData.state}`;
        break;
      default:
        title = 'Service';
        name = 'Owner';
        details = 'Location';
    }

    return (
      <View style={styles.card} key={service.id}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Icon name="heart" size={20} color="#8337B2" />
        </View>
        <Text style={styles.cardText}>Owner: {name}</Text>
        <Text style={styles.cardText}>
          Contact: {serviceData.contact_number}
        </Text>
        <Text style={styles.cardText}>Location: {details}</Text>
        {serviceData.certifications && (
          <Text style={styles.cardText}>
            Certifications: {serviceData.certifications}
          </Text>
        )}
        {(serviceData.experience_range ||
          serviceData.experience_years ||
          serviceData.experience) && (
          <Text style={styles.cardText}>
            Experience:{' '}
            {serviceData.experience_range ||
              serviceData.experience_years ||
              serviceData.experience}
          </Text>
        )}
        {serviceData.gst_number && (
          <Text style={styles.cardText}>GST: {serviceData.gst_number}</Text>
        )}
      </View>
    );
  };

  const renderServiceSection = (title, data, type) => {
    if (!data || data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map(item => renderServiceCard(item, type))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderServiceSection(
          'Pet Groomers',
          favoritesData.pet_groomers,
          'pet_groomers',
        )}
        {renderServiceSection(
          'Pet Trainers',
          favoritesData.pet_trainers,
          'pet_trainers',
        )}
        {renderServiceSection(
          'Pet Sitters',
          favoritesData.pet_sitters,
          'pet_sitters',
        )}
        {renderServiceSection(
          'Pet Shops',
          favoritesData.pet_shops,
          'pet_shops',
        )}
        {renderServiceSection(
          'Pet Resorts',
          favoritesData.pet_resort_owners,
          'pet_resort_owners',
        )}
        {renderServiceSection(
          'Pet Behaviourists',
          favoritesData.pet_behaviourists,
          'pet_behaviourists',
        )}

        {favoritesData.pet_shelters &&
          favoritesData.pet_shelters.length === 0 && (
            <View style={styles.emptyMessage}>
              <Text style={styles.emptyText}>No favorite pet shelters yet</Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#8337B2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 40, // for status bar
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24, // same as back button for balance
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8337B2',
    marginBottom: 10,
    paddingLeft: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  emptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default Favorite;

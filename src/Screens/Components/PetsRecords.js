import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import petIdEmitter from './PetIdEmitter';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import VaccinationModal from './VaccinationModal';
import LottieLoader from './LottieLoader';

const Records = ({petId}) => {
  const navigation = useNavigation();
  const [records, setRecords] = useState({
    vaccinations: [],
    dewormings: [],
    groomings: [],
    weights: [],
  });

  const [loading, setLoading] = useState({
    vaccinations: true,
    dewormings: true,
    groomings: true,
    weights: true,
  });
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [petDetails, setPetDetails] = useState();

  // Different images for each section
  const sectionImages = {
    vaccinations: require('../../Assests/Images/vaccine2.png'),
    deworming: require('../../Assests/Images/deworming2.png'),
    grooming: require('../../Assests/Images/grooming2.png'),
    weight: require('../../Assests/Images/weight2.png'),
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const fetchUserPets = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('pet_id', petId);

        const response = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/pet/detail',
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
          },
        );

        // console.log('resp', response);

        if (response.data?.status && response.data?.data) {
          setPetDetails(response.data.data);
        } else {
          setPetDetails([]);
        }
      } catch (error) {
        console.error('Error fetching user pets:', error);
        setPetDetails([]);
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchUserPets();
    }
  }, [petId]);

  console.log('petDetails', petDetails);

  const fetchRecords = async (endpoint, recordType) => {
    try {
      setLoading(prev => ({...prev, [recordType]: true}));
      const formData = new FormData();
      formData.append('pet_id', petId);

      const response = await axios.post(
        `https://argosmob.com/being-petz/public/api/v1/${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      if (response.data.status && response.data.data) {
        setRecords(prev => ({
          ...prev,
          [recordType]: response.data.data,
        }));
      }
    } catch (err) {
      console.error(`Error fetching ${recordType}:`, err);
      setError(`Failed to load ${recordType} records`);
    } finally {
      setLoading(prev => ({...prev, [recordType]: false}));
    }
  };

  const isLoading = Object.values(loading).some(val => val);

  const sections = [
    {
      title: `Vaccinations for ${petDetails?.name}`,
      icon: 'needle',
      imageKey: 'vaccinations',
      showViewAll: true, // Only this section will show "View all"
      items: records.vaccinations.slice(0, 2).map(vaccine => ({
        id: vaccine.id,
        type: vaccine.vaccine_name,
        details: [
          // `Type: ${vaccine.type}`,
          `Date: ${formatDate(vaccine.date)}`,
          // `Next Due: ${formatDate(vaccine.reminder_date)}`,
          `${vaccine?.vaccine?.min_time} - ${vaccine?.vaccine?.max_time} ${vaccine?.vaccine?.type} `,
        ],
        color: '#E3F2FD', // Light blue
      })),
    },
    {
      title: 'Deworming',
      icon: 'bug',
      imageKey: 'deworming',
      showViewAll: false,
      items: records.dewormings.slice(0, 1).map(deworming => ({
        id: deworming.id,
        type: 'Deworming Treatment',
        details: [
          `Type: ${deworming.deworming_type || 'Regular'}`,
          `Date: ${formatDate(deworming.date)}`,
          `Next Due: ${formatDate(deworming.reminder_date)}`,
        ],
        color: '#E8F5E9', // Light green
      })),
    },
    {
      title: 'Grooming',
      icon: 'content-cut',
      imageKey: 'grooming',
      showViewAll: false,
      items: records.groomings.slice(0, 1).map(grooming => ({
        id: grooming.id,
        type: 'Grooming Session',
        details: [
          `Type: ${grooming.grooming_type || 'General'}`,
          `Date: ${formatDate(grooming.date)}`,
          `Next Due: ${formatDate(grooming.reminder_date)}`,
        ],
        color: '#FFF3E0', // Light orange
      })),
    },
    {
      title: 'Weight',
      icon: 'scale-bathroom',
      imageKey: 'weight',
      showViewAll: false,
      items: records.weights.slice(0, 1).map(weight => ({
        id: weight.id,
        type: 'Weight Record',
        details: [
          `Weight: ${weight.weight} kg`,
          `Date: ${formatDate(weight.date)}`,
          `Check Every Month`,
        ],
        color: '#F3E5F5', // Light purple
      })),
    },
  ];

  useEffect(() => {
    if (petId) {
      fetchRecords('vaccine/all-records', 'vaccinations');
      fetchRecords('deworming/all-records', 'dewormings');
      fetchRecords('grooming/all-records', 'groomings');
      fetchRecords('weight/all-records', 'weights');
    }

    const changeHandler = () => {
      if (petId) {
        fetchRecords('vaccine/all-records', 'vaccinations');
        fetchRecords('deworming/all-records', 'dewormings');
        fetchRecords('grooming/all-records', 'groomings');
        fetchRecords('weight/all-records', 'weights');
      }
    };

    petIdEmitter.on('petIdChanged', changeHandler);

    return () => {
      petIdEmitter.off('petIdChanged', changeHandler);
    };
  }, [petId]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8337B2" />
        {/* <LottieLoader visible={isLoading} /> */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            petId &&
            Object.keys(records).forEach(type =>
              fetchRecords(`${type}/all-records`, type),
            )
          }>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.header}>Reminder Profile</Text> */}

      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name={section.icon}
                size={20}
                color="#8337B2"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>
            {section.showViewAll && section.items.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {section.items.length > 0 ? (
            section.items.map((item, itemIndex) => (
              <View
                key={`${section.title}-${item.id || itemIndex}`}
                style={[styles.cardContainer, {backgroundColor: item.color}]}>
                <View style={styles.cardContent}>
                  <Image
                    source={sectionImages[section.imageKey]}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.type}</Text>
                    {item.details.map((detail, detailIndex) => (
                      <Text key={detailIndex} style={styles.cardDetail}>
                        {detail}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordsText}>No records found</Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        onPress={() => navigation.navigate('ViewAll')}
        style={styles.manageButton}>
        <Text style={styles.manageButtonText}>Manage Records</Text>
      </TouchableOpacity>

      <VaccinationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        petType={petDetails?.type}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFFF',
    padding: 24,
    width: '100%',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 4,
  },
  viewAllText: {
    color: '#8337B2',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: '#111',
    marginBottom: 2,
    fontWeight: '500',
  },
  cardImage: {
    width: 70,
    height: 70,
    marginRight: 20,
  },
  manageButton: {
    backgroundColor: '#8337B2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    elevation: 2,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8337B2',
    padding: 12,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  noRecordsText: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  //////
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200, // Adjust based on your image aspect ratio
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 5,
    color: '#333',
  },
  vaccineName: {
    fontSize: 15,
    marginVertical: 3,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  bulletList: {
    marginLeft: 15,
    marginVertical: 5,
  },
  bulletItem: {
    fontSize: 15,
    marginVertical: 3,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Records;

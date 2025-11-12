import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const {width} = Dimensions.get('window');

const VaccinationModal = ({visible, onClose, petType = 'dog'}) => {
  const [vaccinationData, setVaccinationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      fetchVaccinationData();
    }
  }, [visible, petType]);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('pet_type', petType.toLowerCase());

      // Make the POST request with Axios
      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/vaccine/get',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const data = response.data;

      if (data.status && data.data) {
        // Transform data to match the UI structure
        const transformedData = data.data.map(item => ({
          age: `${item.min_time}–${item.max_time}\n${
            item.type === 'weeks' ? 'Weeks' : item.type
          }`,
          image: getImageForItem(item),
          core: item.core_vaccine ? item.core_vaccine.split(' ') : [],
          lifestyle: item.life_style_vaccine
            ? item.life_style_vaccine.split(' ')
            : [],
        }));

        setVaccinationData(transformedData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch vaccination data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageForItem = item => {
    // You'll need to replace these with your actual image imports
    const images = {
      dog: [
        require('../../Assests/Images/Vac.png'),
        require('../../Assests/Images/Vac1.png'),
        require('../../Assests/Images/Vac2.png'),
        require('../../Assests/Images/Vac3.png'),
      ],
      cat: [
        require('../../Assests/Images/Vac.png'), // Replace with cat images
        require('../../Assests/Images/Vac1.png'),
      ],
    };

    const index = item.id % images[item.pet_type].length;
    return images[item.pet_type][index];
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Vaccination Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#8337B2" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load data: {error}</Text>
              <TouchableOpacity
                onPress={fetchVaccinationData}
                style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.columnTitle}></Text>
                <Text style={styles.columnTitle}>Core Vaccines</Text>
                <Text style={styles.columnTitle}>Lifestyle Vaccines</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {vaccinationData.map((item, idx) => (
                  <View style={styles.row} key={idx}>
                    <View style={styles.ageCol}>
                      <Image source={item.image} style={styles.dogImage} />
                      <Text style={styles.ageText}>{item.age}</Text>
                    </View>

                    <View style={styles.vaccineCol}>
                      {item.core.map((v, i) => (
                        <Text key={i} style={styles.vaccineText}>
                          {v}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.vaccineCol}>
                      {item.lifestyle.map((v, i) => (
                        <Text key={i} style={styles.vaccineText}>
                          {v}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Button */}
          {/* <TouchableOpacity
            onPress={() => {
              navigation.navigate('ViewAll');
            }}
            style={styles.button}>
            <Text style={styles.buttonText}>View all Documents</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  columnTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ageCol: {
    width: 80,
    alignItems: 'center',
    marginRight: 20,
  },
  dogImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  ageText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
  },
  vaccineCol: {
    flex: 1,
    paddingLeft: 10,
  },
  vaccineText: {
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#8337B2',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#8337B2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
  },
});

export default VaccinationModal;

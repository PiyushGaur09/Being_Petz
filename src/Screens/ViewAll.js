import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import petIdEmitter from './Components/PetIdEmitter';
import Header from './Components/Header';
import PetCareForm from './Components/PetCareForm';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import {LineChart} from 'react-native-chart-kit';

const ViewAll = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Vaccines');
  const [selectedDeworming, setSelectedDeworming] = useState(false);
  const [petInfo, setPetInfo] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [records, setRecords] = useState({
    vaccinations: [],
    dewormings: [],
    groomings: [],
    weights: [],
    meals: [],
    generals: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const [loading, setLoading] = useState({
    petInfo: true,
    vaccinations: true,
    dewormings: true,
    groomings: true,
    weights: true,
    meals: true,
    generals: true,
  });
  const [error, setError] = useState(null);
  const [activeForm, setActiveForm] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleSuccess = async response => {
    console.log('Record saved successfully:', response);
    setActiveForm(null);

    try {
      switch (activeCategory.toLowerCase()) {
        case 'vaccines':
          await fetchRecords('vaccine/all-records', 'vaccinations');
          break;
        case 'deworming':
          await fetchRecords('deworming/all-records', 'dewormings');
          break;
        case 'grooming':
          await fetchRecords('grooming/all-records', 'groomings');
          break;
        case 'meals':
          await fetchRecords('meal/all-records', 'meals');
          break;
        case 'weight':
          await fetchRecords('weight/all-records', 'weights');
          break;
        case 'general':
          await fetchRecords('general/all-records', 'generals');
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error refetching data:', err);
    }
  };

  const deleteRecord = async (recordType, id, name) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this ${recordType} record${
        name ? ` for ${name}` : ''
      }?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let endpoint = '';
              let stateProperty = '';

              switch (recordType) {
                case 'deworming':
                  endpoint = 'deworming/delete-record';
                  stateProperty = 'dewormings';
                  break;
                case 'grooming':
                  endpoint = 'grooming/delete-record';
                  stateProperty = 'groomings';
                  break;
                case 'meal':
                  endpoint = 'meal/delete-record';
                  stateProperty = 'meals';
                  break;
                case 'weight':
                  endpoint = 'weight/delete-record';
                  stateProperty = 'weights';
                  break;
                case 'vaccine':
                  endpoint = 'vaccine/delete-record';
                  stateProperty = 'vaccinations';
                  break;
                case 'general':
                  endpoint = 'general/delete-record';
                  stateProperty = 'generals';
                  break;
                default:
                  return;
              }

              const formData = new FormData();
              formData.append('id', id);

              const response = await axios.post(
                `https://beingpetz.com/petz-info/public/api/v1/${endpoint}`,
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                  },
                },
              );

              if (response.data.status) {
                setRecords(prev => ({
                  ...prev,
                  [stateProperty]: prev[stateProperty].filter(
                    record => record.id !== id,
                  ),
                }));
              } else {
                console.error(
                  'Failed to delete record:',
                  response.data.message,
                );
                Alert.alert(
                  'Error',
                  'Failed to delete record. Please try again.',
                );
              }
            } catch (err) {
              console.error(`Error deleting ${recordType} record:`, err);
              Alert.alert(
                'Error',
                'An error occurred while deleting the record. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const formatReminderDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', {month: 'long'});
    const year = date.getFullYear();
    const daySuffix =
      day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    return `${day}${daySuffix} ${month} ${year}`;
  };

  const formatTime = timeString => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatSimpleDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fetchPetDetails = async () => {
    try {
      setLoading(prev => ({...prev, petInfo: true}));
      const formData = new FormData();
      formData.append('pet_id', selectedPetId);

      const response = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/pet/detail',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );

      if (response.data.status && response.data.data) {
        setPetInfo(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching pet details:', err);
      setError('Failed to load pet details');
    } finally {
      setLoading(prev => ({...prev, petInfo: false}));
    }
  };

  const fetchRecords = async (endpoint, recordType) => {
    try {
      setLoading(prev => ({...prev, [recordType]: true}));
      const formData = new FormData();
      formData.append('pet_id', selectedPetId);

      const response = await axios.post(
        `https://beingpetz.com/petz-info/public/api/v1/${endpoint}`,
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

  const calculateAge = dob => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      months += 12;
    }
    return `${years} Year${years !== 1 ? 's' : ''} ${months} Month${
      months !== 1 ? 's' : ''
    } `;
  };

  const getSelectedPetId = async () => {
    try {
      const id = await AsyncStorage.getItem('SelectedPetId');
      if (id) {
        setSelectedPetId(id);
        return id;
      }
      return null;
    } catch (error) {
      console.error('Error getting SelectedPetId:', error);
      return null;
    }
  };

  // initializeData is centralized so we can call it from focus effect and pull-to-refresh
  const initializeData = useCallback(async () => {
    try {
      setError(null);
      const petId = await getSelectedPetId();
      if (!petId) return;

      // fetch pet details & all record types in parallel (pet details first isn't strictly required but keeps UI consistent)
      await fetchPetDetails();

      await Promise.all([
        fetchRecords('vaccine/all-records', 'vaccinations'),
        fetchRecords('deworming/all-records', 'dewormings'),
        fetchRecords('grooming/all-records', 'groomings'),
        fetchRecords('weight/all-records', 'weights'),
        fetchRecords('meal/all-records', 'meals'),
        fetchRecords('general/all-records', 'generals'),
      ]);
    } catch (err) {
      console.warn('initializeData error', err);
    }
  }, [selectedPetId]);

  // run initializeData every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      initializeData();

      // react to petIdEmitter events to reload data if pet changes elsewhere in the app
      const changeHandler = async () => {
        await initializeData();
      };
      petIdEmitter.on('petIdChanged', changeHandler);

      return () => {
        petIdEmitter.off('petIdChanged', changeHandler);
      };
    }, [initializeData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, [initializeData]);

  const isLoading = Object.values(loading).some(val => val);

  const categories = [
    'Vaccines',
    'Deworming',
    'Grooming',
    'Meals',
    'Weight',
    'General',
  ];

  const formatSimpleDateTwoLine = isoDate => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const monthShort = d.toLocaleString('en-GB', {month: 'short'});
    return `${day}\n${monthShort}`;
  };

  const sortedWeights = [...records.weights].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const maxLabels = 6;
  const len = sortedWeights.length;
  const step = Math.max(1, Math.ceil(len / maxLabels));
  const labels = sortedWeights.map((w, i) =>
    i % step === 0 ? formatSimpleDateTwoLine(w.date) : '',
  );
  const dataValues = sortedWeights.map(w => parseFloat(w.weight));

  const renderCategoryView = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8337B2" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              initializeData();
            }}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeCategory) {
      case 'Vaccines':
        return (
          <View style={styles.detailsContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                marginBottom: 16,
              }}>
              <Text style={styles.detailsTitle}>Vaccine Records</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ViewDocuments', {
                    document: records?.vaccinations,
                    name: 'Vaccine Documents',
                  });
                }}
                style={styles.detailsTitle}>
                <Text style={{color: '#8337B2'}}>View Documents</Text>
              </TouchableOpacity>
            </View>

            {records.vaccinations.length === 0 ? (
              <Text style={styles.noRecordsText}>No vaccine records found</Text>
            ) : (
              records.vaccinations.map((vaccine, index) => (
                <View key={vaccine.id || index} style={styles.recordContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {vaccine.date
                        ? formatSimpleDate(vaccine.date)
                        : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vaccine:</Text>
                    <Text style={styles.detailValue}>
                      {vaccine.vaccine_name || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {vaccine.type || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Reminder:</Text>
                    <Text style={styles.detailValue}>
                      {vaccine.reminder_date
                        ? `${formatSimpleDate(
                            vaccine.reminder_date,
                          )} at ${formatTime(vaccine.reminder_time)}`
                        : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Vaccine:</Text>
                    <Text style={styles.detailValue}>
                      {vaccine.next_vaccine || 'Not specified'}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('EditRecord', {
                          recordType: 'vaccine',
                          recordData: vaccine,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, {backgroundColor: 'red'}]}
                      onPress={() =>
                        deleteRecord(
                          'vaccine',
                          vaccine.id,
                          vaccine.vaccine_name,
                        )
                      }>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {index < records.vaccinations.length - 1 && (
                    <View style={styles.recordDivider} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('vaccines')}>
              <Text style={styles.addButtonText}>Add New Vaccine</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Deworming':
        return (
          <View style={styles.detailsContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                marginBottom: 16,
              }}>
              <Text style={styles.detailsTitle}>Deworming Records</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ViewDocuments', {
                    document: records?.dewormings,
                    name: 'Deworming Documents',
                  });
                }}
                style={styles.detailsTitle}>
                <Text style={{color: '#8337B2'}}>View Documents</Text>
              </TouchableOpacity>
            </View>
            {records.dewormings.length === 0 ? (
              <Text style={styles.noRecordsText}>
                No deworming records found
              </Text>
            ) : (
              records.dewormings.map((deworming, index) => (
                <View
                  key={deworming.id || index}
                  style={styles.recordContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {deworming.date
                        ? formatSimpleDate(deworming.date)
                        : 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {deworming.type || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Reminder:</Text>
                    <Text style={styles.detailValue}>
                      {deworming.reminder_date
                        ? `${formatSimpleDate(
                            deworming.reminder_date,
                          )} at ${formatTime(deworming.reminder_time)}`
                        : 'Not set'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('EditRecord', {
                          recordType: 'deworming',
                          recordData: deworming,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, {backgroundColor: 'red'}]}
                      onPress={() =>
                        deleteRecord('deworming', deworming.id, deworming.type)
                      }>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {index < records.dewormings.length - 1 && (
                    <View style={styles.recordDivider} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('deworming')}>
              <Text style={styles.addButtonText}>Add New Deworming</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Grooming':
        return (
          <View style={styles.detailsContainer}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                marginBottom: 16,
              }}>
              <Text style={styles.detailsTitle}>Grooming Records</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ViewDocuments', {
                    document: records?.groomings,
                    name: 'Grooming Documents',
                  });
                }}
                style={styles.detailsTitle}>
                <Text style={{color: '#8337B2'}}>View Documents</Text>
              </TouchableOpacity>
            </View>

            {records.groomings.length === 0 ? (
              <Text style={styles.noRecordsText}>
                No grooming records found
              </Text>
            ) : (
              records.groomings.map((grooming, index) => (
                <View key={grooming.id || index} style={styles.recordContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {grooming.date
                        ? formatSimpleDate(grooming.date)
                        : 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {grooming.type || 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Reminder:</Text>
                    <Text style={styles.detailValue}>
                      {grooming.reminder_date
                        ? `${formatSimpleDate(
                            grooming.reminder_date,
                          )} at ${formatTime(grooming.reminder_time)}`
                        : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Grooming:</Text>
                    <Text style={styles.detailValue}>
                      {grooming.next_grooming || 'Not specified'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('EditRecord', {
                          recordType: 'grooming',
                          recordData: grooming,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, {backgroundColor: 'red'}]}
                      onPress={() =>
                        deleteRecord('grooming', grooming.id, grooming.type)
                      }>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {index < records.groomings.length - 1 && (
                    <View style={styles.recordDivider} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('grooming')}>
              <Text style={styles.addButtonText}>Add New Grooming</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Meals':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Meal Records</Text>

            {records.meals.length === 0 ? (
              <Text style={styles.noRecordsText}>No meal records found</Text>
            ) : (
              records.meals.map((meal, index) => (
                <View key={meal.id || index} style={styles.recordContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Meal Time:</Text>
                    <Text style={styles.detailValue}>
                      {meal.meal_time
                        ? meal.meal_time.charAt(0).toUpperCase() +
                          meal.meal_time.slice(1)
                        : 'Not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Reminder:</Text>
                    <Text style={styles.detailValue}>
                      {meal.reminder_date
                        ? `${formatSimpleDate(
                            meal.reminder_date,
                          )} at ${formatTime(meal.reminder_time)}`
                        : 'Not set'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('EditRecord', {
                          recordType: 'meal',
                          recordData: meal,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, {backgroundColor: 'red'}]}
                      onPress={() =>
                        deleteRecord('meal', meal.id, meal.meal_time)
                      }>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {index < records.meals.length - 1 && (
                    <View style={styles.recordDivider} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('meals')}>
              <Text style={styles.addButtonText}>Add New Meal</Text>
            </TouchableOpacity>
          </View>
        );

      case 'Weight':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Weight Records</Text>

            {records.weights.length === 0 ? (
              <Text style={styles.noRecordsText}>No weight records found</Text>
            ) : (
              <>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels,
                      datasets: [{data: dataValues}],
                    }}
                    width={screenWidth - 60}
                    height={220}
                    yAxisSuffix=" kg"
                    yAxisInterval={1}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(131, 55, 178, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {borderRadius: 16},
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#8337B2',
                      },
                      propsForLabels: {
                        fontSize: '11',
                      },
                    }}
                    bezier
                    style={{marginVertical: 8, borderRadius: 16}}
                    xLabelsOffset={-10}
                    withInnerLines={true}
                  />
                </View>

                {records.weights.map((weight, index) => (
                  <View key={weight.id || index} style={styles.recordContainer}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>
                        {weight.date
                          ? formatSimpleDate(weight.date)
                          : 'Not recorded'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weight:</Text>
                      <Text style={styles.detailValue}>
                        {weight.weight ? `${weight.weight} kg` : 'Not recorded'}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate('EditRecord', {
                            recordType: 'weight',
                            recordData: weight,
                          })
                        }>
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, {backgroundColor: 'red'}]}
                        onPress={() =>
                          deleteRecord(
                            'weight',
                            weight.id,
                            `${weight.weight} kg`,
                          )
                        }>
                        <Text style={styles.actionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>

                    {index < records.weights.length - 1 && (
                      <View style={styles.recordDivider} />
                    )}
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('weight')}>
              <Text style={styles.addButtonText}>Add New Weight Record</Text>
            </TouchableOpacity>
          </View>
        );

      case 'General':
        return (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>General Records</Text>

            {records.generals.length === 0 ? (
              <Text style={styles.noRecordsText}>No general records found</Text>
            ) : (
              records.generals.map((general, index) => (
                <View key={general.id || index} style={styles.recordContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {general.date
                        ? formatSimpleDate(general.date)
                        : 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>
                      {general.time ? formatTime(general.time) : 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={[styles.detailValue, {flex: 1}]}>
                      {general.notes || 'No notes'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('EditRecord', {
                          recordType: 'general',
                          recordData: general,
                        })
                      }>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, {backgroundColor: 'red'}]}
                      onPress={() =>
                        deleteRecord('general', general.id, 'general note')
                      }>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>

                  {index < records.generals.length - 1 && (
                    <View style={styles.recordDivider} />
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveForm('general')}>
              <Text style={styles.addButtonText}>Add New General Record</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading && !petInfo) {
    return (
      <SafeAreaView style={styles.fullScreenLoading}>
        <ActivityIndicator size="large" color="#8337B2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8337B2']}
          />
        }>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Records</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}>
            {categories.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  activeCategory === item && styles.activeCategoryButton,
                ]}
                onPress={() => {
                  setActiveCategory(item);
                  setActiveForm(item.toLowerCase());
                }}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === item && styles.activeCategoryText,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {activeForm && (
            <PetCareForm
              petId={selectedPetId}
              recordType={activeForm}
              onSuccess={handleSuccess}
              onCancel={() => setActiveForm(null)}
            />
          )}
        </View>

        <View style={styles.section}>{renderCategoryView()}</View>
      </ScrollView>
      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9EFFF',
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  petInfoText: {
    flex: 1,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8337B2',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  activeCategoryButton: {
    backgroundColor: '#8337B2',
  },
  categoryText: {
    fontSize: 14,
    color: '#8337B2',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  dewormingSelection: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: '50%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#8337B2',
    borderRadius: 4,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  optional: {
    fontWeight: 'normal',
    fontSize: 12,
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8337B2',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#8337B2',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealRecordContainer: {
    marginBottom: 16,
  },
  mealTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTimeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  recordDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  chartContainer: {
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default ViewAll;

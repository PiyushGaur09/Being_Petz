import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PetCareForm = ({petId, recordType, onSuccess, onCancel}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateField, setDateField] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [petDetail, setPetDetail] = useState(null);
  const [loadingPetDetail, setLoadingPetDetail] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({});

  console.log('petDetails', petDetail, selectedPetId);

  // Fetch selected pet ID and pet details when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedPetId = await AsyncStorage.getItem('SelectedPetId');
        if (storedPetId) {
          const parsedPetId = parseInt(storedPetId, 10);
          setSelectedPetId(parsedPetId);
          fetchPetDetail(parsedPetId);
        }
      } catch (error) {
        console.error('Error initializing pet data:', error);
      }
    };
    initialize();
  }, []);

  // Fetch pet details function
  const fetchPetDetail = async () => {
    try {
      setLoadingPetDetail(true);
      const formData = new FormData();
      formData.append('pet_id', selectedPetId);

      const response = await axios.post(
        'https://argosmob.uk/being-petz/public/api/v1/pet/detail',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data && response.data.data) {
        setPetDetail(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pet details:', error);
      Alert.alert('Error', 'Failed to fetch pet details');
    } finally {
      setLoadingPetDetail(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      setLoadingVaccines(true);
      const response = await axios.get(
        'https://argosmob.uk/being-petz/public/api/v1/vaccine/get-all',
      );

      if (response.data && response.data.data) {
        // Filter vaccines based on pet type if petDetail is available
        const allVaccines = response.data.data;
        const filteredVaccines = petDetail?.type
          ? allVaccines.filter(
              vaccine =>
                vaccine.pet_type.toLowerCase() ===
                  petDetail.type.toLowerCase() ||
                vaccine.pet_type.toLowerCase() === 'all',
            )
          : allVaccines;

        setVaccines(filteredVaccines);
      }
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      Alert.alert('Error', 'Failed to fetch vaccine list');
    } finally {
      setLoadingVaccines(false);
    }
  };

  useEffect(() => {
    if (recordType === 'vaccines' && petDetail) {
      fetchVaccines();
    }
  }, [recordType, petDetail]); // Add petDetail as dependency

  useEffect(() => {
    fetchPetDetail();
  }, [selectedPetId]);

  // Dropdown options
  const dropdownOptions = {
    vaccine_name: vaccines.map(vaccine => `${vaccine.core_vaccine}`),
    deworming_type: [
      'Pyrantel Pamoate',
      'Fenbendazole',
      'Praziquantel',
      'Milbemycin Oxime',
      'Selamectin',
      'Ivermectin',
      'Moxidectin',
    ],
    grooming_type: [
      'Bath & Brush',
      'Haircut',
      'Nail Trim',
      'Ear Cleaning',
      'Teeth Brushing',
      'Full Grooming',
      'Deshedding Treatment',
    ],
    meal_time: ['Morning', 'Afternoon', 'Evening', 'Night'],
    type: ['Mandatory', 'Lifestyle'],
  };
  // Define form configurations for each record type
  const formConfigs = {
    vaccines: {
      endpoint: '/vaccine/save-records',
      fields: [
        {name: 'date', type: 'date', required: true, label: 'Date'},
        {
          name: 'vaccine_name',
          type: 'dropdown',
          required: true,
          label: 'Vaccine Name',
          options: dropdownOptions.vaccine_name,
        },
        {
          name: 'type',
          type: 'dropdown',
          required: true,
          label: 'Type',
          options: dropdownOptions.type,
        },
        {
          name: 'image',
          type: 'image',
          required: false,
          label: 'Upload Documents',
        },
        {
          name: 'next_vaccine',
          type: 'dropdown',
          required: true,
          label: 'Next Vaccine Name',
          options: dropdownOptions.vaccine_name,
        },
        {
          name: 'reminder_date',
          type: 'date',
          required: false,
          label: 'Reminder Date',
        },
        {
          name: 'reminder_time',
          type: 'time',
          required: false,
          label: 'Reminder Time',
        },
      ],
    },
    deworming: {
      endpoint: '/deworming/save-records',
      fields: [
        {name: 'date', type: 'date', required: true, label: 'Date'},
        {
          name: 'deworming_type',
          type: 'dropdown',
          required: true,
          label: 'Deworming Type',
          options: dropdownOptions.deworming_type,
        },
        {
          name: 'image',
          type: 'image',
          required: false,
          label: 'Upload Documents',
        },
        {
          name: 'reminder_date',
          type: 'date',
          required: false,
          label: 'Reminder Date',
        },
        {
          name: 'reminder_time',
          type: 'time',
          required: false,
          label: 'Reminder Time',
        },
      ],
    },
    grooming: {
      endpoint: '/grooming/save-records',
      fields: [
        {name: 'date', type: 'date', required: true, label: 'Date'},
        {
          name: 'grooming_type',
          type: 'dropdown',
          required: true,
          label: 'Grooming Type',
          options: dropdownOptions.grooming_type,
        },
        {
          name: 'image',
          type: 'image',
          required: false,
          label: 'Upload Documents',
        },
        {
          name: 'next_grooming',
          type: 'dropdown',
          required: true,
          label: 'Next Grooming Type',
          options: dropdownOptions.grooming_type,
        },
        {
          name: 'reminder_date',
          type: 'date',
          required: false,
          label: 'Reminder Date',
        },
        {
          name: 'reminder_time',
          type: 'time',
          required: false,
          label: 'Reminder Time',
        },
      ],
    },
    meals: {
      endpoint: '/meal/save-records',
      fields: [
        {
          name: 'meal_time',
          type: 'dropdown',
          required: true,
          label: 'Meal Time',
          options: dropdownOptions.meal_time,
        },
        {
          name: 'reminder_date',
          type: 'date',
          required: false,
          label: 'Reminder Date',
        },
        {
          name: 'reminder_time',
          type: 'time',
          required: false,
          label: 'Reminder Time',
        },
      ],
    },
    weight: {
      endpoint: '/weight/save-records',
      fields: [
        {name: 'date', type: 'date', required: true, label: 'Date'},
        {name: 'weight', type: 'number', required: true, label: 'Weight (kg)'},
      ],
    },
    general: {
      endpoint: '/general/save-records',
      fields: [
        {name: 'date', type: 'date', required: true, label: 'Date'},
        {name: 'time', type: 'time', required: true, label: 'Time'},
        {name: 'notes', type: 'textarea', required: true, label: 'Notes'},
      ],
    },
  };

  const config = formConfigs[recordType];
  if (!config) {
    return <Text>Invalid record type</Text>;
  }

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
      });

      setImage(image.path);
      setFormData(prev => ({...prev, image: image.path}));
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const onDateChange = (event, selectedDate) => {
    const current = selectedDate || currentDate;
    setShowDatePicker(Platform.OS === 'ios');
    setCurrentDate(current);

    if (event.type === 'set') {
      const formattedDate = current.toISOString().split('T')[0];
      setFormData(prev => ({...prev, [dateField]: formattedDate}));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    const current = selectedTime || currentTime;
    setShowTimePicker(Platform.OS === 'ios');
    setCurrentTime(current);

    if (event.type === 'set') {
      const formattedTime = current
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5);
      setFormData(prev => ({...prev, [dateField]: formattedTime}));
    }
  };

  const showDatepicker = fieldName => {
    setDateField(fieldName);
    setShowDatePicker(true);
  };

  const showTimepicker = fieldName => {
    setDateField(fieldName);
    setShowTimePicker(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({...prev, [fieldName]: value}));
  };

  const toggleDropdown = fieldName => {
    setCurrentDropdown(fieldName);
    setDropdownVisible(!dropdownVisible);
  };

  const selectOption = (fieldName, option) => {
    handleInputChange(fieldName, option);
    setDropdownVisible(false);
  };

  const validateForm = () => {
    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        Alert.alert('Error', `Please fill in ${field.label}`);
        return false;
      }
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('pet_id', petId);

      // Append all fields to formData
      config.fields.forEach(field => {
        if (field.type === 'image' && formData[field.name]) {
          data.append(field.name, {
            uri: formData[field.name],
            type: 'image/jpeg',
            name: 'photo.jpg',
          });
        } else if (formData[field.name] !== undefined) {
          data.append(field.name, formData[field.name]);
        }
      });

      const response = await axios.post(
        `https://argosmob.uk/being-petz/public/api/v1${config.endpoint}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      Alert.alert('Error', err.response?.data?.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredLabel = ({label, required}) => (
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.requiredAsterisk}> *</Text>}
    </Text>
  );

  const renderInput = field => {
    // Show loading indicator when fetching vaccines for dropdown
    if (
      field.type === 'dropdown' &&
      field.name === 'vaccine_name' &&
      loadingVaccines
    ) {
      return (
        <View style={styles.fieldContainer}>
          <RequiredLabel label={field.label} required={field.required} />
          <View style={styles.input}>
            <ActivityIndicator size="small" color="#8337B2" />
            <Text style={{marginLeft: 10}}>Loading vaccine options...</Text>
          </View>
        </View>
      );
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TextInput
              style={styles.input}
              onChangeText={text => handleInputChange(field.name, text)}
              value={formData[field.name] || ''}
              placeholder={`Enter ${field.label}`}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            />
          </View>
        );
      case 'textarea':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TextInput
              style={styles.textarea}
              onChangeText={text => handleInputChange(field.name, text)}
              value={formData[field.name] || ''}
              placeholder={`Enter ${field.label}`}
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 'dropdown':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TouchableOpacity
              style={styles.input}
              onPress={() => toggleDropdown(field.name)}
              disabled={field.name === 'vaccine_name' && loadingVaccines}>
              <Text>{formData[field.name] || `Select ${field.label}`}</Text>
              <Icon
                name="arrow-drop-down"
                size={24}
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            <Modal
              visible={dropdownVisible && currentDropdown === field.name}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}>
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setDropdownVisible(false)}>
                <View style={styles.dropdownContainer}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {field.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownOption}
                        onPress={() => selectOption(field.name, option)}>
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      case 'date':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TouchableOpacity
              style={styles.input}
              onPress={() => showDatepicker(field.name)}>
              <Text>{formData[field.name] || `Select ${field.label}`}</Text>
            </TouchableOpacity>
            {showDatePicker && dateField === field.name && (
              <DateTimePicker
                value={currentDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
        );
      case 'time':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TouchableOpacity
              style={styles.input}
              onPress={() => showTimepicker(field.name)}>
              <Text>{formData[field.name] || `Select ${field.label}`}</Text>
            </TouchableOpacity>
            {showTimePicker && dateField === field.name && (
              <DateTimePicker
                value={currentTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
          </View>
        );
      case 'image':
        return (
          <View style={styles.fieldContainer}>
            <RequiredLabel label={field.label} required={field.required} />
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text>{image ? 'Uploaded Document' : 'Upload Document'}</Text>
            </TouchableOpacity>
            {image && (
              <Text style={styles.imageText}>Document ready for upload</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>
        Add New {recordType.charAt(0).toUpperCase() + recordType.slice(1)}{' '}
        Record
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {config.fields.map(field => (
        <View key={field.name}>{renderInput(field)}</View>
      ))}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={onSubmit}
          disabled={
            isSubmitting || (recordType === 'vaccines' && loadingVaccines)
          }>
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  requiredAsterisk: {
    color: 'red',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownIcon: {
    color: '#555',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  dropdownOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  textarea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#8337B2',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageButton: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});

export default PetCareForm;

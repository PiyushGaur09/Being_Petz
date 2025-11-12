import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  ScrollView as RNScroll,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditRecordScreen = ({route: propRoute}) => {
  const route = propRoute || useRoute();
  const navigation = useNavigation();
  const {
    recordType: incomingRecordType,
    recordData,
    onSuccess,
  } = route.params || {};
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState('');
  const [currentTimeField, setCurrentTimeField] = useState('');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [petDetail, setPetDetail] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);

  // Dropdown modal state (for generic dropdown fields like vaccine_name)
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [currentDropdown, setCurrentDropdown] = useState('');

  // Accept both "vaccine" and "vaccines" etc. Normalize incoming type to keys used below.
  const normalizeType = t => {
    if (!t) return null;
    const lower = t.toLowerCase();
    if (lower === 'vaccine' || lower === 'vaccines') return 'vaccines';
    if (lower === 'deworming' || lower === 'deworm') return 'deworming';
    if (lower === 'grooming' || lower === 'groom') return 'grooming';
    if (lower === 'meal' || lower === 'meals') return 'meals';
    if (lower === 'weight' || lower === 'weights') return 'weight';
    if (lower === 'general' || lower === 'misc') return 'general';
    return lower;
  };

  const recordType = normalizeType(incomingRecordType);

  // Dropdown options static
  const dropdownOptions = {
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

  // form configurations (matching your add form endpoints but pointing to update endpoints)
  const recordConfigs = {
    vaccines: {
      endpoint: '/vaccine/update-records',
      fields: [
        {name: 'date', type: 'date', label: 'Date', required: true},
        {
          name: 'vaccine_name',
          type: 'dropdown',
          label: 'Vaccine Name',
          required: true,
          optionsSource: 'vaccines', // special source
        },
        {
          name: 'type',
          type: 'dropdown',
          label: 'Type',
          required: true,
          options: dropdownOptions.type,
        },
        {name: 'image', type: 'image', label: 'Image', required: false},
        {
          name: 'next_vaccine',
          type: 'dropdown',
          label: 'Next Vaccine',
          required: false,
          optionsSource: 'vaccines',
        },
        {
          name: 'reminder_date',
          type: 'date',
          label: 'Reminder Date',
          required: false,
        },
        {
          name: 'reminder_time',
          type: 'time',
          label: 'Reminder Time',
          required: false,
        },
      ],
      title: 'Edit Vaccine Record',
    },
    deworming: {
      endpoint: '/deworming/update-records',
      fields: [
        {name: 'date', type: 'date', label: 'Date', required: true},
        {
          name: 'deworming_type',
          type: 'dropdown',
          label: 'Deworming Type',
          required: true,
          options: dropdownOptions.deworming_type,
        },
        {name: 'image', type: 'image', label: 'Image', required: false},
        {
          name: 'reminder_date',
          type: 'date',
          label: 'Reminder Date',
          required: false,
        },
        {
          name: 'reminder_time',
          type: 'time',
          label: 'Reminder Time',
          required: false,
        },
      ],
      title: 'Edit Deworming Record',
    },
    grooming: {
      endpoint: '/grooming/update-records',
      fields: [
        {name: 'date', type: 'date', label: 'Date', required: true},
        {
          name: 'grooming_type',
          type: 'dropdown',
          label: 'Grooming Type',
          required: true,
          options: dropdownOptions.grooming_type,
        },
        {name: 'image', type: 'image', label: 'Image', required: false},
        {
          name: 'next_grooming',
          type: 'dropdown',
          label: 'Next Grooming',
          required: false,
          options: dropdownOptions.grooming_type,
        },
        {
          name: 'reminder_date',
          type: 'date',
          label: 'Reminder Date',
          required: false,
        },
        {
          name: 'reminder_time',
          type: 'time',
          label: 'Reminder Time',
          required: false,
        },
      ],
      title: 'Edit Grooming Record',
    },
    meals: {
      endpoint: '/meal/update-records',
      fields: [
        {
          name: 'meal_time',
          type: 'dropdown',
          label: 'Meal Time',
          required: true,
          options: dropdownOptions.meal_time,
        },
        {
          name: 'reminder_date',
          type: 'date',
          label: 'Reminder Date',
          required: false,
        },
        {
          name: 'reminder_time',
          type: 'time',
          label: 'Reminder Time',
          required: false,
        },
      ],
      title: 'Edit Meal Record',
    },
    weight: {
      endpoint: '/weight/update-records',
      fields: [
        {name: 'date', type: 'date', label: 'Date', required: true},
        {name: 'weight', type: 'number', label: 'Weight (kg)', required: true},
      ],
      title: 'Edit Weight Record',
    },
    general: {
      endpoint: '/general/update-records',
      fields: [
        {name: 'date', type: 'date', label: 'Date', required: true},
        {name: 'time', type: 'time', label: 'Time', required: true},
        {name: 'notes', type: 'textarea', label: 'Notes', required: true},
      ],
      title: 'Edit General Record',
    },
  };

  const config = recordConfigs[recordType];
  if (!config) {
    return (
      <View style={styles.container}>
        <Text style={{padding: 20}}>Invalid record type</Text>
      </View>
    );
  }

  // Read SelectedPetId from AsyncStorage and fetch pet detail
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('SelectedPetId');
        if (stored) {
          const id = parseInt(stored, 10);
          setSelectedPetId(id);
        }
      } catch (err) {
        console.warn('Error reading SelectedPetId', err);
      }
    };
    init();
  }, []);

  // When selectedPetId changes, fetch pet detail
  useEffect(() => {
    if (selectedPetId) {
      fetchPetDetail(selectedPetId);
    }
  }, [selectedPetId]);

  const fetchPetDetail = async petId => {
    try {
      const data = new FormData();
      data.append('pet_id', petId);
      const resp = await axios.post(
        'https://beingpetz.com/petz-info/public/api/v1/pet/detail',
        data,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      if (resp.data && resp.data.data) {
        setPetDetail(resp.data.data);
      }
    } catch (err) {
      console.warn('fetchPetDetail error', err);
    }
  };

  // Fetch vaccines when editing vaccine-type record and petDetail is available
  useEffect(() => {
    if (recordType === 'vaccines' && petDetail) {
      fetchVaccines();
    }
  }, [recordType, petDetail]);

  const fetchVaccines = async () => {
    try {
      setLoadingVaccines(true);
      const resp = await axios.get(
        'https://beingpetz.com/petz-info/public/api/v1/vaccine/get-all',
      );
      if (resp.data && resp.data.data) {
        const all = resp.data.data;
        const filtered = petDetail?.type
          ? all.filter(
              v =>
                v.pet_type?.toLowerCase() === petDetail.type.toLowerCase() ||
                v.pet_type?.toLowerCase() === 'all',
            )
          : all;
        // map to display strings (keep original object for advanced use if needed)
        const displayList = filtered.flatMap(v =>
          [
            v.core_vaccine
              ? `${v.core_vaccine} - ${v.min_time}weeks - ${v.max_time} weeks`
              : null,
            v.life_style_vaccine || null,
          ].filter(Boolean),
        );
        setVaccines(displayList);
      }
    } catch (err) {
      console.warn('fetchVaccines error', err);
    } finally {
      setLoadingVaccines(false);
    }
  };

  // Prefill formData from recordData on mount
  useEffect(() => {
    if (recordData) {
      // the backend may return different keys; copy only keys present in config fields to avoid extra stuff
      const initial = {...recordData};
      // If API returns image URL, keep it in image state so preview shows
      if (recordData.image) {
        setImage(recordData.image);
      }
      setFormData(initial);
    }
  }, [recordData]);

  const pickImage = async () => {
    try {
      const img = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        includeBase64: false,
        mediaType: 'photo',
      });
      setImage(img.path);
      setFormData(prev => ({...prev, image: img.path}));
    } catch (err) {
      if (!err.message?.includes('cancel')) {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  // Date and time handlers (format same as create form)
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event?.type === 'dismissed') return;
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({...prev, [currentDateField]: formatted}));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event?.type === 'dismissed') return;
    if (selectedTime) {
      const hhmm = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      setFormData(prev => ({...prev, [currentTimeField]: hhmm}));
    }
  };

  const showDatepicker = fieldName => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  const showTimepicker = fieldName => {
    setCurrentTimeField(fieldName);
    setShowTimePicker(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({...prev, [fieldName]: value}));
  };

  const toggleDropdown = fieldName => {
    setCurrentDropdown(fieldName);
    setDropdownVisible(prev => !prev);
  };

  const selectOption = (fieldName, option) => {
    handleInputChange(fieldName, option);
    setDropdownVisible(false);
  };

  const validateForm = () => {
    for (const f of config.fields) {
      if (
        f.required &&
        (formData[f.name] === undefined ||
          formData[f.name] === '' ||
          formData[f.name] === null)
      ) {
        Alert.alert('Validation', `Please fill in ${f.label}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = new FormData();
      // need record id for update
      if (recordData?.id) payload.append('id', recordData.id);

      // append pet id if we have it
      if (selectedPetId) payload.append('pet_id', selectedPetId);

      config.fields.forEach(field => {
        // when image is a local path, append file; when it's already a URL and unchanged, skip or append the URL depending on API
        if (field.type === 'image' && formData[field.name]) {
          // If path looks like http(s) then send as string, else send file
          const val = formData[field.name];
          if (
            typeof val === 'string' &&
            (val.startsWith('http') || val.startsWith('https'))
          ) {
            payload.append(field.name, val);
          } else {
            payload.append(field.name, {
              uri: val,
              type: 'image/jpeg',
              name: 'photo.jpg',
            });
          }
        } else if (formData[field.name] !== undefined) {
          payload.append(field.name, String(formData[field.name]));
        }
      });

      const resp = await axios.post(
        `https://beingpetz.com/petz-info/public/api/v1${config.endpoint}`,
        payload,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (resp.data?.status) {
        Alert.alert('Success', 'Record updated successfully');
        if (onSuccess) onSuccess(resp.data);
        navigation.goBack();
      } else {
        Alert.alert('Error', resp.data?.message || 'Failed to update record');
      }
    } catch (err) {
      console.error('update error', err);
      Alert.alert('Error', err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Render input field generalized
  const renderInputField = field => {
    // Show loader for vaccines dropdown if loading
    if (
      field.type === 'dropdown' &&
      field.optionsSource === 'vaccines' &&
      loadingVaccines
    ) {
      return (
        <View style={styles.fieldInner}>
          <ActivityIndicator />
          <Text style={{marginLeft: 10}}>Loading options...</Text>
        </View>
      );
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextInput
            style={[styles.input, field.multiline && styles.multilineInput]}
            value={formData[field.name] ?? ''}
            onChangeText={text => handleInputChange(field.name, text)}
            placeholder={`Enter ${field.label}`}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
          />
        );
      case 'textarea':
        return (
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData[field.name] ?? ''}
            onChangeText={text => handleInputChange(field.name, text)}
            placeholder={`Enter ${field.label}`}
            multiline
            numberOfLines={4}
          />
        );
      case 'dropdown': {
        const options =
          field.options || (field.optionsSource === 'vaccines' ? vaccines : []);
        return (
          <>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => toggleDropdown(field.name)}
              disabled={field.optionsSource === 'vaccines' && loadingVaccines}>
              <Text>{formData[field.name] || `Select ${field.label}`}</Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
              visible={dropdownVisible && currentDropdown === field.name}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}>
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setDropdownVisible(false)}>
                <View style={styles.dropdownContainer}>
                  <RNScroll showsVerticalScrollIndicator={false}>
                    {options.map((opt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dropdownOption}
                        onPress={() => selectOption(field.name, opt)}>
                        <Text style={styles.dropdownOptionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                    {options.length === 0 && (
                      <View style={{padding: 12}}>
                        <Text>No options available</Text>
                      </View>
                    )}
                  </RNScroll>
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        );
      }
      case 'date':
        return (
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showDatepicker(field.name)}>
            <Text>{formData[field.name] || `Select ${field.label}`}</Text>
          </TouchableOpacity>
        );
      case 'time':
        return (
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showTimepicker(field.name)}>
            <Text>{formData[field.name] || `Select ${field.label}`}</Text>
          </TouchableOpacity>
        );
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text>{image ? 'Change Image' : 'Select Image'}</Text>
            </TouchableOpacity>
            {image ? (
              <Image source={{uri: image}} style={styles.imagePreview} />
            ) : (
              <Text style={{color: '#666', marginTop: 6}}>
                No image selected
              </Text>
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
      <Text style={styles.title}>{config.title}</Text>

      {config.fields.map(field => (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>
            {field.label}
            {!field.required && (
              <Text style={styles.optional}> (optional)</Text>
            )}
          </Text>
          {renderInputField(field)}
        </View>
      ))}

      {showDatePicker && (
        <DateTimePicker
          value={new Date(formData[currentDateField] || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={currentDateField === 'date' ? new Date() : undefined}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={
            new Date(`1970-01-01T${formData[currentTimeField] || '00:00'}`)
          }
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContent: {padding: 20},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  fieldContainer: {marginBottom: 18},
  label: {marginBottom: 8, fontSize: 16, fontWeight: '600', color: '#333'},
  optional: {color: '#666', fontSize: 14},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color:'#333'
  },
  multilineInput: {minHeight: 100, textAlignVertical: 'top'},
  selectContainer: {borderWidth: 1, borderColor: '#ddd', borderRadius: 8},
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  selectText: {fontSize: 16, color: '#333'},
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  imageContainer: {alignItems: 'center'},
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePreview: {width: 200, height: 200, borderRadius: 8},
  submitButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  dropdownTrigger: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 350,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionText: {fontSize: 16},
  fieldInner: {flexDirection: 'row', alignItems: 'center'},
});

export default EditRecordScreen;

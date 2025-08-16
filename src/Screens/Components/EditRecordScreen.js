import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const EditRecordScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recordType, recordData } = route.params;

  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState('');
  const [currentTimeField, setCurrentTimeField] = useState('');

  // Define configuration for each record type
  const recordConfigs = {
    vaccine: {
      endpoint: '/vaccine/update-records',
      fields: [
        { name: 'date', type: 'date', label: 'Date', required: true },
        { name: 'vaccine_name', type: 'text', label: 'Vaccine Name', required: true },
        { name: 'type', type: 'text', label: 'Type', required: true },
        { name: 'reminder_date', type: 'date', label: 'Reminder Date', required: false },
        { name: 'reminder_time', type: 'time', label: 'Reminder Time', required: false },
        { name: 'image', type: 'image', label: 'Image', required: false },
      ],
      title: 'Edit Vaccine Record'
    },
    deworming: {
      endpoint: '/deworming/update-records',
      fields: [
        { name: 'date', type: 'date', label: 'Date', required: true },
        { name: 'deworming_type', type: 'text', label: 'Deworming Type', required: true },
        { name: 'reminder_date', type: 'date', label: 'Reminder Date', required: false },
        { name: 'reminder_time', type: 'time', label: 'Reminder Time', required: false },
        { name: 'image', type: 'image', label: 'Image', required: false },
      ],
      title: 'Edit Deworming Record'
    },
    grooming: {
      endpoint: '/grooming/update-records',
      fields: [
        { name: 'date', type: 'date', label: 'Date', required: true },
        { name: 'grooming_type', type: 'text', label: 'Grooming Type', required: true },
        { name: 'reminder_date', type: 'date', label: 'Reminder Date', required: false },
        { name: 'reminder_time', type: 'time', label: 'Reminder Time', required: false },
        { name: 'image', type: 'image', label: 'Image', required: false },
      ],
      title: 'Edit Grooming Record'
    },
    meal: {
      endpoint: '/meal/update-records',
      fields: [
        { name: 'meal_time', type: 'select', label: 'Meal Time', required: true, 
          options: ['morning', 'afternoon', 'evening', 'night'] },
        { name: 'reminder_date', type: 'date', label: 'Reminder Date', required: false },
        { name: 'reminder_time', type: 'time', label: 'Reminder Time', required: false },
      ],
      title: 'Edit Meal Record'
    },
    weight: {
      endpoint: '/weight/update-records',
      fields: [
        { name: 'date', type: 'date', label: 'Date', required: true },
        { name: 'weight', type: 'number', label: 'Weight (kg)', required: true },
      ],
      title: 'Edit Weight Record'
    },
  };

  const config = recordConfigs[recordType];
  if (!config) {
    return (
      <View style={styles.container}>
        <Text>Invalid record type</Text>
      </View>
    );
  }

  // Initialize form data from the passed record
  useEffect(() => {
    if (recordData) {
      setFormData(recordData);
      if (recordData.image) {
        setImage(recordData.image);
      }
    }
  }, [recordData]);

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 800,
        height: 800,
        cropping: true,
        includeBase64: false,
        mediaType: 'photo',
      });

      setImage(image.path);
      setFormData(prev => ({ ...prev, image: image.path }));
    } catch (err) {
      if (err.message !== 'User cancelled image selection') {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, [currentDateField]: formattedDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const formattedTime = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      setFormData(prev => ({ ...prev, [currentTimeField]: formattedTime }));
    }
  };

  const showDatepicker = (fieldName) => {
    setCurrentDateField(fieldName);
    setShowDatePicker(true);
  };

  const showTimepicker = (fieldName) => {
    setCurrentTimeField(fieldName);
    setShowTimePicker(true);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', recordData.id);

      // Append all fields to formData
      config.fields.forEach(field => {
        if (field.type === 'image' && formData[field.name]) {
          formDataToSend.append(field.name, {
            uri: formData[field.name],
            type: 'image/jpeg',
            name: 'photo.jpg'
          });
        } else if (formData[field.name] !== undefined) {
          formDataToSend.append(field.name, formData[field.name]);
        }
      });

      const response = await axios.post(
        `https://argosmob.com/being-petz/public/api/v1${config.endpoint}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status) {
        Alert.alert('Success', 'Record updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update record');
      }
    } catch (err) {
      console.error('Error updating record:', err);
      Alert.alert('Error', err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (field) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextInput
            style={styles.input}
            value={formData[field.name] || ''}
            onChangeText={(text) => handleInputChange(field.name, text)}
            placeholder={`Enter ${field.label}`}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          />
        );
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                Alert.alert(
                  field.label,
                  null,
                  field.options.map(option => ({
                    text: option,
                    onPress: () => handleInputChange(field.name, option)
                  })))
              }}
            >
              <Text style={styles.selectText}>
                {formData[field.name] || `Select ${field.label}`}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        );
      case 'date':
        return (
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showDatepicker(field.name)}
          >
            <Text>
              {formData[field.name] || `Select ${field.label}`}
            </Text>
          </TouchableOpacity>
        );
      case 'time':
        return (
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showTimepicker(field.name)}
          >
            <Text>
              {formData[field.name] || `Select ${field.label}`}
            </Text>
          </TouchableOpacity>
        );
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickImage}
            >
              <Text>{image ? 'Change Image' : 'Select Image'}</Text>
            </TouchableOpacity>
            {image && (
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{config.title}</Text>
      
      {config.fields.map((field) => (
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
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`1970-01-01T${formData[currentTimeField] || '00:00'}`)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optional: {
    color: '#666',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#8337B2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditRecordScreen;
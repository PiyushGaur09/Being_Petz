// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import petIdEmitter from './PetIdEmitter';
// import axios from 'axios';

// const DailyReminders = ({petId}) => {
//   const [records, setRecords] = useState({
//     vaccinations: [],
//     dewormings: [],
//     groomings: [],
//     weights: [],
//   });

//   console.log('records', upcomingReminders);
//   const [loading, setLoading] = useState({
//     vaccinations: true,
//     dewormings: true,
//     groomings: true,
//     weights: true,
//   });
//   const [error, setError] = useState(null);

//   // Format date for display (e.g., "15th March 2025")
//   const formatReminderDate = dateString => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', {month: 'long'});
//     const year = date.getFullYear();
//     const daySuffix =
//       day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
//     return `${day}${daySuffix} ${month} ${year}`;
//   };

//   // Format time for display (HH:MM AM/PM)
//   const formatTime = timeString => {
//     if (!timeString) return '';
//     const [hours, minutes] = timeString.split(':');
//     const hour = parseInt(hours, 10);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const hour12 = hour % 12 || 12;
//     return `${hour12}:${minutes} ${ampm}`;
//   };

//   // Generic API fetcher
//   const fetchRecords = async (endpoint, recordType) => {
//     try {
//       setLoading(prev => ({...prev, [recordType]: true}));
//       const formData = new FormData();
//       formData.append('pet_id', petId);

//       const response = await axios.post(
//         `https://argosmob.com/being-petz/public/api/v1/${endpoint}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Accept: 'application/json',
//           },
//         },
//       );

//       if (response.data.status && response.data.data) {
//         setRecords(prev => ({
//           ...prev,
//           [recordType]: response.data.data,
//         }));
//       }
//     } catch (err) {
//       console.error(`Error fetching ${recordType}:`, err);
//       setError(`Failed to load ${recordType} records`);
//     } finally {
//       setLoading(prev => ({...prev, [recordType]: false}));
//     }
//   };

//   // Get icon for record type
//   const getIcon = type => {
//     switch (type) {
//       case 'vaccinations':
//         return 'vaccines';
//       case 'dewormings':
//         return 'medical-services';
//       case 'groomings':
//         return 'content-cut';
//       case 'weights':
//         return 'monitor-weight';
//       default:
//         return 'notifications';
//     }
//   };

//   // Combined loading state
//   const isLoading = Object.values(loading).some(val => val);

//   // Get upcoming reminders from all records
//   const getTodaysReminders = () => {
//     const today = new Date().toISOString().split('T')[0]; // Format: yyyy-mm-dd
//     const reminders = [];

//     const recordTypes = ['vaccinations', 'dewormings', 'groomings', 'weights'];
//     const colors = {
//       vaccinations: '#FFF9C4', // Light yellow
//       dewormings: '#CCF5E1', // Light mint
//       groomings: '#E6F0FF', // Light blue
//       weights: '#FCE4EC', // Optional for weight
//     };

//     recordTypes.forEach(type => {
//       const item = records[type].find(r => r.reminder_date === today);
//       if (item) {
//         let title = '';
//         if (type === 'vaccinations') {
//           title = 'Next Vaccination';
//         } else if (type === 'dewormings') {
//           title = 'Next Deworming';
//         } else if (type === 'groomings') {
//           title = 'Grooming';
//         } else if (type === 'weights') {
//           title = 'Weight Check';
//         }

//         reminders.push({
//           id: `${type}-${item.id}`,
//           title,
//           date: formatReminderDate(item.reminder_date),
//           icon: getIcon(type),
//           color: colors[type] || '#F3F3F3',
//         });
//       }
//     });

//     return reminders;
//   };

//   // Fetch all data when component mounts or petId changes
//   useEffect(() => {
//     if (petId) {
//       fetchRecords('vaccine/all-records', 'vaccinations');
//       fetchRecords('deworming/all-records', 'dewormings');
//       fetchRecords('grooming/all-records', 'groomings');
//       fetchRecords('weight/all-records', 'weights');
//     }

//     // Set up listener for pet changes
//     const changeHandler = () => {
//       if (petId) {
//         fetchRecords('vaccine/all-records', 'vaccinations');
//         fetchRecords('deworming/all-records', 'dewormings');
//         fetchRecords('grooming/all-records', 'groomings');
//         fetchRecords('weight/all-records', 'weights');
//       }
//     };

//     petIdEmitter.on('petIdChanged', changeHandler);

//     return () => {
//       petIdEmitter.off('petIdChanged', changeHandler);
//     };
//   }, [petId]);

//   if (isLoading) {
//     return (
//       <View style={[styles.container, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color="#8337B2" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.container, styles.errorContainer]}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() =>
//             petId &&
//             Object.keys(records).forEach(type =>
//               fetchRecords(`${type}/all-records`, type),
//             )
//           }>
//           <Text style={styles.retryText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const upcomingReminders = getTodaysReminders();

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Daily Reminders</Text>

//         {upcomingReminders.length > 0 ? (
//           upcomingReminders.map(reminder => (
//             <View
//               key={reminder.id}
//               style={[styles.reminderItem, {backgroundColor: reminder.color}]}>
//               <View style={styles.reminderContent}>
//                 <Icon
//                   name={reminder.icon}
//                   size={20}
//                   color="#8337B2"
//                   style={styles.icon}
//                 />
//                 <View style={styles.reminderTextContainer}>
//                   <Text style={styles.reminderTitle}>{reminder.title}</Text>
//                   <Text style={styles.reminderDate}>
//                     {reminder.date} {reminder.time && `at ${reminder.time}`}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noRemindersText}>No upcoming reminders</Text>
//         )}

//         {/* <View style={styles.divider} /> */}

//         {/* <TouchableOpacity style={styles.createButton}>
//           <Icon name="add" size={20} color="#fff" />
//           <Text style={styles.createButtonText}>Create Reminder</Text>
//         </TouchableOpacity> */}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9EFFF',
//     padding: 20,
//     width: '100%',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//   },
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: '#8337B2',
//     padding: 10,
//     borderRadius: 5,
//   },
//   retryText: {
//     color: 'white',
//   },
//   section: {
//     backgroundColor: '#F9EFFF',
//     borderRadius: 16,
//     paddingVertical: 16,
//     marginBottom: 20,
//     // shadowColor: '#000',
//     // shadowOffset: {width: 0, height: 2},
//     // shadowOpacity: 0.1,
//     // shadowRadius: 4,
//     // elevation: 3,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#0A0909',
//     marginBottom: 16,
//   },
//   reminderItem: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   reminderContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   icon: {
//     marginRight: 12,
//   },
//   reminderTextContainer: {
//     flex: 1,
//   },
//   reminderTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0A0909',
//     marginBottom: 4,
//   },
//   reminderDate: {
//     fontSize: 14,
//     color: '#9B9B9B',
//   },
//   noRemindersText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     paddingVertical: 20,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#eee',
//     marginVertical: 16,
//   },
//   createButton: {
//     flexDirection: 'row',
//     backgroundColor: '#8337B2',
//     padding: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   createButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//     marginLeft: 8,
//   },
// });

// export default DailyReminders;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import petIdEmitter from './PetIdEmitter';
import axios from 'axios';
import LottieLoader from './LottieLoader';

const DailyReminders = ({petId}) => {
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

  // Format date for display (e.g., "15th March 2025")
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

  // Format time for display (HH:MM AM/PM)
  const formatTime = timeString => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generic API fetcher
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

  // Get icon for record type
  const getIcon = type => {
    switch (type) {
      case 'vaccinations':
        return 'vaccines';
      case 'dewormings':
        return 'medical-services';
      case 'groomings':
        return 'content-cut';
      case 'weights':
        return 'monitor-weight';
      default:
        return 'notifications';
    }
  };

  // Combined loading state
  const isLoading = Object.values(loading).some(val => val);

  // Get all reminders from all records
  const getAllReminders = () => {
    const reminders = [];
    const colors = {
      vaccinations: '#FFF9C4', // Light yellow
      dewormings: '#CCF5E1', // Light mint
      groomings: '#E6F0FF', // Light blue
      weights: '#FCE4EC', // Light pink
    };

    // Process each record type
    Object.entries(records).forEach(([type, items]) => {
      items.forEach(item => {
        let title = '';
        if (type === 'vaccinations') {
          title = 'Vaccination';
        } else if (type === 'dewormings') {
          title = 'Deworming';
        } else if (type === 'groomings') {
          title = 'Grooming';
        } else if (type === 'weights') {
          title = 'Weight Check';
        }

        if (item.reminder_date) {
          reminders.push({
            id: `${type}-${item.id}`,
            title,
            date: formatReminderDate(item.reminder_date),
            time: item.reminder_time ? formatTime(item.reminder_time) : '',
            icon: getIcon(type),
            color: colors[type] || '#F3F3F3',
            type,
          });
        }
      });
    });

    // Sort reminders by date (newest first)
    return reminders.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fetch all data when component mounts or petId changes
  useEffect(() => {
    if (petId) {
      fetchRecords('vaccine/all-records', 'vaccinations');
      fetchRecords('deworming/all-records', 'dewormings');
      fetchRecords('grooming/all-records', 'groomings');
      fetchRecords('weight/all-records', 'weights');
    }

    // Set up listener for pet changes
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

  const allReminders = getAllReminders();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>All Reminders</Text>

        {allReminders.length > 0 ? (
          allReminders.map(reminder => (
            <View
              key={reminder.id}
              style={[styles.reminderItem, {backgroundColor: reminder.color}]}>
              <View style={styles.reminderContent}>
                <Icon
                  name={reminder.icon}
                  size={20}
                  color="#8337B2"
                  style={styles.icon}
                />
                <View style={styles.reminderTextContainer}>
                  <Text
                    style={
                      styles.reminderTitle
                    }>{`Next ${reminder.title}`}</Text>
                  <Text style={styles.reminderDate}>
                    {reminder.date} {reminder.time && `at ${reminder.time}`}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noRemindersText}>No reminders found</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFFF',
    padding: 20,
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
  },
  section: {
    backgroundColor: '#F9EFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A0909',
    marginBottom: 16,
  },
  reminderItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0909',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    color: '#9B9B9B',
  },
  noRemindersText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DailyReminders;

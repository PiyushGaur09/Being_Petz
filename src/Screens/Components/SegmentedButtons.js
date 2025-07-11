import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DailyReminders from './DailyRemainder';
import Records from './PetsRecords';

const Segment = ({petData}) => {
  const [activeTab, setActiveTab] = useState('Records');

  // Calculate age from petData.dob
  const calculateAge = dob => {
    if (!dob) return 'Age not specified';
    const birthDate = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      months += 12;
    }
    return `${years} Year${years !== 1 ? 's' : ''} ${months} Month${
      months !== 1 ? 's' : ''
    }`;
  };

  // Dynamic profile data based on petData
  const profileData = [
    {
      label: 'Name of Pet',
      value: petData?.name || 'Not specified',
      bgColor: '#ffffcc',
    },
    {label: 'Age', value: calculateAge(petData?.dob), bgColor: '#c8f4ea'},
    {
      label: 'Breed',
      value: petData?.breed || 'Not specified',
      bgColor: '#fcd7fc',
    },
    {
      label: 'Gender',
      value: petData?.gender
        ? petData.gender.charAt(0).toUpperCase() + petData.gender.slice(1)
        : 'Not specified',
      bgColor: '#d4f4bc',
    },
    {
      label: 'Bio',
      value: petData?.bio || 'No bio available',
      bgColor: '#e6e6fa',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Records':
        return <Records petId={petData?.id} />;
      case 'Reminder':
        return <DailyReminders petId={petData?.id} />;
      case 'Profile':
        return (
          <View style={styles.profileContainer}>
            {profileData.map((item, index) => (
              <View
                key={index}
                style={[styles.card, {backgroundColor: item.bgColor}]}>
                <Text style={styles.label}>
                  {item.label}{' '}
                  {/* <MaterialIcons name="edit" size={14} color="black" /> */}
                </Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Records', 'Reminder', 'Profile'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFFF',
    marginTop: 40,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    // borderRadius:20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9EFFF',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderRadius:20
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  profileContainer: {
    width: '90%',
    marginTop: 20,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#2D384C',
  },
  tabContent: {
    width: '90%',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});

export default Segment;

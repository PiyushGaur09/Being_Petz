import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ChatHeader = ({community, onBack}) => {
  const [communityData, setCommunityData] = useState(null);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join ${community.name} on Being Petz!`,
        url: 'https://your-app-link.com', // Replace with your actual app URL
        title: `${community.name} Community`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const formData = new FormData();
        formData.append('community_id', community?.id);

        const response = await axios.post(
          'https://argosmob.uk/being-petz/public/api/v1/pet/community/details',
          formData,
          {
            headers: {'Content-Type': 'multipart/form-data'},
          },
        );

        if (response.data.status) {
          setCommunityData(response.data.data);
        } else {
          setError('Failed to fetch community details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [community]);
  const navigation = useNavigation();

  // console.log('Community', communityData);
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={onBack}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{
              uri: `https://argosmob.uk/being-petz/public/${communityData?.profile}`,
            }}
            style={styles.profileImage}
            defaultSource={require('../../../Assests/Images/dog.png')}
          />
          <TouchableOpacity
            style={styles.headerText}
            onPress={() => {
              navigation.navigate('CommunityInfo', {community: community});
            }}>
            <Text style={styles.headerName}>{community.name}</Text>
            <Text style={styles.membersCount}>
              {communityData?.members?.length || 0} members
            </Text>
            <Text style={styles.headerStatus}>tap here for contacts info</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8337B2',
    paddingTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 15,
    borderWidth: 0.5,
    borderColor: '#111',
  },
  headerText: {
    // flex: 1,
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  membersCount: {
    fontSize: 14,
    color: '#fff',
  },
});

export default ChatHeader;

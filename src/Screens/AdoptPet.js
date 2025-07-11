import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import Header from './Components/Header';
import CommonHeader from './Components/CommonHeader';
import FriendRequestsModal from './Components/FriendRequestsModal';
import BannerCarousel from './Components/BannerCarousel';

const AdoptPet = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  console.log('Pets', pets);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(
          'https://argosmob.uk/being-petz/public/api/v1/pet/all-adoptions',
          {
            method: 'POST',
          },
        );
        const data = await response.json();
        if (data.status) {
          setPets(data.data.data); // Set the fetched pets data
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };

    fetchPets();
  }, []);

  return (
    <View style={styles.container}>
      <CommonHeader
        onChatPress={() => navigation.navigate('Chats')}
        onPeoplePress={() => setModalVisible(true)}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
          marginHorizontal: 16,
        }}>
        <Text style={{fontSize: 20, fontWeight: '700',color:'#8337B2'}}>Pets For Adoption</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('GiveForAdoption');
          }}
          style={{backgroundColor: '#8337B2', padding: 10, borderRadius: 8}}>
          <Text style={{color: '#fff'}}>Find a forever home</Text>
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
        <FlatList
          data={pets}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={
            <BannerCarousel/>
          }
          renderItem={({item}) => {
            const petDOB = item.dob ? new Date(item.dob) : null;
            const age =
              petDOB && !isNaN(petDOB)
                ? `${Math.floor(
                    (new Date() - petDOB) / (1000 * 60 * 60 * 24 * 30.44),
                  )} months`
                : 'Unknown age';

            const handleShare = async item => {
              try {
                const imageUrl = item.images?.[0]
                  ? `${BASE_URL}/${item.images[0]}`
                  : '';

                const message = `
                    Lost Pet Alert 🐾

                    Breed: ${item.breed || 'Unknown Breed'}
                    Description: ${
                      item.description || 'No description provided'
                    }
                    Location: ${item.location || 'Unknown'}
                    Date Lost: ${item.lost_date || 'Unknown'}
                    Age: ${item.dob ? age : 'Unknown'}

                    ${imageUrl ? 'Photo: ' + imageUrl : ''}

                    Please help reunite this pet with its owner! 🐶🐱
                        `;

                await Share.share({
                  message,
                });
              } catch (error) {
                console.error('Error sharing pet info:', error);
              }
            };

            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PetAdoptionDetails', {pet:item});
                }}
                style={styles.card}>
                <Image
                  source={{
                    uri: item.featured_image
                      ? `https://argosmob.uk/being-petz/public/${item.featured_image}`
                      : 'https://demofree.sirv.com/nope-not-here.jpg',
                  }}
                  style={styles.petImage}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}>
                  <View>
                    <Text style={styles.petName}>{item.pet_name}</Text>
                    <Text style={styles.petAge}>{age}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="send"
                      size={20}
                      color="#000"
                      onPress={() => handleShare(item)}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default AdoptPet;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},
  petImage: {width: '100%', height: 220, borderRadius: 15},
  petName: {fontSize: 18, fontWeight: '700', marginTop: 5},
  petAge: {fontSize: 14, color: '#555'},
  iconContainer: {
    justifyContent: 'center',
    marginTop: 5,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
  },
});

import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import Header from './Components/Header';
import FriendRequestsModal from './Components/FriendRequestsModal';

const Add = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View>
        <Header
          onChatPress={() => navigation.navigate('Chats')}
          onPeoplePress={() => setModalVisible(true)}
        />
      </View>
      {/* <View style={styles.header}>
        <Image
          source={{
            uri: 'https://s3-alpha-sig.figma.com/img/233d/0e10/14d7cbe3ab43c4434f2c2388840475bb?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=JwFYok-t9siJbatiSUlw8mr4Kv1CbcixB6Df13pUDwBkvSDc2sjuyzIMWqfGD1OU8ns~bugKAPrmxie4pNxGNlll0OzPhKjTvHHpFbycQGekiMXQWJlTvkBBBCFR55MaxRBpPRobLDCZTz-3Nbp80pgj7A-b-OMt~T8eTCSdqlu-uXVk8t4FO0rayRPBeuDwSRcf20ni0uObxBWV3YMg1ajMVn~aZlUa1Ee034FX-TsDIanbYGkiU8imXfYqYafS1molVaYPcPADlePv76VJK9S0bHjJE10hEl9QipAqvBGcUjjet6fZ0ODTA8MqVzHyBPIZEDW14ZlLFi7SvVQSHQ__',
          }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.name}>Tom ♂</Text>
          <Text style={styles.breed}>German Shepherd</Text>
          <Text style={styles.age}>2 Year 3 months Old</Text>
        </View>
        <Icon
          name="bell-outline"
          size={24}
          color="#000"
          style={styles.notificationIcon}
        />
      </View> */}
      <View
        style={{
          flex: 1,
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 150,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AdoptPet');
          }}>
          <Image source={require('../Assests/Images/AdoptPet.png')} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('LostPet');
          }}>
          <Image source={require('../Assests/Images/Lost&Found.png')} />
        </TouchableOpacity>
      </View>
      <FriendRequestsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  name: {fontSize: 18, fontWeight: 'bold'},
  breed: {fontSize: 14, color: '#555'},
  age: {fontSize: 12, color: '#777'},
  notificationIcon: {marginLeft: 'auto'},
});

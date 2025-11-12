import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const userProfile = {
  name: 'Tom',
  breed: 'German Shepperd',
  age: '2 Year 3 months Old',
  image:
    'https://s3-alpha-sig.figma.com/img/233d/0e10/14d7cbe3ab43c4434f2c2388840475bb?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=JwFYok-t9siJbatiSUlw8mr4Kv1CbcixB6Df13pUDwBkvSDc2sjuyzIMWqfGD1OU8ns~bugKAPrmxie4pNxGNlll0OzPhKjTvHHpFbycQGekiMXQWJlTvkBBBCFR55MaxRBpPRobLDCZTz-3Nbp80pgj7A-b-OMt~T8eTCSdqlu-uXVk8t4FO0rayRPBeuDwSRcf20ni0uObxBWV3YMg1ajMVn~aZlUa1Ee034FX-TsDIanbYGkiU8imXfYqYafS1molVaYPcPADlePv76VJK9S0bHjJE10hEl9QipAqvBGcUjjet6fZ0ODTA8MqVzHyBPIZEDW14ZlLFi7SvVQSHQ__', // Replace with actual URL
};

const communities = [
  {
    id: '1',
    name: 'Dog Focused',
    image:
      'https://s3-alpha-sig.figma.com/img/59c5/922f/7943c4109b3df020db63c324ae05fd90?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Oxkm62u658DKSJvpkHK9J98BYVLql9GWrkQVmgAZrLTe9jWY40JUM2ZK1D702PWec5B22i2JbOLimUs2BPPmrvNA3sbAv0AmchqD2k2XirGwoCytQM0q9aAGe88ymon07Z~wQuZ6W874s9nrdCv9mR7LLi6TM1LaWeVat7YoCwm9lk2AO2EdxoO5OZNm3g2ZcpNltemSl7WJmwVJNk~oKKDop8HWa7bfs6cs-89PWuyiyMnnr-YDlyyBxX3xMBRuygFCyPD5oRxiSpjfMF9-GCwz0OGGdeJTbuU6EpqxKU2dW1w6ZnxM4-MN-NrTDZBqYWjO4ZhibrDCa~e4MeHh1w__',
  },
  {
    id: '2',
    name: 'Cat Lovers',
    image:
      'https://s3-alpha-sig.figma.com/img/5e93/8fd8/42943dc324af7f0d1e02f4928fc3adea?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=tUhQxQ1w5XJiyg0hQGKcOgUTuL5E7Y-hv7lelo2pvzBV3fZ9VTMwmVfpZBPeXyLls~HpldzF4LRZpsq6TPLb~T3vvCNUJ0tLLXaMA8X7DqwroLx5F1oKnP6XAwteQyNvpVMQ5fK0pGov7I0GfkuzmezpZSLmCRom6vnEE4~cYd8mS3OrThsRq6cmC3G4Jeib29xXx9Ex4ZHCDQNqYnUrb9tlPQSbrnJPw3Pu4QOJiErUKuuHQ18WoZMyVUj3pOghaRfTwBV0zdU3~a4pWPrHyAIBLb7bpkkVxP8d3Yba~yyrCP5AThcZXZlUCU6SrCxznomyyXM-tCQYgCwDS96OvA__',
  },
  {
    id: '3',
    name: 'Danger world',
    image:
      'https://s3-alpha-sig.figma.com/img/a7e1/41d5/fecb8bdff7e3ae370ea062775c687ae2?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=f4rmJw5fkIQ5cTE7h566Iizi8d1tTio9ZSDHPLEONuM19NTa7Kb1~ANQ3pKGzG7-AqOqiIXZeyCzAGmLzZwgCSnGCnZfjscHjKJDUnL3KNicGLL19sjsrgiIkXMppKr~kICnXWTdTBc6hia-Mi5MckHhWH93Xuht243E58nQwrWXqQkwxDTEeJVHErO6akOnm8Hr-7-q~IZ6OSSg7XelPnGPpM5PL3NDFlZfzswae4PoXNq9s5jTxYOcHXX7IieTnMxdBmiKA1cksNT25Xizglk2sprwTrvg7k7tBN7GB0N0aZPo3-2ZLSj50yCGqmfmLU1c0vffrU-gxFAtd29Y0A__',
  },
  {id: '4', name: 'Friendly Vibe', image: 'https://your-friendly-image.com'},
];

const chats = [
  {
    id: '1',
    name: 'Doberman wing',
    message: "Let's meet today on green park we...",
    time: '04:13',
    unread: 1,
    image:
      'https://s3-alpha-sig.figma.com/img/59c5/922f/7943c4109b3df020db63c324ae05fd90?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Oxkm62u658DKSJvpkHK9J98BYVLql9GWrkQVmgAZrLTe9jWY40JUM2ZK1D702PWec5B22i2JbOLimUs2BPPmrvNA3sbAv0AmchqD2k2XirGwoCytQM0q9aAGe88ymon07Z~wQuZ6W874s9nrdCv9mR7LLi6TM1LaWeVat7YoCwm9lk2AO2EdxoO5OZNm3g2ZcpNltemSl7WJmwVJNk~oKKDop8HWa7bfs6cs-89PWuyiyMnnr-YDlyyBxX3xMBRuygFCyPD5oRxiSpjfMF9-GCwz0OGGdeJTbuU6EpqxKU2dW1w6ZnxM4-MN-NrTDZBqYWjO4ZhibrDCa~e4MeHh1w__',
  },
  {
    id: '2',
    name: 'Doberman wing',
    message: "Let's meet today on green park we...",
    time: '04:13',
    unread: 1,
    image:
      'https://s3-alpha-sig.figma.com/img/5e93/8fd8/42943dc324af7f0d1e02f4928fc3adea?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=tUhQxQ1w5XJiyg0hQGKcOgUTuL5E7Y-hv7lelo2pvzBV3fZ9VTMwmVfpZBPeXyLls~HpldzF4LRZpsq6TPLb~T3vvCNUJ0tLLXaMA8X7DqwroLx5F1oKnP6XAwteQyNvpVMQ5fK0pGov7I0GfkuzmezpZSLmCRom6vnEE4~cYd8mS3OrThsRq6cmC3G4Jeib29xXx9Ex4ZHCDQNqYnUrb9tlPQSbrnJPw3Pu4QOJiErUKuuHQ18WoZMyVUj3pOghaRfTwBV0zdU3~a4pWPrHyAIBLb7bpkkVxP8d3Yba~yyrCP5AThcZXZlUCU6SrCxznomyyXM-tCQYgCwDS96OvA__',
  },
  {
    id: '3',
    name: 'Doberman wing',
    message: "Let's meet today on green park we...",
    time: '04:13',
    unread: 1,
    image:
      'https://s3-alpha-sig.figma.com/img/a7e1/41d5/fecb8bdff7e3ae370ea062775c687ae2?Expires=1743984000&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=f4rmJw5fkIQ5cTE7h566Iizi8d1tTio9ZSDHPLEONuM19NTa7Kb1~ANQ3pKGzG7-AqOqiIXZeyCzAGmLzZwgCSnGCnZfjscHjKJDUnL3KNicGLL19sjsrgiIkXMppKr~kICnXWTdTBc6hia-Mi5MckHhWH93Xuht243E58nQwrWXqQkwxDTEeJVHErO6akOnm8Hr-7-q~IZ6OSSg7XelPnGPpM5PL3NDFlZfzswae4PoXNq9s5jTxYOcHXX7IieTnMxdBmiKA1cksNT25Xizglk2sprwTrvg7k7tBN7GB0N0aZPo3-2ZLSj50yCGqmfmLU1c0vffrU-gxFAtd29Y0A__',
  },
];

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{uri: userProfile.image}} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile.name} ♂</Text>
          <Text style={styles.profileDetails}>{userProfile.breed}</Text>
          <Text style={styles.profileDetails}>{userProfile.age}</Text>
        </View>
        <Ionicons
          name="notifications-outline"
          size={24}
          color="black"
          style={styles.bellIcon}
        />
      </View>

      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#888" />
          <TextInput placeholder="Search" style={styles.searchInput} />
        </View>

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Community</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.chatItem}>
            <Image source={{uri: item.image}} style={styles.chatImage} />
            <View style={styles.chatDetails}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatMessage}>{item.message}</Text>
            </View>
            <View style={styles.chatTimeContainer}>
              <Text style={styles.chatTime}>{item.time}</Text>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FDBD4E', padding: 10},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  profileInfo: {flex: 1},
  profileName: {fontSize: 18, fontWeight: 'bold'},
  profileDetails: {fontSize: 12, color: '#555'},
  bellIcon: {padding: 10},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {fontSize: 16,color:'#333'},

  communityContainer: {
    paddingVertical: 10,
  },

  createCommunity: {
    height: 60,
    width: 60,
    backgroundColor: '#1F2937',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  communityItem: {
    alignItems: 'center',
    marginRight: 15,
  },

  communityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },

  communityText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    width: 70, // Ensures text doesn't overflow
  },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  chatDetails: {flex: 1},
  chatName: {fontSize: 16, fontWeight: 'bold'},
  chatMessage: {fontSize: 12, color: '#666'},
  chatTimeContainer: {alignItems: 'flex-end'},
  chatTime: {fontSize: 12, color: '#666'},
  unreadBadge: {
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  unreadText: {color: 'white', fontSize: 12, fontWeight: 'bold'},

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  createButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;

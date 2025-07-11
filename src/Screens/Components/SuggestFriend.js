import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const friendRequests = [
  {
    id: '1',
    name: 'Vanny',
    mutualFriends: 5,
    image:
      'https://s3-alpha-sig.figma.com/img/3d4b/1e6e/a4dfabf6977ab9cab759d8ef34eb2576?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=f55jAnYFT4yFfQpLd8Mtu1Q4qxhBGko~L6tF9peSSa1Ckg5FVxBS6opHsfZBEpDmMPPgKSNBra3Qqyr7ZGfuaWfXi8Kc7Xg6n5lcbepz6CiiFXSxBPBSsfpALN6MhQU5xB3ABXhtmd6x30diR-qD4jJmFo0-35RLPQMdg8XhcUQz7L-MxBLmprcPFi5cL9NZd2462Hbb1MMKwUyxgCZhBZQvPRLVqN~kfnMY3YZ2M1PzEuyyGxDFwmvU3gaPzLLrFUHfmRGFyBUpD1b8newK4h9FxPs2Aypeu8o3qjNbbg7GnO0Zi1ZsslpHvpaoYFSkb0CYO49FoazkAs~FhzKRgw__', // Replace with actual URLs
  },
  {
    id: '2',
    name: 'Vanny',
    mutualFriends: 5,
    image:
      'https://s3-alpha-sig.figma.com/img/5e93/8fd8/42943dc324af7f0d1e02f4928fc3adea?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=eC8-ziVkZ0V9x7OoBx1iahTfc8bfFz7obVUd~2jv2XsvMxLomd2XovgDw~b~mzv9Xl2Hi6-ZwFtrMFc4IuZPjyr8Iyf2eOfLfa0pl1TgqF8mgxpshLMk9-zdBffECyiApcsAARJD3RobkXllpte450thzXoEMf~y~gAEImuP9oc8qlnCEXKEqg~n3OqLay4lDwJ-PXtsAGWSXpeMt3Vfy6R90b0URvQcV1oeszE4I1oB8SFpFyLLEX~AIycPtK472pX8tICAe0a4F-XNT~62Mkp~hfFtAMmueWQnR3dInVoCl3f5ZVGK1M3BSD5jU5X7JOVKpqCimLTjjMorOQWHMg__',
  },
  {
    id: '3',
    name: 'Vanny',
    mutualFriends: 5,
    image:
      'https://s3-alpha-sig.figma.com/img/9d57/9986/27fbe3d441cf88251d6d1725709480c7?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=JwDLx4r2oNyKkVA62j0hpK3wEJZbf04DlNKdJjaMyLw-fJPLld~6XY9op7P3HqzDrsGgJNln~~hDNkaHsjVyfASUoGXSPdgBJuuuGlaaTRyCkWgz4Sy7~33sjr8UgWc~hdJ76XT5pI7NRhfkYz4H6z9d4ylOCY7X1aE0SpoHqtVjdVimhS17lZKRhWwUHjD4R5IW183huHBEA6n4JR6H5--tRmhve5spzimsJzj44udoAb9e39watQHwPukKrZmUwPQ05tbpXnSf4NjcnfuHlC5QNyXLjlNqirnI3kC3nUh~MolXj1n6QyL3A4Ab1O-E0X4BQRQg7mC9fXgnLEB-dw__',
  },
];

const SuggestFriend = () => {
  return (
    <FlatList
      horizontal
      data={friendRequests}
      keyExtractor={item => item.id}
      contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 0}}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Image source={{uri: item.image}} style={styles.profileImage} />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.mutualFriends}>
            {item.mutualFriends} mutual friends
          </Text>
          <TouchableOpacity style={styles.requestButton}>
            <Text style={styles.requestText}>Send Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  suggestFriendcard: {
    width: 150,
    backgroundColor: '#EEF6FF',
    borderRadius: 15,
    padding: 10,
    // alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestFriendprofileImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  suggestFriendname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestFriendmutualFriends: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  suggestFriendrequestButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  suggestFriendrequestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestFriendremoveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8337B2',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  suggestFriendremoveText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SuggestFriend;

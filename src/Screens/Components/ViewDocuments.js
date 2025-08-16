// import {View, Text} from 'react-native';
// import React from 'react';

// const ViewDocuments = ({route}) => {
//   console.log('route', route.params);
//   return (
//     <View>
//       <Text>ViewDocuments</Text>
//     </View>
//   );
// };

// export default ViewDocuments;

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ViewDocuments = ({route}) => {
  const {document, name} = route.params;
  console.log('Docs', document);
  const primaryColor = '#8337B2';
  const navigation = useNavigation();

  console.log('jjjj', document, name);

  const renderDocumentItem = ({item}) => (
    <View
      style={[
        styles.documentCard,
        {borderLeftColor: item.bg_color || primaryColor},
      ]}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{item.vaccine_name}</Text>
        <Text style={styles.documentType}>{item.type}</Text>
      </View>

      <Text style={styles.documentDate}>Date: {item.date}</Text>

      {item.reminder_date && (
        <Text style={styles.documentReminder}>
          Reminder: {item.reminder_date} at {item.reminder_time}
        </Text>
      )}

      {item.image_path && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ImageViewer', {imageUrl: item.image_path})
          }
          style={styles.imageContainer}>
          <Image
            source={{
              uri: `https://argosmob.com/being-petz/public/${item.image_path}`,
            }}
            style={styles.documentImage}
            resizeMode="cover"
          />
          <Text style={[styles.viewText, {color: primaryColor}]}>
            View Image
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={[styles.header, {backgroundColor: primaryColor}]}>
        <Text style={styles.headerText}>{name}</Text>
      </View> */}

      <View style={[styles.header, {backgroundColor: primaryColor}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingRight: 40}}>
          <Icon name={'arrow-left'} size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{name}</Text>
      </View>

      {/* Documents List */}
      <FlatList
        data={document}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    paddingTop: 40,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    // justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  documentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentType: {
    fontSize: 14,
    color: '#666',
  },
  documentDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  documentReminder: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
  },
  viewText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default ViewDocuments;

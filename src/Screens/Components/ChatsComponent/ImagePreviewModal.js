// import React, { useState } from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
// import ImagePicker from 'react-native-image-crop-picker';
// import { sendImageMessage } from './chatApiService';

// const ImageSender = ({ communityId, userId }) => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [sending, setSending] = useState(false);

//   const pickImage = async () => {
//     try {
//       const image = await ImagePicker.openPicker({
//         mediaType: 'photo',
//         quality: 0.8,
//       });
//       setSelectedImage(image);
//     } catch (err) {
//       console.error('Image picker error:', err);
//     }
//   };

//   const handleSend = async () => {
//     if (!selectedImage) return;
//     try {
//       setSending(true);
//       const status = await sendImageMessage(communityId, userId, selectedImage);
//       console.log('Image sent:', status);
//       // Reset UI after sending
//       setSelectedImage(null);
//     } catch (err) {
//       console.error('Failed to send image:', err);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
//         <Text style={styles.buttonText}>Pick Image</Text>
//       </TouchableOpacity>

//       {selectedImage && (
//         <View style={styles.previewContainer}>
//           <Image source={{ uri: selectedImage.path }} style={styles.previewImage} />
//           <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
//             <Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send'}</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   pickButton: {
//     backgroundColor: '#8337B2',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sendButton: {
//     backgroundColor: '#28a745',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   previewContainer: {
//     alignItems: 'center',
//   },
//   previewImage: {
//     width: 300,
//     height: 300,
//     resizeMode: 'contain',
//     marginBottom: 10,
//   },
// });

// export default ImageSender;


import React from 'react';
import { Modal, View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const ImagePreviewModal = ({ visible, imageUri, onSend, onCancel, isUploading }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={onSend}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  previewContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ImagePreviewModal;
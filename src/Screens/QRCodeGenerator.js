// import React, {useState, useEffect} from 'react';
// import {View, TextInput, Button, StyleSheet} from 'react-native';
// import QRCode from 'react-native-qrcode-svg';

// const QRCodeGenerator = ({route}) => {
//   const {data} = route.params;
//   const [text, setText] = useState('');
//   const [valueToEncode, setValueToEncode] = useState('');

//   // This will run when the component mounts
//   useEffect(() => {
//     setValueToEncode(
//       `https://argosmob.uk/being-petz/public/${data}/show-parent-detail`,
//     );
//   }, [data]); // The effect depends on the 'data' prop

//   return (
//     <View style={styles.container}>
//       {/* <TextInput
//         placeholder="Enter text to generate QR"
//         value={text}
//         onChangeText={setText}
//         style={styles.input}
//       />
//       <Button
//         title="Generate QR Code"
//         onPress={() =>
//           setValueToEncode(
//             `https://argosmob.uk/being-petz/public/${data}/show-parent-detail`,
//           )
//         }
//       /> */}
//       {valueToEncode !== '' && (
//         <View style={styles.qrWrapper}>
//           <QRCode value={valueToEncode} size={200} />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   input: {borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 8},
//   qrWrapper: {marginTop: 30, alignItems: 'center'},
// });

// export default QRCodeGenerator;

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const QRCodeGenerator = ({route}) => {
  const {data} = route.params;
  const [valueToEncode, setValueToEncode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const qrCodeRef = useRef();

  useEffect(() => {
    setValueToEncode(
      `https://argosmob.uk/being-petz/public/${data}/show-parent-detail`,
    );
    checkPermission();
  }, [data]);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let granted;
        if (Platform.Version >= 33) {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Media Permission',
              message: 'App needs access to your media to save QR code images',
              buttonPositive: 'OK',
            },
          );
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to save QR codes',
              buttonPositive: 'OK',
            },
          );
        }
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
        return false;
      }
    } else {
      setHasPermission(true); // iOS auto-handles it
      return true;
    }
  };

  const downloadQRCode = async () => {
  const permissionGranted = await checkPermission();
  if (!permissionGranted) {
    Alert.alert(
      'Permission Required',
      'Storage permission is required to save the QR code.',
      [{ text: 'OK' }],
    );
    return;
  }

  try {
    const uri = await captureRef(qrCodeRef, {
      format: 'png',
      quality: 1,
    });

    await CameraRoll.save(uri, { type: 'photo' });
    Alert.alert('Success', 'QR code saved to your gallery!');
    
  } catch (error) {
    console.error('Error saving QR code:', error);
    Alert.alert('Error', 'Failed to save QR code. Please try again.');
  }
};


  return (
    <View style={styles.container}>
      {valueToEncode !== '' && (
        <View style={styles.qrContainer}>
          <View ref={qrCodeRef} collapsable={false}>
            <QRCode value={valueToEncode} size={200} />
          </View>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={downloadQRCode}>
            <Text style={styles.downloadButtonText}>Download QR Code</Text>
          </TouchableOpacity>
          {!hasPermission && (
            <Text style={styles.permissionText}>
              Storage permission required to save QR codes
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    marginTop: 30,
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    marginTop: 10,
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default QRCodeGenerator;

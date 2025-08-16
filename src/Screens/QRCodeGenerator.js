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
//       `https://argosmob.com/being-petz/public/${data}/show-parent-detail`,
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
//             `https://argosmob.com/being-petz/public/${data}/show-parent-detail`,
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

// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Text,
//   PermissionsAndroid,
//   Alert,
//   Platform,
// } from 'react-native';
// import QRCode from 'react-native-qrcode-svg';
// import {captureRef} from 'react-native-view-shot';
// import { CameraRoll } from "@react-native-camera-roll/camera-roll";

// const QRCodeGenerator = ({route}) => {
//   const {data} = route.params;
//   const [valueToEncode, setValueToEncode] = useState('');
//   const [hasPermission, setHasPermission] = useState(false);
//   const qrCodeRef = useRef();

//   useEffect(() => {
//     setValueToEncode(
//       `https://argosmob.com/being-petz/public/${data}/show-parent-detail`,
//     );
//     checkPermission();
//   }, [data]);

//   const checkPermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         let granted;
//         if (Platform.Version >= 33) {
//           granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//             {
//               title: 'Media Permission',
//               message: 'App needs access to your media to save QR code images',
//               buttonPositive: 'OK',
//             },
//           );
//         } else {
//           granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//             {
//               title: 'Storage Permission',
//               message: 'App needs access to storage to save QR codes',
//               buttonPositive: 'OK',
//             },
//           );
//         }
//         setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn(err);
//         setHasPermission(false);
//         return false;
//       }
//     } else {
//       setHasPermission(true); // iOS auto-handles it
//       return true;
//     }
//   };

//   const downloadQRCode = async () => {
//   const permissionGranted = await checkPermission();
//   if (!permissionGranted) {
//     Alert.alert(
//       'Permission Required',
//       'Storage permission is required to save the QR code.',
//       [{ text: 'OK' }],
//     );
//     return;
//   }

//   try {
//     const uri = await captureRef(qrCodeRef, {
//       format: 'png',
//       quality: 1,
//     });

//     await CameraRoll.save(uri, { type: 'photo' });
//     Alert.alert('Success', 'QR code saved to your gallery!');

//   } catch (error) {
//     console.error('Error saving QR code:', error);
//     Alert.alert('Error', 'Failed to save QR code. Please try again.');
//   }
// };

//   return (
//     <View style={styles.container}>
//       {valueToEncode !== '' && (
//         <View style={styles.qrContainer}>
//           <View ref={qrCodeRef} collapsable={false}>
//             <QRCode value={valueToEncode} size={200} />
//           </View>
//           <TouchableOpacity
//             style={styles.downloadButton}
//             onPress={downloadQRCode}>
//             <Text style={styles.downloadButtonText}>Download QR Code</Text>
//           </TouchableOpacity>
//           {!hasPermission && (
//             <Text style={styles.permissionText}>
//               Storage permission required to save QR codes
//             </Text>
//           )}
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
//   qrContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   downloadButton: {
//     marginTop: 30,
//     backgroundColor: '#6A5ACD',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//   },
//   downloadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   permissionText: {
//     marginTop: 10,
//     color: 'red',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });

// export default QRCodeGenerator;

// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Text,
//   PermissionsAndroid,
//   Alert,
//   Platform,
// } from 'react-native';
// import QRCode from 'react-native-qrcode-svg';
// import {captureRef} from 'react-native-view-shot';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
// import Icon from 'react-native-vector-icons/Ionicons'; // For back arrow

// const QRCodeGenerator = ({route, navigation}) => {
//   const {data} = route.params;
//   const [valueToEncode, setValueToEncode] = useState('');
//   const [hasPermission, setHasPermission] = useState(false);
//   const qrCodeRef = useRef();

//   useEffect(() => {
//     setValueToEncode(
//       `https://argosmob.com/being-petz/public/${data}/show-parent-detail`,
//     );
//     checkPermission();
//   }, [data]);

//   const checkPermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         let granted;
//         if (Platform.Version >= 33) {
//           granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
//             {
//               title: 'Media Permission',
//               message: 'App needs access to your media to save QR code images',
//               buttonPositive: 'OK',
//             },
//           );
//         } else {
//           granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//             {
//               title: 'Storage Permission',
//               message: 'App needs access to storage to save QR codes',
//               buttonPositive: 'OK',
//             },
//           );
//         }
//         setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.warn(err);
//         setHasPermission(false);
//         return false;
//       }
//     } else {
//       setHasPermission(true);
//       return true;
//     }
//   };

//   const downloadQRCode = async () => {
//     const permissionGranted = await checkPermission();
//     if (!permissionGranted) {
//       Alert.alert(
//         'Permission Required',
//         'Storage permission is required to save the QR code.',
//         [{text: 'OK'}],
//       );
//       return;
//     }

//     try {
//       const uri = await captureRef(qrCodeRef, {
//         format: 'png',
//         quality: 1,
//       });

//       await CameraRoll.save(uri, {type: 'photo'});
//       Alert.alert('Success', 'QR code saved to your gallery!');
//     } catch (error) {
//       console.error('Error saving QR code:', error);
//       Alert.alert('Error', 'Failed to save QR code. Please try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Back Button */}
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack && navigation.goBack()}
//         activeOpacity={0.7}>
//         <Icon name="arrow-back" size={28} color="#4D2779" />
//       </TouchableOpacity>

//       {/* PRESENTATIONAL BANNER TEXT */}
//       <View style={{justifyContent:'center',flex:0.9}}>
//         <View style={styles.bannerContainer}>
//           <Text style={styles.bannerTitle}>
//             Never lose your{' '}
//             <Text style={styles.boldAccent}>furry friend 🐾</Text> again!
//           </Text>
//           <Text style={styles.bannerSubtitle}>
//             Download your pet’s unique QR code.
//           </Text>
//         </View>

//         {valueToEncode !== '' && (
//           <View style={styles.qrContainer}>
//             <View ref={qrCodeRef} collapsable={false}>
//               <QRCode value={valueToEncode} size={200} />
//             </View>
//             <TouchableOpacity
//               style={styles.downloadButton}
//               onPress={downloadQRCode}>
//               <Text style={styles.downloadButtonText}>Download QR Code</Text>
//             </TouchableOpacity>
//             {!hasPermission && (
//               <Text style={styles.permissionText}>
//                 Storage permission required to save QR codes
//               </Text>
//             )}
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//     justifyContent: 'flex-start',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 30,
//     left: 15,
//     zIndex: 2,
//     backgroundColor: '#fff',
//     // borderRadius: 50,
//     padding: 4,
//     // elevation: 3,
//   },
//   bannerContainer: {
//     marginBottom: 40,
//     marginTop: 55, // moved down to make space for back button
//     alignItems: 'center',
//   },
//   bannerTitle: {
//     fontFamily: Platform.select({
//       ios: 'Avenir-Heavy',
//       android: 'sans-serif-medium',
//       default: 'System',
//     }),
//     fontSize: 24,
//     textAlign: 'center',
//     color: '#4D2779',
//     fontWeight: '900',
//     marginBottom: 8,
//     letterSpacing: 0.3,
//   },
//   boldAccent: {
//     color: '#FFA500',
//     fontWeight: 'bold',
//     fontFamily: Platform.select({
//       ios: 'Avenir-Heavy',
//       android: 'sans-serif-medium',
//       default: 'System',
//     }),
//   },
//   bannerSubtitle: {
//     fontSize: 16,
//     color: '#6A5ACD',
//     textAlign: 'center',
//     fontWeight: '600',
//     letterSpacing: 0.1,
//   },
//   qrContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   downloadButton: {
//     marginTop: 30,
//     backgroundColor: '#6A5ACD',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//   },
//   downloadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   permissionText: {
//     marginTop: 10,
//     color: 'red',
//     fontSize: 14,
//     textAlign: 'center',
//   },
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
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Icon from 'react-native-vector-icons/Ionicons';

const WEBSITE = 'https://www.beingpetz.com/';

const QRCodeGenerator = ({route, navigation}) => {
  const {data} = route.params;
  const [valueToEncode, setValueToEncode] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const qrCodeRef = useRef();

  useEffect(() => {
    setValueToEncode(
      `https://argosmob.com/being-petz/public/${data}/show-parent-detail`,
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
      setHasPermission(true);
      return true;
    }
  };

  const downloadQRCode = async () => {
    const permissionGranted = await checkPermission();
    if (!permissionGranted) {
      Alert.alert(
        'Permission Required',
        'Storage permission is required to save the QR code.',
        [{text: 'OK'}],
      );
      return;
    }
    try {
      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 1,
      });

      await CameraRoll.save(uri, {type: 'photo'});
      Alert.alert('Success', 'QR code saved to your gallery!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack && navigation.goBack()}
        activeOpacity={0.7}>
        <Icon name="arrow-back" size={28} color="#4D2779" />
      </TouchableOpacity>

      {/* Top presentation: header image and banner text (not saved) */}
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerTitle}>
          Never lose your <Text style={styles.boldAccent}>furry friend 🐾</Text>{' '}
          again!
        </Text>
        <Text style={styles.bannerSubtitle}>
          Download your pet’s unique QR code.
        </Text>
      </View>

      {/* This block (header image + QR + website) is captured/saved */}
      <View ref={qrCodeRef} collapsable={false} style={styles.captureBlock}>
        <Image
          source={require('../Assests/Images/newLogo.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.linkText,
            {marginVertical: 20, marginTop: 0, flexWrap: 'wrap'},
          ]}
          selectable>
          Scan and help me reunite with my parents
        </Text>

        {valueToEncode ? (
          <QRCode
            value={valueToEncode}
            size={200}
            logo={require('../Assests/Images/QrLogo1.jpg')}
            logoSize={50}
            logoBackgroundColor="transparent"
            logoMargin={2}
          />
        ) : (
          <Text style={{color: '#fff'}}>QR code data missing</Text>
        )}

        <Text style={styles.linkText} selectable>
          {WEBSITE}
        </Text>
      </View>

      {/* Website is also shown as clickable for in-app */}
      {/* <TouchableOpacity
        onPress={() => Linking.openURL(WEBSITE)}
        activeOpacity={0.8}
        style={styles.linkTap}
      >
        <Text style={styles.linkTextAccent}>{WEBSITE}</Text>
      </TouchableOpacity> */}

      {/* Download button (not included in capture) */}
      <TouchableOpacity style={styles.downloadButton} onPress={downloadQRCode}>
        <Text style={styles.downloadButtonText}>Download QR Code</Text>
      </TouchableOpacity>
      {!hasPermission && (
        <Text style={styles.permissionText}>
          Storage permission required to save QR codes
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 15,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 4,
    elevation: 3,
  },
  bannerContainer: {
    marginTop: 70,
    marginBottom: 25,
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: Platform.select({
      ios: 'Avenir-Heavy',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    fontSize: 24,
    textAlign: 'center',
    color: '#8337B2',
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  boldAccent: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Avenir-Heavy',
      android: 'sans-serif-medium',
      default: 'System',
    }),
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#8337B2',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  // The block that's captured for sharing/saving
  captureBlock: {
    alignItems: 'center',
    backgroundColor: '#8337B2',
    borderRadius: 18,
    paddingHorizontal: 30,
    paddingVertical: 24,
    marginBottom: 18,
    // Optionally: add a little shadow for the block
    elevation: 2,
    shadowColor: '#222',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
  },
  headerImage: {
    width: 160,
    height: 58,
    borderRadius: 8,
    marginBottom: 13,
  },
  linkText: {
    marginTop: 18,
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkTap: {
    marginBottom: 5,
  },
  linkTextAccent: {
    color: '#8337B2',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -7,
    marginBottom: 18,
  },
  downloadButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
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

// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ImageBackground,
//   TouchableOpacity,
// } from 'react-native';

// const DiagonalBackgroundCard = ({
//   title,
//   icon,
//   topLeftColor = '#C1FFE9',
//   bottomRightColor = '#EAF9F3',
//   backgroundImage = null,
//   width = 120,
//   height = 120,
//   onPress = () => {},
// }) => {
//   return (
//     <TouchableOpacity
//       style={{alignItems: 'center', justifyContent: 'center'}}
//       activeOpacity={0.8}
//       onPress={onPress}>
//       <View
//         style={[
//           styles.card,
//           {backgroundColor: bottomRightColor, width, height},
//         ]}>
//         {/* Optional background image */}
//         {backgroundImage && (
//           <ImageBackground
//             source={backgroundImage}
//             style={[styles.imageBackground, {width, height}]}
//             imageStyle={{borderRadius: 12}}>
//             <View style={[styles.topLeftBg, {backgroundColor: topLeftColor}]} />
//           </ImageBackground>
//         )}

//         {/* Without image */}
//         {!backgroundImage && (
//           <View style={[styles.topLeftBg, {backgroundColor: topLeftColor}]} />
//         )}

//         {/* Icon & Text content */}
//         <View style={styles.content}>
//           <Image source={icon} style={styles.icon} />
//           <Text style={styles.label}>{title}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   topLeftBg: {
//     position: 'absolute',
//     width: '200%',
//     height: '140%',
//     transform: [{rotate: '-45deg'}],
//     top: -100,
//     left: -100,
//     zIndex: 0,
//   },
//   imageBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1,
//   },
//   icon: {
//     width: 40,
//     height: 40,
//     resizeMode: 'contain',
//     marginBottom: 4,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//   },
// });

// export default DiagonalBackgroundCard;


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

/**
 * DiagonalBackgroundCard
 *
 * Props:
 *  - title
 *  - icon (Image source)
 *  - topLeftColor (color of the decorative top-left diagonal background)
 *  - bottomRightColor (main card background)
 *  - backgroundImage (optional image source for background)
 *  - width, height
 *  - onPress
 *  - badgeText (text to show on diagonal badge)
 *  - badgeColor, badgeTextColor, badgeHeight
 */
const DiagonalBackgroundCard = ({
  title,
  icon,
  topLeftColor = '#C1FFE9',
  bottomRightColor = '#EAF9F3',
  backgroundImage = null,
  width = 120,
  height = 120,
  onPress = () => {},
  badgeText = '',
  badgeColor = '#8337B2',
  badgeTextColor = '#FFF',
  badgeHeight = 30,
}) => {
  // compute some positions based on width so the stripe crosses the corner nicely
  // left offset must be negative to start outside the card and cover the corner diagonal
  const stripeWidth = Math.max(width * 1.2, 100); // stripe length across corner
  const stripeLeft = -width * 0.25; // shift left so stripe sits across corner
  const stripeTop = 8; // small gap from top

  return (
    <TouchableOpacity
      style={{alignItems: 'center', justifyContent: 'center'}}
      activeOpacity={0.9}
      onPress={onPress}>
      <View
        style={[
          styles.card,
          {backgroundColor: bottomRightColor, width, height, borderRadius: 12},
        ]}>
        {/* optional background image */}
        {backgroundImage ? (
          <ImageBackground
            source={backgroundImage}
            style={[styles.imageBackground, {width, height}]}
            imageStyle={{borderRadius: 12}}>
            {/* keep decorative top-left diagonal behind content */}
            <View
              style={[
                styles.topLeftBg,
                {backgroundColor: topLeftColor, width: width * 2, height: height * 1.5},
              ]}
            />
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.topLeftBg,
              {backgroundColor: topLeftColor, width: width * 2, height: height * 1.5},
            ]}
          />
        )}

        {/* Diagonal badge stripe — only render if badgeText provided */}
        {badgeText ? (
          <View
            style={[
              {
                position: 'absolute',
                top: stripeTop,
                left: stripeLeft,
                width: stripeWidth,
                height: badgeHeight,
                transform: [{rotate: '-45deg'}],
                backgroundColor: badgeColor,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                borderRadius: 4,
                // small shadow like feel
                elevation: 2,
              },
            ]}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: badgeTextColor,
                fontWeight: '700',
                fontSize: Math.max(12, Math.round(badgeHeight * 0.45)),
                letterSpacing: 0.2,
              }}>
              {badgeText}
            </Text>
          </View>
        ) : null}

        {/* main content */}
        <View style={[styles.content, {width, height}]}>
          <Image source={icon} style={styles.icon} />
          <Text style={styles.label}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  topLeftBg: {
    position: 'absolute',
    // rotate a big rectangle so a diagonal triangle appears on top-left
    transform: [{rotate: '-45deg'}],
    top: -100,
    left: -100,
    zIndex: 0,
  },
  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 8,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
});

export default DiagonalBackgroundCard;

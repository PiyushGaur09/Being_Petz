import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

const DiagonalBackgroundCard = ({
  title,
  icon,
  topLeftColor = '#C1FFE9',
  bottomRightColor = '#EAF9F3',
  backgroundImage = null,
  width = 120,
  height = 120,
  onPress = () => {},
}) => {
  return (
    <TouchableOpacity
      style={{alignItems: 'center', justifyContent: 'center'}}
      activeOpacity={0.8}
      onPress={onPress}>
      <View
        style={[
          styles.card,
          {backgroundColor: bottomRightColor, width, height},
        ]}>
        {/* Optional background image */}
        {backgroundImage && (
          <ImageBackground
            source={backgroundImage}
            style={[styles.imageBackground, {width, height}]}
            imageStyle={{borderRadius: 12}}>
            <View style={[styles.topLeftBg, {backgroundColor: topLeftColor}]} />
          </ImageBackground>
        )}

        {/* Without image */}
        {!backgroundImage && (
          <View style={[styles.topLeftBg, {backgroundColor: topLeftColor}]} />
        )}

        {/* Icon & Text content */}
        <View style={styles.content}>
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
  },
  topLeftBg: {
    position: 'absolute',
    width: '200%',
    height: '140%',
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
    zIndex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});

export default DiagonalBackgroundCard;

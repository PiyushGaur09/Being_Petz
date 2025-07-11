import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

const HeaderLoader = ({
  visible = false,
  source = require('../../Assests/headerLoader.json'), // Default loader
  speed = 1,
  loop = true,
  style,
  animationStyle,
  // overlayColor = 'rgba(255, 255, 255, 0)',
  overlayColor = 'transparent', // Changed to transparent
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, {backgroundColor: overlayColor}, style]}>
      <LottieView
        source={source}
        autoPlay
        speed={speed}
        loop={loop}
        style={[styles.lottie, animationStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  lottie: {
    width: 80,
    height: 80,
  },
});

export default HeaderLoader;

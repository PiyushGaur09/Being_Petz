import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  Easing,
  Image
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// const DraggableButton = () => {
//   const navigation = useNavigation();
//   const { width, height } = Dimensions.get('window');
//   const pan = useRef(new Animated.ValueXY()).current;
//   const [isDragging, setIsDragging] = useState(false);
//   const scale = useRef(new Animated.Value(1)).current;

//   // Calculate button dimensions (adjust as needed)
//   const buttonWidth = 60;
//   const buttonHeight = 60;

const DraggableButton = () => {
  const navigation = useNavigation();
  const {width, height} = Dimensions.get('window');

  // Button dimensions
  const buttonWidth = 60;
  const buttonHeight = 60;

  // Initial position (bottom-right with margin)
  const initialX = width - buttonWidth - 20;
  const initialY = height - buttonHeight - 120;

  // Initialize pan at bottom-right
  const pan = useRef(
    new Animated.ValueXY({
      x: initialX,
      y: initialY,
    }),
  ).current;

  const [isDragging, setIsDragging] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Scale up slightly when pressed
        setIsDragging(true);
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: pan.x,
            dy: pan.y,
          },
        ],
        {useNativeDriver: false},
      ),
      onPanResponderRelease: (e, gesture) => {
        // If it's a tap (not a drag), navigate
        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          handlePress();
        }

        // Scale back to normal
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Keep button within screen bounds
        const newX = pan.x._value;
        const newY = pan.y._value;

        // Calculate boundaries
        const maxX = width - buttonWidth;
        const maxY = height - buttonHeight;

        // Adjust position if out of bounds
        const adjustedX = Math.max(0, Math.min(newX, maxX));
        const adjustedY = Math.max(0, Math.min(newY, maxY));

        // Animate to adjusted position if needed
        if (adjustedX !== newX || adjustedY !== newY) {
          Animated.spring(pan, {
            toValue: {x: adjustedX, y: adjustedY},
            useNativeDriver: true,
          }).start();
        }

        setIsDragging(false);
      },
    }),
  ).current;

  const handlePress = () => {
    // Example navigation - replace with your screen name
    navigation.navigate('Add');
  };

  const handleLongPress = () => {
    setIsDragging(true);
    Animated.spring(scale, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.button,
        {
          transform: [{translateX: pan.x}, {translateY: pan.y}, {scale: scale}],
        },
      ]}
      {...panResponder.panHandlers}
      onStartShouldSetResponder={() => true}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300} // Wait 300ms before considering it a long press
        style={styles.touchable}>
        <View style={styles.buttonContent}>
          <Image source={require('../../Assests/Images/LostAndFound.png')} />
          {/* <Text style={styles.buttonText}>+</Text> */}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8337B2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default DraggableButton;

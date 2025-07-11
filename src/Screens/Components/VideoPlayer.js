import React from 'react';
import {StyleSheet, View} from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = ({url}) => {
  return (
    <View style={styles.container}>
      <Video
        source={{uri: url}} // Can be a URL or local file
        style={styles.video}
        controls={true} // Show playback controls
        resizeMode="contain" // How to resize the video
        paused={false} // Start playing immediately
        onError={error => console.log('Video error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
});

export default VideoPlayer;

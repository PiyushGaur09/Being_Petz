import React from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MessageInput = ({inputText, setInputText, onSendText, onSendImage, onSendPoll}) => {
  return (
    <View style={styles.inputContainer}>
      {/* <TouchableOpacity style={styles.emojiButton}>
        <Icon name="happy-outline" size={24} color="gray" />
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.attachmentButton} onPress={onSendImage}>
        <Icon name="attach" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.pollButton} onPress={onSendPoll}>
        <Icon name="bar-chart-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TextInput
        style={styles.textInput}
        placeholder="Type a message"
        placeholderTextColor="gray"
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={onSendText}
        multiline
      />
      <TouchableOpacity style={styles.sendButton} onPress={onSendText}>
        <Icon name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  emojiButton: {
    padding: 8,
  },
  attachmentButton: {
    padding: 8,
  },
  pollButton: {
    padding: 8,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#8337B2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

export default MessageInput;
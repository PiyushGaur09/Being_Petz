// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChatHeader from './Components/ChatsComponent/ChatHeader';
// import MessagesList from './Components/ChatsComponent/MessagesList';
// import MessageInput from './Components/ChatsComponent/MessageInput';
// import {
//   fetchMessages,
//   sendTextMessage,
//   sendImageMessage,
// } from './Components/ChatsComponent/chatApiService';
// import Dialog from 'react-native-dialog';
// import axios from 'axios';
// import useReplyStore from './Components/ChatsComponent/replyStore';

// const IndividualChatScreen = () => {
//   const route = useRoute();
//   const {community} = route.params || {};
//   const navigation = useNavigation();
//   const flatListRef = useRef(null);

//   const {replyTo} = useReplyStore();
//   // console.log('replyTo', community);

//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [pollDialogVisible, setPollDialogVisible] = useState(false);
//   const [pollStep, setPollStep] = useState(1);
//   const [pollQuestion, setPollQuestion] = useState('');
//   const [pollOptions, setPollOptions] = useState('');

//   useEffect(() => {
//     const loadUserData = async () => {
//       try {
//         const userData = await AsyncStorage.getItem('user_data');
//         if (userData) {
//           const parsedData = JSON.parse(userData);
//           setCurrentUserId(parsedData.id);
//         }
//       } catch (error) {
//         console.error('Error loading user data:', error);
//       }
//     };

//     loadUserData();
//     loadMessages();

//     const interval = setInterval(loadMessages, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       const messages = await fetchMessages(community.id);
//       setMessages(messages);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//       // Alert.alert('Error', 'Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendText = async () => {
//     if (!inputText.trim()) return;

//     try {
//       await sendTextMessage(community.id, currentUserId, inputText);
//       setInputText('');
//       loadMessages();
//     } catch (error) {
//       console.error('Error sending message:', error);
//       Alert.alert('Error', 'Failed to send message');
//     }
//   };

//   const handleSendImage = async () => {
//     try {
//       await sendImageMessage(community.id, currentUserId);
//       loadMessages();
//     } catch (error) {
//       console.error('Error sending image:', error);
//       Alert.alert('Error', 'Failed to send image');
//     }
//   };

//   const handleSendPoll = () => {
//     setPollStep(1);
//     setPollQuestion('');
//     setPollOptions('');
//     setPollDialogVisible(true);
//   };

//   const handlePollNext = () => {
//     if (!pollQuestion.trim()) {
//       Alert.alert('Error', 'Please enter a question');
//       return;
//     }
//     setPollStep(2);
//   };

//   const handlePollBack = () => {
//     setPollStep(1);
//   };

//   const handlePollSubmit = async () => {
//     if (!pollOptions.trim()) {
//       Alert.alert('Error', 'Please enter options');
//       return;
//     }

//     const optionsArray = pollOptions
//       .split(',')
//       .map(o => o.trim())
//       .filter(o => o);

//     if (optionsArray.length < 2) {
//       Alert.alert('Error', 'Please enter at least 2 options');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('community_id', community.id);
//       formData.append('parent_id', currentUserId);
//       formData.append('message_type', 'poll');
//       formData.append('question', pollQuestion);
//       formData.append('isReply', '0');
//       formData.append('message_id', '');

//       optionsArray.forEach((opt, i) => {
//         formData.append(`options[${i}]`, opt);
//       });

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/community/send-message',
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       if (response.data?.status) {
//         setPollDialogVisible(false);
//         loadMessages();
//       } else {
//         throw new Error(response.data?.message || 'Failed to create poll');
//       }
//     } catch (error) {
//       console.error('Error sending poll:', error);
//       Alert.alert('Error', error.message || 'Failed to create poll');
//     }
//   };

//   const handleVotePoll = async (pollId, optionId) => {
//     try {
//       const formData = new FormData();
//       formData.append('poll_id', pollId);
//       formData.append('option_id', optionId);
//       formData.append('parent_id', currentUserId);

//       const response = await axios.post(
//         'https://argosmob.com/being-petz/public/api/v1/community/vote-poll',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       if (response.data.status) {
//         loadMessages();
//       } else {
//         throw new Error(response.data.message || 'Failed to vote');
//       }
//     } catch (error) {
//       console.error('Error voting on poll:', error);
//       Alert.alert('Error', error.message || 'Failed to vote');
//     }
//   };

//   if (loading && messages.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#8337B2" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#075E54" barStyle="light-content" />

//       <ChatHeader community={community} onBack={() => navigation.goBack()} />

//       <MessagesList
//       communityId={community.id}
//         messages={messages}
//         currentUserId={currentUserId}
//         ref={flatListRef}
//         onVotePoll={handleVotePoll}
//       />

//       {replyTo == null && (
//         <MessageInput
//           inputText={inputText}
//           setInputText={setInputText}
//           onSendText={handleSendText}
//           onSendImage={handleSendImage}
//           onSendPoll={handleSendPoll}
//         />
//       )}

//       {/* Poll Creation Dialogs */}
//       <Dialog.Container visible={pollDialogVisible}>
//         {pollStep === 1 ? (
//           <>
//             <Dialog.Title>Create Poll</Dialog.Title>
//             <Dialog.Description>Enter your question:</Dialog.Description>
//             <Dialog.Input
//               placeholder="Poll question"
//               value={pollQuestion}
//               onChangeText={setPollQuestion}
//               autoFocus
//             />
//             <Dialog.Button
//               label="Cancel"
//               onPress={() => setPollDialogVisible(false)}
//             />
//             <Dialog.Button label="Next" onPress={handlePollNext} />
//           </>
//         ) : (
//           <>
//             <Dialog.Title>Poll Options</Dialog.Title>
//             <Dialog.Description>
//               Enter options (comma separated):
//             </Dialog.Description>
//             <Dialog.Input
//               placeholder="Option 1, Option 2, Option 3"
//               value={pollOptions}
//               onChangeText={setPollOptions}
//               multiline
//               autoFocus
//             />
//             <Dialog.Button label="Back" onPress={handlePollBack} />
//             <Dialog.Button label="Send" onPress={handlePollSubmit} />
//           </>
//         )}
//       </Dialog.Container>
//     </SafeAreaView>
//   );
// };

// const styles = {
//   container: {
//     flex: 1,
//     backgroundColor: '#e5ddd5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#e5ddd5',
//   },
// };

// export default IndividualChatScreen;

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatHeader from './Components/ChatsComponent/ChatHeader';
import MessagesList from './Components/ChatsComponent/MessagesList';
import MessageInput from './Components/ChatsComponent/MessageInput';
import {
  fetchMessages,
  sendTextMessage,
  sendImageMessage,
} from './Components/ChatsComponent/chatApiService';
import Dialog from 'react-native-dialog';
import axios from 'axios';
import useReplyStore from './Components/ChatsComponent/replyStore';

const IndividualChatScreen = () => {
  const route = useRoute();
  const {community} = route.params || {};
  const navigation = useNavigation();

  const {replyTo} = useReplyStore();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // refs for controlling polling and preventing repeated alerts
  const pollRef = useRef(null);
  const noIdAttemptsRef = useRef(0);
  const exitAlertShown = useRef(false);
  const mountedRef = useRef(true);

  const NO_ID_ATTEMPT_LIMIT = 5;
  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    mountedRef.current = true;
    // load current user id
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          setCurrentUserId(parsed.id);
        }
      } catch (err) {
        console.error('Error reading user data', err);
      }
    })();

    return () => {
      mountedRef.current = false;
      // cleanup any intervals
      clearPollInterval();
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to clear poll interval
  const clearPollInterval = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Detect "left/forbidden" messages from API responses or exceptions
  const isExitOrForbiddenError = err => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      (typeof err === 'string' ? err : '') ||
      '';
    return /not a member|exited|you have exited|forbidden|403|access denied/i.test(
      msg,
    );
  };

  // core loader - only invoked when community?.id exists (or by final checks)
  const loadMessagesFromServer = async () => {
    if (!community?.id) return;

    try {
      // set loading only when we have zero messages to avoid flicker on polling
      if (messages.length === 0) setLoading(true);

      const msgs = await fetchMessages(community.id);

      // Some APIs may return an object with status:false when user isn't a member
      if (msgs && typeof msgs === 'object' && msgs?.status === false) {
        // treat as left-forbidden
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            msgs.message || 'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }

      // normally msgs is an array
      if (mountedRef.current) {
        setMessages(Array.isArray(msgs) ? msgs : []);
        exitAlertShown.current = false; // reset if returned successfully
      }
    } catch (err) {
      // if server says forbidden / not member -> handle once and stop polling
      if (isExitOrForbiddenError(err)) {
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }

      // For other errors, log once but don't spam the user repeatedly
      console.error('Error fetching messages:', err?.response ?? err);
      // You could optionally set a non-blocking UI state to show a banner
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  // main effect that controls polling and no-id attempts
  useEffect(() => {
    // cleanup previous interval
    clearPollInterval();
    noIdAttemptsRef.current = 0;

    // If we have community id start polling immediately
    if (community?.id) {
      // immediate fetch then interval
      loadMessagesFromServer();
      pollRef.current = setInterval(() => {
        loadMessagesFromServer();
      }, POLL_INTERVAL_MS);
      return () => clearPollInterval();
    }

    // community.id not present -> try to detect it up to NO_ID_ATTEMPT_LIMIT times,
    // but DO NOT call the backend while id is missing
    const checkIdInterval = setInterval(() => {
      noIdAttemptsRef.current += 1;

      // if community prop becomes available (re-render), this effect will re-run and this interval cleaned up
      if (community?.id) {
        clearInterval(checkIdInterval);
        // start normal polling in the effect re-run
        return;
      }

      // stop after attempts exhausted
      if (noIdAttemptsRef.current >= NO_ID_ATTEMPT_LIMIT) {
        clearInterval(checkIdInterval);
        // stop polling attempts entirely and avoid spamming user
        // optionally notify user once (commented out by default)
        // Alert.alert('Community unavailable', 'Unable to open this community.');
        // ensure loading false
        if (mountedRef.current) setLoading(false);
      }
    }, POLL_INTERVAL_MS);

    // cleanup
    return () => clearInterval(checkIdInterval);
    // Re-run when community?.id changes
  }, [community?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // send text message
  const handleSendText = async () => {
    if (!inputText.trim()) return;

    if (!community?.id) {
      Alert.alert('Error', 'This community is not available.');
      return;
    }

    try {
      await sendTextMessage(community.id, currentUserId, inputText);
      setInputText('');
      await loadMessagesFromServer();
    } catch (err) {
      if (isExitOrForbiddenError(err)) {
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }
      console.error('Error sending text message:', err?.response ?? err);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleSendImage = async () => {
    if (!community?.id) {
      Alert.alert('Error', 'This community is not available.');
      return;
    }
    try {
      await sendImageMessage(community.id, currentUserId);
      await loadMessagesFromServer();
    } catch (err) {
      if (isExitOrForbiddenError(err)) {
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }
      console.error('Error sending image message:', err?.response ?? err);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  // Poll UI & Poll/polling-related handlers etc. (poll creation + voting)
  const [pollDialogVisible, setPollDialogVisible] = useState(false);
  const [pollStep, setPollStep] = useState(1);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState('');

  const handleSendPoll = () => {
    if (!community?.id) {
      Alert.alert('Error', 'This community is not available.');
      return;
    }
    setPollStep(1);
    setPollQuestion('');
    setPollOptions('');
    setPollDialogVisible(true);
  };

  const handlePollNext = () => {
    if (!pollQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    setPollStep(2);
  };
  const handlePollBack = () => setPollStep(1);

  const handlePollSubmit = async () => {
    if (!pollOptions.trim()) {
      Alert.alert('Error', 'Please enter options');
      return;
    }
    const optionsArray = pollOptions
      .split(',')
      .map(o => o.trim())
      .filter(o => o);
    if (optionsArray.length < 2) {
      Alert.alert('Error', 'Please enter at least 2 options');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('community_id', community.id);
      formData.append('parent_id', currentUserId);
      formData.append('message_type', 'poll');
      formData.append('question', pollQuestion);
      formData.append('isReply', '0');
      formData.append('message_id', '');
      optionsArray.forEach((opt, i) => formData.append(`options[${i}]`, opt));

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/community/send-message',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (response.data?.status) {
        setPollDialogVisible(false);
        await loadMessagesFromServer();
      } else {
        throw new Error(response.data?.message || 'Failed to create poll');
      }
    } catch (err) {
      if (isExitOrForbiddenError(err)) {
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }
      console.error('Error creating poll:', err?.response ?? err);
      Alert.alert('Error', err.message || 'Failed to create poll');
    }
  };

  const handleVotePoll = async (pollId, optionId) => {
    try {
      const fd = new FormData();
      fd.append('poll_id', pollId);
      fd.append('option_id', optionId);
      fd.append('parent_id', currentUserId);

      const response = await axios.post(
        'https://argosmob.com/being-petz/public/api/v1/community/vote-poll',
        fd,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (response.data?.status) {
        await loadMessagesFromServer();
      } else {
        throw new Error(response.data?.message || 'Failed to vote');
      }
    } catch (err) {
      if (isExitOrForbiddenError(err)) {
        if (!exitAlertShown.current) {
          exitAlertShown.current = true;
          clearPollInterval();
          Alert.alert(
            'Left community',
            'You are no longer a member of this community.',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        }
        return;
      }
      console.error('Error voting on poll:', err?.response ?? err);
      Alert.alert('Error', err.message || 'Failed to vote');
    }
  };

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8337B2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      <ChatHeader community={community} onBack={() => navigation.goBack()} />

      <MessagesList
        communityId={community?.id}
        messages={messages}
        currentUserId={currentUserId}
        ref={null}
        onVotePoll={handleVotePoll}
      />

      {replyTo == null && (
        <MessageInput
          inputText={inputText}
          setInputText={setInputText}
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          onSendPoll={handleSendPoll}
        />
      )}

      <Dialog.Container visible={pollDialogVisible}>
        {pollStep === 1 ? (
          <>
            <Dialog.Title>Create Poll</Dialog.Title>
            <Dialog.Description>Enter your question:</Dialog.Description>
            <Dialog.Input
              placeholder="Poll question"
              value={pollQuestion}
              onChangeText={setPollQuestion}
              autoFocus
            />
            <Dialog.Button
              label="Cancel"
              onPress={() => setPollDialogVisible(false)}
            />
            <Dialog.Button label="Next" onPress={handlePollNext} />
          </>
        ) : (
          <>
            <Dialog.Title>Poll Options</Dialog.Title>
            <Dialog.Description>
              Enter options (comma separated):
            </Dialog.Description>
            <Dialog.Input
              placeholder="Option 1, Option 2, Option 3"
              value={pollOptions}
              onChangeText={setPollOptions}
              multiline
              autoFocus
            />
            <Dialog.Button label="Back" onPress={handlePollBack} />
            <Dialog.Button label="Send" onPress={handlePollSubmit} />
          </>
        )}
      </Dialog.Container>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5ddd5',
  },
};

export default IndividualChatScreen;

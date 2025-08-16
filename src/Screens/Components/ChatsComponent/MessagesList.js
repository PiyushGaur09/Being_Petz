// import React, {forwardRef, useState} from 'react';
// import {
//   FlatList,
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   TextInput,
//   Modal,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {RadioButton} from 'react-native-paper';
// import {Swipeable} from 'react-native-gesture-handler';
// import axios from 'axios';
// import useReplyStore from './replyStore';
// import {ColorSpace} from 'react-native-reanimated';

// const MessagesList = forwardRef(
//   ({messages, currentUserId, onVotePoll, communityId}, ref) => {
//     const {replyTo, setReplyTo, clearReplyTo} = useReplyStore();
//     const [replyText, setReplyText] = useState('');
//     const [modalVisible, setModalVisible] = useState(false);
//     const [selectedMessage, setSelectedMessage] = useState(null);
//     const [lastTap, setLastTap] = useState(null);

//     const handleLikeUnlike = async messageId => {
//       console.log('messageId', messageId);
//       try {
//         const formData = new FormData();
//         formData.append('message_id', messageId.toString());
//         formData.append('member_id', currentUserId.toString());

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/community/message/like-unlike',
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );

//         console.log('Like/Unlike response:', response.data);
//         // You would typically update your state here based on the response
//         // For example, if the API returns the updated message with new like count
//       } catch (error) {
//         console.error(
//           'Failed to like/unlike message:',
//           error.response?.data || error.message,
//         );
//       }
//     };
//     // console.log('reply to', replyTo);

//     const handleSendReply = async () => {
//       if (!replyText.trim()) {
//         Alert.alert('Error', 'Please enter a reply message');
//         return;
//       }

//       // console.log('reply message ', replyText);

//       try {
//         const formData = new FormData();
//         formData.append('community_id', communityId.toString());
//         // formData.append('member_id', currentUserId.toString());
//         formData.append('message_text', replyText.trim());
//         formData.append('is_reply', '1');
//         formData.append('parent_id', currentUserId.toString());
//         formData.append('message_type', 'text');
//         formData.append('message_id', replyTo.id.toString());

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/community/send-message',
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );

//         if (response.data.status) {
//           setReplyText('');
//           clearReplyTo();
//           // You might want to refresh the messages list here or add the new message to your state
//         } else {
//           Alert.alert('Error', response.data.message || 'Failed to send reply');
//         }
//       } catch (error) {
//         console.error(
//           'Failed to send reply:',
//           error.response?.data || error.message,
//         );
//         Alert.alert('Error', 'Failed to send reply');
//       }
//     };

//     const handleDoubleTap = messageId => {
//       handleLikeUnlike(messageId);
//     };

//     const handleMessagePress = messageId => {
//       const now = Date.now();
//       const DOUBLE_PRESS_DELAY = 300;

//       if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
//         // Double tap detected
//         handleDoubleTap(messageId);
//       } else {
//         setLastTap(now);
//       }
//     };

//     const renderRightActions = item => {
//       return (
//         <TouchableOpacity
//           style={styles.replyAction}
//           onPress={() => setReplyTo(item)}>
//           <Icon name="arrow-undo" size={24} color="#fff" />
//         </TouchableOpacity>
//       );
//     };

//     const renderMessage = ({item}) => {
//       const isCurrentUserMessage =
//         item.isMe || item.parent_id === currentUserId;
//       const isReply = item.isReply === 1;
//       const senderName = isCurrentUserMessage
//         ? 'You'
//         : item.user?.first_name || 'Unknown';
//       const senderImage = `https://argosmob.com/being-petz/public/${item.user?.profile}`;

//       // console.log('item', item);

//       return (
//         <Swipeable renderRightActions={() => renderRightActions(item)}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => handleMessagePress(item.id)}>
//             <View
//               style={[
//                 styles.fullMessageContainer,
//                 isCurrentUserMessage
//                   ? styles.myFullMessage
//                   : styles.theirFullMessage,
//               ]}>
//               <View
//                 style={[
//                   styles.messageContainer,
//                   isCurrentUserMessage ? styles.myMessage : styles.theirMessage,
//                 ]}>
//                 <View style={styles.messageHeader}>
//                   {/* {!isCurrentUserMessage && ( */}
//                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
//                     <Image
//                       style={{height: 40, width: 40, borderRadius: 20}}
//                       source={{uri: senderImage}}
//                     />
//                     <Text style={styles.senderName}>{senderName}</Text>
//                   </View>
//                   {/* // )} */}
//                   <TouchableOpacity
//                     style={styles.optionsButton}
//                     onPress={() => {
//                       setSelectedMessage(item);
//                       setModalVisible(true);
//                     }}>
//                     <Icon name="ellipsis-vertical" size={16} color="#666" />
//                   </TouchableOpacity>
//                 </View>

//                 {item.likes_count > 0 && (
//                   <View
//                     style={[
//                       styles.likeContainer,
//                       isCurrentUserMessage
//                         ? styles.myLikeContainer
//                         : styles.theirLikeContainer,
//                     ]}>
//                     <Icon
//                       name="heart"
//                       size={12}
//                       color="#ff4d6d"
//                       style={styles.likeIcon}
//                     />
//                     <Text style={styles.likeCount}>{item.likes_count}</Text>
//                   </View>
//                 )}

//                 {isReply ? (
//                   <View style={styles.replyContainer}>
//                     <View style={styles.originalMessageContainer}>
//                       <Text style={styles.originalMessageSender}>
//                         {item.old_message.parent_id === currentUserId
//                           ? 'You'
//                           : item.user.first_name}
//                       </Text>
//                       {item.old_message.message_type === 'text' && (
//                         <Text style={styles.originalMessageText}>
//                           {item.old_message.message_text}
//                         </Text>
//                       )}
//                       {item.old_message.message_type === 'image' && (
//                         <Image
//                           source={{
//                             uri: `https://argosmob.com/being-petz/public/${item.old_message.media_path}`,
//                           }}
//                           style={styles.originalMessageImage}
//                           resizeMode="cover"
//                         />
//                       )}
//                     </View>

//                     {item.message_type === 'image' ? (
//                       <ImageMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleDoubleTap(item.id)}
//                       />
//                     ) : item.message_type === 'poll' ? (
//                       <PollMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         currentUserId={currentUserId}
//                         onVotePoll={onVotePoll}
//                       />
//                     ) : (
//                       <TextMessage item={item} isMe={isCurrentUserMessage} />
//                     )}
//                   </View>
//                 ) : (
//                   <>
//                     {item.message_type === 'image' ? (
//                       <ImageMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleDoubleTap(item.id)}
//                       />
//                     ) : item.message_type === 'poll' ? (
//                       <PollMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         currentUserId={currentUserId}
//                         onVotePoll={onVotePoll}
//                       />
//                     ) : (
//                       <TextMessage item={item} isMe={isCurrentUserMessage} />
//                     )}
//                   </>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </Swipeable>
//       );
//     };

//     return (
//       <>
//         <FlatList
//           ref={ref}
//           data={messages}
//           renderItem={renderMessage}
//           keyExtractor={item => item.id.toString()}
//           contentContainerStyle={styles.messagesContainer}
//         />

//         {replyTo && (
//           <View style={styles.replyInputContainer}>
//             <View style={styles.replyHeader}>
//               <Text style={styles.replyingToText}>
//                 Replying to: {replyTo.message_text}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Close button pressed'); // Add this
//                   clearReplyTo();
//                 }}
//                 activeOpacity={0.7}>
//                 <Icon name="close" size={30} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.inputRow}>
//               <TextInput
//                 style={styles.replyTextInput}
//                 value={replyText}
//                 onChangeText={setReplyText}
//                 placeholder="Type your reply..."
//               />
//               <TouchableOpacity
//                 style={styles.sendButton}
//                 onPress={handleSendReply}>
//                 <Icon name="send" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Message Options</Text>
//                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                   <Icon name="close" size={24} color="#666" />
//                 </TouchableOpacity>
//               </View>

//               {selectedMessage &&
//               (selectedMessage.isMe ||
//                 selectedMessage.parent_id === currentUserId) ? (
//                 <>
//                   <TouchableOpacity
//                     style={styles.modalOption}
//                     onPress={async () => {
//                       try {
//                         const formData = new FormData();
//                         formData.append(
//                           'message_id',
//                           selectedMessage.id.toString(),
//                         );
//                         formData.append('user_id', currentUserId.toString());

//                         const response = await axios.post(
//                           'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-all',
//                           formData,
//                           {
//                             headers: {
//                               'Content-Type': 'multipart/form-data',
//                             },
//                           },
//                         );

//                         if (response.data.status) {
//                           Alert.alert(
//                             'Success',
//                             'Message deleted for everyone',
//                           );
//                         } else {
//                           Alert.alert(
//                             'Error',
//                             response.data.message || 'Failed to delete message',
//                           );
//                         }
//                       } catch (error) {
//                         console.error('Delete for all error:', error);
//                         Alert.alert(
//                           'Error',
//                           'Failed to delete message for everyone',
//                         );
//                       } finally {
//                         setModalVisible(false);
//                       }
//                     }}>
//                     <Text style={styles.modalOptionText}>
//                       Delete for everyone
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.modalOption}
//                     onPress={async () => {
//                       try {
//                         const formData = new FormData();
//                         formData.append(
//                           'message_id',
//                           selectedMessage.id.toString(),
//                         );
//                         formData.append('user_id', currentUserId.toString());

//                         const response = await axios.post(
//                           'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
//                           formData,
//                           {
//                             headers: {
//                               'Content-Type': 'multipart/form-data',
//                             },
//                           },
//                         );

//                         if (response.data.status) {
//                           Alert.alert('Success', 'Message deleted for me');
//                         } else {
//                           Alert.alert(
//                             'Error',
//                             response.data.message || 'Failed to delete message',
//                           );
//                         }
//                       } catch (error) {
//                         console.error('Delete for me error:', error);
//                         Alert.alert('Error', 'Failed to delete message for me');
//                       } finally {
//                         setModalVisible(false);
//                       }
//                     }}>
//                     <Text style={styles.modalOptionText}>Delete for me</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={async () => {
//                     try {
//                       const formData = new FormData();
//                       formData.append(
//                         'message_id',
//                         selectedMessage.id.toString(),
//                       );
//                       formData.append('user_id', currentUserId.toString());

//                       const response = await axios.post(
//                         'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
//                         formData,
//                         {
//                           headers: {
//                             'Content-Type': 'multipart/form-data',
//                           },
//                         },
//                       );

//                       if (response.data.status) {
//                         Alert.alert('Success', 'Message deleted for me');
//                       } else {
//                         Alert.alert(
//                           'Error',
//                           response.data.message || 'Failed to delete message',
//                         );
//                       }
//                     } catch (error) {
//                       console.error('Delete for me error:', error);
//                       Alert.alert('Error', 'Failed to delete message for me');
//                     } finally {
//                       setModalVisible(false);
//                     }
//                   }}>
//                   <Text style={styles.modalOptionText}>Delete for me</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </Modal>
//       </>
//     );
//   },
// );

// const TextMessage = ({item, isMe}) => (
//   <>
//     <Text
//       style={[
//         styles.messageText,
//         isMe ? styles.myMessageText : styles.theirMessageText,
//       ]}>
//       {item.message_text}
//     </Text>
//     <MessageFooter item={item} isMe={isMe} />
//   </>
// );

// const ImageMessage = ({item, isMe, onDoubleTap}) => {
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [lastTap, setLastTap] = useState(null);

//   const handlePress = () => {
//     const now = Date.now();
//     const DOUBLE_PRESS_DELAY = 300;

//     if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
//       onDoubleTap();
//       setLastTap(null);
//     } else {
//       setLastTap(now);
//     }
//   };

//   return (
//     <>
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={handlePress}
//         onLongPress={() => setIsFullScreen(true)}>
//         <Image
//           source={{
//             uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
//           }}
//           style={styles.image}
//           resizeMode="cover"
//         />
//         <MessageFooter item={item} isMe={isMe} />
//       </TouchableOpacity>

//       <Modal
//         visible={isFullScreen}
//         transparent={true}
//         onRequestClose={() => setIsFullScreen(false)}>
//         <View style={styles.fullScreenContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsFullScreen(false)}>
//             <Icon name="close" size={30} color="white" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.fullScreenTouchable}
//             activeOpacity={1}
//             onPress={() => setIsFullScreen(false)}>
//             <Image
//               source={{
//                 uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
//               }}
//               style={styles.fullScreenImage}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const PollMessage = ({item, isMe, currentUserId, onVotePoll}) => {
//   const options = item.poll?.options || [];
//   const [selectedOption, setSelectedOption] = useState(null);

//   const hasVoted = options.some(option =>
//     option.votes?.some(vote => vote.parent_id === currentUserId),
//   );

//   const totalVotes = item.poll?.total_votes || 0;

//   const handleSubmit = async () => {
//     if (!selectedOption) {
//       Alert.alert('Error', 'Please select an option before submitting');
//       return;
//     }

//     try {
//       await onVotePoll(item.poll.id, selectedOption);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to submit vote');
//     }
//   };

//   return (
//     <View style={styles.pollContainer}>
//       <Text style={styles.pollQuestion}>{item.poll?.question}</Text>

//       {hasVoted ? (
//         options.map(option => {
//           const percentage = option.vote_percentage || 0;
//           const votesCount = option.votes?.length || 0;

//           return (
//             <View key={option.id} style={styles.optionResultContainer}>
//               <Text style={styles.pollOptionText}>
//                 {option.option_text} ({percentage}%)
//               </Text>
//               <View style={styles.pollBarContainer}>
//                 <View style={[styles.pollBar, {width: `${percentage}%`}]} />
//               </View>
//               <Text style={styles.voteCount}>{votesCount} votes</Text>
//             </View>
//           );
//         })
//       ) : (
//         <>
//           <RadioButton.Group
//             onValueChange={value => setSelectedOption(value)}
//             value={selectedOption}>
//             {options.map(option => (
//               <View key={option.id} style={styles.optionContainer}>
//                 <View style={styles.radioButtonContainer}>
//                   <RadioButton
//                     value={option.id}
//                     color="#8337B2"
//                     disabled={hasVoted}
//                   />
//                   <Text style={styles.pollOptionText}>
//                     {option.option_text}
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </RadioButton.Group>

//           <TouchableOpacity
//             style={styles.submitButton}
//             onPress={handleSubmit}
//             disabled={hasVoted}>
//             <Text style={styles.submitButtonText}>
//               {hasVoted ? 'Vote Submitted' : 'Submit Vote'}
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}

//       <MessageFooter item={item} isMe={isMe} />
//     </View>
//   );
// };

// const MessageFooter = ({item, isMe}) => {
//   const messageDate = new Date(item.created_at);
//   const formattedTime = messageDate.toLocaleTimeString([], {
//     hour: '2-digit',
//     minute: '2-digit',
//   });
//   const formattedDate = messageDate.toLocaleDateString([], {
//     day: 'numeric',
//     month: 'short',
//   });

//   return (
//     <View style={styles.messageTimeContainer}>
//       {item.like_count > 0 && (
//         <View style={styles.likeIconContainer}>
//           <Icon name="heart" size={14} color="#ff4d6d" />
//           {item.likes_count > 1 && (
//             <Text style={styles.likeCountText}>{item.likes_count}</Text>
//           )}
//         </View>
//       )}
//       <Text style={styles.messageTime}>
//         {formattedTime} • {formattedDate}
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   messagesContainer: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//   },
//   fullMessageContainer: {
//     marginBottom: 12,
//   },
//   myFullMessage: {
//     alignItems: 'flex-end',
//   },
//   theirFullMessage: {
//     alignItems: 'flex-start',
//   },
//   senderName: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#555',
//     marginBottom: 2,
//     marginLeft: 8,
//   },
//   messageContainer: {
//     maxWidth: '75%',
//     padding: 12,
//     borderRadius: 8,
//   },
//   myMessage: {
//     backgroundColor: '#dcf8c6',
//     borderTopRightRadius: 0,
//   },
//   theirMessage: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 0,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   myMessageText: {
//     color: 'black',
//   },
//   theirMessageText: {
//     color: 'black',
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 11,
//     color: '#667781',
//     marginRight: 4,
//   },
//   statusIcon: {
//     marginLeft: 2,
//   },
//   image: {
//     width: 200,
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 4,
//   },
//   pollContainer: {
//     width: '100%',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     padding: 15,
//   },
//   pollQuestion: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#333',
//   },
//   optionContainer: {
//     marginBottom: 10,
//   },
//   radioButtonContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   pollOptionText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#111',
//   },
//   submitButton: {
//     backgroundColor: '#8337B2',
//     padding: 10,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   submitButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   optionResultContainer: {
//     marginBottom: 12,
//   },
//   pollBarContainer: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginVertical: 4,
//     overflow: 'hidden',
//   },
//   pollBar: {
//     height: '100%',
//     backgroundColor: '#8337B2',
//   },
//   voteCount: {
//     fontSize: 12,
//     color: '#666',
//   },
//   replyAction: {
//     backgroundColor: '#8337B2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 60,
//     borderRadius: 8,
//     marginVertical: 5,
//   },
//   replyInputContainer: {
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#f9f9f9',
//   },
//   replyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   replyingToText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   replyTextInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#fff',
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: '#8337B2',
//     padding: 10,
//     borderRadius: 50,
//   },
//   replyContainer: {
//     width: '100%',
//   },
//   originalMessageContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 8,
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: '#ccc',
//     marginBottom: 8,
//   },
//   originalMessageSender: {
//     fontWeight: 'bold',
//     fontSize: 12,
//     color: '#666',
//   },
//   originalMessageText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   originalMessageImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 4,
//     marginTop: 4,
//   },
//   messageHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '80%',
//     paddingHorizontal: 8,
//     marginBottom: 4,
//     // backgroundColor: 'yellow',
//   },
//   optionsButton: {
//     padding: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // backgroundColor: 'red',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modalOption: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullScreenImage: {
//     width: '100%',
//     height: '100%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   fullScreenTouchable: {
//     flex: 1,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   likeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//     marginBottom: 4,
//     alignSelf: 'flex-start',
//   },
//   myLikeContainer: {
//     backgroundColor: 'rgba(220, 248, 198, 0.7)',
//   },
//   theirLikeContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//   },
//   likeIcon: {
//     marginRight: 2,
//   },
//   likeCount: {
//     fontSize: 12,
//     color: '#ff4d6d',
//   },
//   /////////
//   messageTimeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   likeIconContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 6,
//   },
//   likeCountText: {
//     fontSize: 11,
//     color: '#ff4d6d',
//     marginLeft: 2,
//   },
//   messageTime: {
//     fontSize: 11,
//     color: '#667781',
//   },
// });

// export default MessagesList;





// import React, {forwardRef, useState} from 'react';
// import {
//   FlatList,
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   TextInput,
//   Modal,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {RadioButton} from 'react-native-paper';
// import {Swipeable} from 'react-native-gesture-handler';
// import axios from 'axios';
// import useReplyStore from './replyStore';

// const MessagesList = forwardRef(
//   ({messages, currentUserId, onVotePoll, communityId}, ref) => {
//     const {replyTo, setReplyTo, clearReplyTo} = useReplyStore();
//     const [replyText, setReplyText] = useState('');
//     const [modalVisible, setModalVisible] = useState(false);
//     const [selectedMessage, setSelectedMessage] = useState(null);
//     const [lastTap, setLastTap] = useState({id: null, time: 0});

//     const handleLikeUnlike = async messageId => {
//       try {
//         const formData = new FormData();
//         formData.append('message_id', messageId.toString());
//         formData.append('member_id', currentUserId.toString());

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/community/message/like-unlike',
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );

//         console.log('Like/Unlike response:', response.data);
//       } catch (error) {
//         console.error(
//           'Failed to like/unlike message:',
//           error.response?.data || error.message,
//         );
//       }
//     };

//     const handleSendReply = async () => {
//       if (!replyText.trim()) {
//         Alert.alert('Error', 'Please enter a reply message');
//         return;
//       }

//       try {
//         const formData = new FormData();
//         formData.append('community_id', communityId.toString());
//         formData.append('message_text', replyText.trim());
//         formData.append('is_reply', '1');
//         formData.append('parent_id', currentUserId.toString());
//         formData.append('message_type', 'text');
//         formData.append('message_id', replyTo.id.toString());

//         const response = await axios.post(
//           'https://argosmob.com/being-petz/public/api/v1/community/send-message',
//           formData,
//           {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//           },
//         );

//         if (response.data.status) {
//           setReplyText('');
//           clearReplyTo();
//         } else {
//           Alert.alert('Error', response.data.message || 'Failed to send reply');
//         }
//       } catch (error) {
//         console.error(
//           'Failed to send reply:',
//           error.response?.data || error.message,
//         );
//         Alert.alert('Error', 'Failed to send reply');
//       }
//     };

//     const handleMessagePress = messageId => {
//       const now = Date.now();
//       const DOUBLE_PRESS_DELAY = 300;

//       if (lastTap.id === messageId && now - lastTap.time < DOUBLE_PRESS_DELAY) {
//         handleLikeUnlike(messageId);
//         setLastTap({id: null, time: 0});
//       } else {
//         setLastTap({id: messageId, time: now});
//       }
//     };

//     const renderRightActions = item => {
//       return (
//         <TouchableOpacity
//           style={styles.replyAction}
//           onPress={() => setReplyTo(item)}>
//           <Icon name="arrow-undo" size={24} color="#fff" />
//         </TouchableOpacity>
//       );
//     };

//     const renderMessage = ({item}) => {
//       const isCurrentUserMessage = item.parent_id === currentUserId;
//       const isReply = item.isReply === 1;
//       const senderName = isCurrentUserMessage
//         ? 'You'
//         : item.user?.first_name || 'Unknown';
//       const senderImage = `https://argosmob.com/being-petz/public/${item.user?.profile}`;

//       return (
//         <Swipeable renderRightActions={() => renderRightActions(item)}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => handleMessagePress(item.id)}
//             delayPressIn={0}
//             delayPressOut={0}>
//             <View
//               style={[
//                 styles.fullMessageContainer,
//                 isCurrentUserMessage
//                   ? styles.myFullMessage
//                   : styles.theirFullMessage,
//               ]}>
//               <View
//                 style={[
//                   styles.messageContainer,
//                   isCurrentUserMessage ? styles.myMessage : styles.theirMessage,
//                 ]}>
//                 <View style={styles.messageHeader}>
//                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
//                     <Image
//                       style={{height: 40, width: 40, borderRadius: 20}}
//                       source={{uri: senderImage}}
//                     />
//                     <Text style={styles.senderName}>{senderName}</Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.optionsButton}
//                     onPress={() => {
//                       setSelectedMessage(item);
//                       setModalVisible(true);
//                     }}>
//                     <Icon name="ellipsis-vertical" size={16} color="#666" />
//                   </TouchableOpacity>
//                 </View>

//                 {item.likes_count > 0 && (
//                   <View
//                     style={[
//                       styles.likeContainer,
//                       isCurrentUserMessage
//                         ? styles.myLikeContainer
//                         : styles.theirLikeContainer,
//                     ]}>
//                     <Icon
//                       name="heart"
//                       size={12}
//                       color="#ff4d6d"
//                       style={styles.likeIcon}
//                     />
//                     <Text style={styles.likeCount}>{item.likes_count}</Text>
//                   </View>
//                 )}

//                 {isReply ? (
//                   <View style={styles.replyContainer}>
//                     <View style={styles.originalMessageContainer}>
//                       <Text style={styles.originalMessageSender}>
//                         {item.old_message.parent_id === currentUserId
//                           ? 'You'
//                           : item.user.first_name}
//                       </Text>
//                       {item.old_message.message_type === 'text' && (
//                         <Text style={styles.originalMessageText}>
//                           {item.old_message.message_text}
//                         </Text>
//                       )}
//                       {item.old_message.message_type === 'image' && (
//                         <Image
//                           source={{
//                             uri: `https://argosmob.com/being-petz/public/${item.old_message.media_path}`,
//                           }}
//                           style={styles.originalMessageImage}
//                           resizeMode="cover"
//                         />
//                       )}
//                     </View>

//                     {item.message_type === 'image' ? (
//                       <ImageMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     ) : item.message_type === 'poll' ? (
//                       <PollMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         currentUserId={currentUserId}
//                         onVotePoll={onVotePoll}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     ) : (
//                       <TextMessage 
//                         item={item} 
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     )}
//                   </View>
//                 ) : (
//                   <>
//                     {item.message_type === 'image' ? (
//                       <ImageMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     ) : item.message_type === 'poll' ? (
//                       <PollMessage
//                         item={item}
//                         isMe={isCurrentUserMessage}
//                         currentUserId={currentUserId}
//                         onVotePoll={onVotePoll}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     ) : (
//                       <TextMessage 
//                         item={item} 
//                         isMe={isCurrentUserMessage}
//                         onDoubleTap={() => handleLikeUnlike(item.id)}
//                       />
//                     )}
//                   </>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </Swipeable>
//       );
//     };

//     return (
//       <>
//         <FlatList
//           ref={ref}
//           data={messages}
//           renderItem={renderMessage}
//           keyExtractor={item => item.id.toString()}
//           contentContainerStyle={styles.messagesContainer}
//         />

//         {replyTo && (
//           <View style={styles.replyInputContainer}>
//             <View style={styles.replyHeader}>
//               <Text style={styles.replyingToText}>
//                 Replying to: {replyTo.message_text}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   console.log('Close button pressed');
//                   clearReplyTo();
//                 }}
//                 activeOpacity={0.7}>
//                 <Icon name="close" size={30} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.inputRow}>
//               <TextInput
//                 style={styles.replyTextInput}
//                 value={replyText}
//                 onChangeText={setReplyText}
//                 placeholder="Type your reply..."
//               />
//               <TouchableOpacity
//                 style={styles.sendButton}
//                 onPress={handleSendReply}>
//                 <Icon name="send" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Message Options</Text>
//                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                   <Icon name="close" size={24} color="#666" />
//                 </TouchableOpacity>
//               </View>

//               {selectedMessage &&
//               (selectedMessage.parent_id === currentUserId) ? (
//                 <>
//                   <TouchableOpacity
//                     style={styles.modalOption}
//                     onPress={async () => {
//                       try {
//                         const formData = new FormData();
//                         formData.append(
//                           'message_id',
//                           selectedMessage.id.toString(),
//                         );
//                         formData.append('user_id', currentUserId.toString());

//                         const response = await axios.post(
//                           'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-all',
//                           formData,
//                           {
//                             headers: {
//                               'Content-Type': 'multipart/form-data',
//                             },
//                           },
//                         );

//                         if (response.data.status) {
//                           Alert.alert(
//                             'Success',
//                             'Message deleted for everyone',
//                           );
//                         } else {
//                           Alert.alert(
//                             'Error',
//                             response.data.message || 'Failed to delete message',
//                           );
//                         }
//                       } catch (error) {
//                         console.error('Delete for all error:', error);
//                         Alert.alert(
//                           'Error',
//                           'Failed to delete message for everyone',
//                         );
//                       } finally {
//                         setModalVisible(false);
//                       }
//                     }}>
//                     <Text style={styles.modalOptionText}>
//                       Delete for everyone
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.modalOption}
//                     onPress={async () => {
//                       try {
//                         const formData = new FormData();
//                         formData.append(
//                           'message_id',
//                           selectedMessage.id.toString(),
//                         );
//                         formData.append('user_id', currentUserId.toString());

//                         const response = await axios.post(
//                           'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
//                           formData,
//                           {
//                             headers: {
//                               'Content-Type': 'multipart/form-data',
//                             },
//                           },
//                         );

//                         if (response.data.status) {
//                           Alert.alert('Success', 'Message deleted for me');
//                         } else {
//                           Alert.alert(
//                             'Error',
//                             response.data.message || 'Failed to delete message',
//                           );
//                         }
//                       } catch (error) {
//                         console.error('Delete for me error:', error);
//                         Alert.alert('Error', 'Failed to delete message for me');
//                       } finally {
//                         setModalVisible(false);
//                       }
//                     }}>
//                     <Text style={styles.modalOptionText}>Delete for me</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.modalOption}
//                   onPress={async () => {
//                     try {
//                       const formData = new FormData();
//                       formData.append(
//                         'message_id',
//                         selectedMessage.id.toString(),
//                       );
//                       formData.append('user_id', currentUserId.toString());

//                       const response = await axios.post(
//                         'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
//                         formData,
//                         {
//                           headers: {
//                             'Content-Type': 'multipart/form-data',
//                           },
//                         },
//                       );

//                       if (response.data.status) {
//                         Alert.alert('Success', 'Message deleted for me');
//                       } else {
//                         Alert.alert(
//                           'Error',
//                           response.data.message || 'Failed to delete message',
//                         );
//                       }
//                     } catch (error) {
//                       console.error('Delete for me error:', error);
//                       Alert.alert('Error', 'Failed to delete message for me');
//                     } finally {
//                       setModalVisible(false);
//                     }
//                   }}>
//                   <Text style={styles.modalOptionText}>Delete for me</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </Modal>
//       </>
//     );
//   },
// );

// const TextMessage = ({item, isMe, onDoubleTap}) => {
//   const [lastTap, setLastTap] = useState(null);

//   const handlePress = () => {
//     const now = Date.now();
//     const DOUBLE_PRESS_DELAY = 300;

//     if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
//       onDoubleTap();
//       setLastTap(null);
//     } else {
//       setLastTap(now);
//     }
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={handlePress}
//       style={styles.textMessageTouchable}>
//       <Text
//         style={[
//           styles.messageText,
//           isMe ? styles.myMessageText : styles.theirMessageText,
//         ]}>
//         {item.message_text}
//       </Text>
//       <MessageFooter item={item} isMe={isMe} />
//     </TouchableOpacity>
//   );
// };

// const ImageMessage = ({item, isMe, onDoubleTap}) => {
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [lastTap, setLastTap] = useState(null);

//   const handlePress = () => {
//     const now = Date.now();
//     const DOUBLE_PRESS_DELAY = 300;

//     if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
//       onDoubleTap();
//       setLastTap(null);
//     } else {
//       setLastTap(now);
//     }
//   };

//   return (
//     <>
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={handlePress}
//         onLongPress={() => setIsFullScreen(true)}>
//         <Image
//           source={{
//             uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
//           }}
//           style={styles.image}
//           resizeMode="cover"
//         />
//         <MessageFooter item={item} isMe={isMe} />
//       </TouchableOpacity>

//       <Modal
//         visible={isFullScreen}
//         transparent={true}
//         onRequestClose={() => setIsFullScreen(false)}>
//         <View style={styles.fullScreenContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setIsFullScreen(false)}>
//             <Icon name="close" size={30} color="white" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.fullScreenTouchable}
//             activeOpacity={1}
//             onPress={() => setIsFullScreen(false)}>
//             <Image
//               source={{
//                 uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
//               }}
//               style={styles.fullScreenImage}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const PollMessage = ({item, isMe, currentUserId, onVotePoll, onDoubleTap}) => {
//   const [lastTap, setLastTap] = useState(null);
//   const options = item.poll?.options || [];
//   const [selectedOption, setSelectedOption] = useState(null);

//   const handlePress = () => {
//     const now = Date.now();
//     const DOUBLE_PRESS_DELAY = 300;

//     if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
//       onDoubleTap();
//       setLastTap(null);
//     } else {
//       setLastTap(now);
//     }
//   };

//   const hasVoted = options.some(option =>
//     option.votes?.some(vote => vote.parent_id === currentUserId),
//   );

//   const totalVotes = item.poll?.total_votes || 0;

//   const handleSubmit = async () => {
//     if (!selectedOption) {
//       Alert.alert('Error', 'Please select an option before submitting');
//       return;
//     }

//     try {
//       await onVotePoll(item.poll.id, selectedOption);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to submit vote');
//     }
//   };

//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={handlePress}
//       style={styles.pollTouchable}>
//       <Text style={styles.pollQuestion}>{item.poll?.question}</Text>

//       {hasVoted ? (
//         options.map(option => {
//           const percentage = option.vote_percentage || 0;
//           const votesCount = option.votes?.length || 0;

//           return (
//             <View key={option.id} style={styles.optionResultContainer}>
//               <Text style={styles.pollOptionText}>
//                 {option.option_text} ({percentage}%)
//               </Text>
//               <View style={styles.pollBarContainer}>
//                 <View style={[styles.pollBar, {width: `${percentage}%`}]} />
//               </View>
//               <Text style={styles.voteCount}>{votesCount} votes</Text>
//             </View>
//           );
//         })
//       ) : (
//         <>
//           <RadioButton.Group
//             onValueChange={value => setSelectedOption(value)}
//             value={selectedOption}>
//             {options.map(option => (
//               <View key={option.id} style={styles.optionContainer}>
//                 <View style={styles.radioButtonContainer}>
//                   <RadioButton
//                     value={option.id}
//                     color="#8337B2"
//                     disabled={hasVoted}
//                   />
//                   <Text style={styles.pollOptionText}>
//                     {option.option_text}
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </RadioButton.Group>

//           <TouchableOpacity
//             style={styles.submitButton}
//             onPress={handleSubmit}
//             disabled={hasVoted}>
//             <Text style={styles.submitButtonText}>
//               {hasVoted ? 'Vote Submitted' : 'Submit Vote'}
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}

//       <MessageFooter item={item} isMe={isMe} />
//     </TouchableOpacity>
//   );
// };

// const MessageFooter = ({item, isMe}) => {
//   const messageDate = new Date(item.created_at);
//   const formattedTime = messageDate.toLocaleTimeString([], {
//     hour: '2-digit',
//     minute: '2-digit',
//   });
//   const formattedDate = messageDate.toLocaleDateString([], {
//     day: 'numeric',
//     month: 'short',
//   });

//   return (
//     <View style={styles.messageTimeContainer}>
//       {item.like_count > 0 && (
//         <View style={styles.likeIconContainer}>
//           <Icon name="heart" size={14} color="#ff4d6d" />
//           {item.likes_count > 1 && (
//             <Text style={styles.likeCountText}>{item.likes_count}</Text>
//           )}
//         </View>
//       )}
//       <Text style={styles.messageTime}>
//         {formattedTime} • {formattedDate}
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   messagesContainer: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//   },
//   fullMessageContainer: {
//     marginBottom: 12,
//   },
//   myFullMessage: {
//     alignItems: 'flex-end',
//   },
//   theirFullMessage: {
//     alignItems: 'flex-start',
//   },
//   senderName: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#555',
//     marginBottom: 2,
//     marginLeft: 8,
//   },
//   messageContainer: {
//     maxWidth: '75%',
//     padding: 12,
//     borderRadius: 8,
//   },
//   myMessage: {
//     backgroundColor: '#dcf8c6',
//     borderTopRightRadius: 0,
//   },
//   theirMessage: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 0,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   myMessageText: {
//     color: 'black',
//   },
//   theirMessageText: {
//     color: 'black',
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 11,
//     color: '#667781',
//     marginRight: 4,
//   },
//   statusIcon: {
//     marginLeft: 2,
//   },
//   image: {
//     width: 200,
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 4,
//   },
//   pollContainer: {
//     width: '100%',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     padding: 15,
//   },
//   pollQuestion: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#333',
//   },
//   optionContainer: {
//     marginBottom: 10,
//   },
//   radioButtonContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   pollOptionText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#111',
//   },
//   submitButton: {
//     backgroundColor: '#8337B2',
//     padding: 10,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   submitButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   optionResultContainer: {
//     marginBottom: 12,
//   },
//   pollBarContainer: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     marginVertical: 4,
//     overflow: 'hidden',
//   },
//   pollBar: {
//     height: '100%',
//     backgroundColor: '#8337B2',
//   },
//   voteCount: {
//     fontSize: 12,
//     color: '#666',
//   },
//   replyAction: {
//     backgroundColor: '#8337B2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 60,
//     borderRadius: 8,
//     marginVertical: 5,
//   },
//   replyInputContainer: {
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#f9f9f9',
//   },
//   replyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   replyingToText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   replyTextInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#fff',
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: '#8337B2',
//     padding: 10,
//     borderRadius: 50,
//   },
//   replyContainer: {
//     width: '100%',
//   },
//   originalMessageContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 8,
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: '#ccc',
//     marginBottom: 8,
//   },
//   originalMessageSender: {
//     fontWeight: 'bold',
//     fontSize: 12,
//     color: '#666',
//   },
//   originalMessageText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   originalMessageImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 4,
//     marginTop: 4,
//   },
//   messageHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '80%',
//     paddingHorizontal: 8,
//     marginBottom: 4,
//   },
//   optionsButton: {
//     padding: 4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modalOption: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: 'black',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullScreenImage: {
//     width: '100%',
//     height: '100%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   fullScreenTouchable: {
//     flex: 1,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   likeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//     marginBottom: 4,
//     alignSelf: 'flex-start',
//   },
//   myLikeContainer: {
//     backgroundColor: 'rgba(220, 248, 198, 0.7)',
//   },
//   theirLikeContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//   },
//   likeIcon: {
//     marginRight: 2,
//   },
//   likeCount: {
//     fontSize: 12,
//     color: '#ff4d6d',
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   likeIconContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 6,
//   },
//   likeCountText: {
//     fontSize: 11,
//     color: '#ff4d6d',
//     marginLeft: 2,
//   },
//   textMessageTouchable: {
//     padding: 8,
//   },
//   pollTouchable: {
//     padding: 8,
//   },
// });

// export default MessagesList;



import React, { forwardRef, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RadioButton } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';
import useReplyStore from './replyStore';

// Add your available emojis here
const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '👏'];

const MessagesList = forwardRef(
  ({ messages, currentUserId, onVotePoll, communityId }, ref) => {
    const { replyTo, setReplyTo, clearReplyTo } = useReplyStore();
    const [replyText, setReplyText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [lastTap, setLastTap] = useState({ id: null, time: 0 });

    // State for reactions
    const [showReactions, setShowReactions] = useState(false);
    const [reactionTarget, setReactionTarget] = useState(null);
    const [reactionPos, setReactionPos] = useState({ top: 0, left: 0 }); // for future: position reaction bar
    // State for tracking emoji reactions per message (You should ideally keep these in backend)
    const [messageReactions, setMessageReactions] = useState({}); // { [messageId]: 'emoji' }

    const handleLikeUnlike = async messageId => {
      try {
        const formData = new FormData();
        formData.append('message_id', messageId.toString());
        formData.append('member_id', currentUserId.toString());

        const response = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/community/message/like-unlike',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log('Like/Unlike response:', response.data);
      } catch (error) {
        console.error(
          'Failed to like/unlike message:',
          error.response?.data || error.message,
        );
      }
    };

    const handleSendReply = async () => {
      if (!replyText.trim()) {
        Alert.alert('Error', 'Please enter a reply message');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('community_id', communityId.toString());
        formData.append('message_text', replyText.trim());
        formData.append('is_reply', '1');
        formData.append('parent_id', currentUserId.toString());
        formData.append('message_type', 'text');
        formData.append('message_id', replyTo.id.toString());

        const response = await axios.post(
          'https://argosmob.com/being-petz/public/api/v1/community/send-message',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.data.status) {
          setReplyText('');
          clearReplyTo();
        } else {
          Alert.alert('Error', response.data.message || 'Failed to send reply');
        }
      } catch (error) {
        console.error(
          'Failed to send reply:',
          error.response?.data || error.message,
        );
        Alert.alert('Error', 'Failed to send reply');
      }
    };

    const handleMessagePress = messageId => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;

      if (lastTap.id === messageId && now - lastTap.time < DOUBLE_PRESS_DELAY) {
        handleLikeUnlike(messageId);
        setLastTap({ id: null, time: 0 });
      } else {
        setLastTap({ id: messageId, time: now });
      }
    };

    // Handle reaction bar UI and logic
    const handleLongPressMessage = (item, ref) => {
      setReactionTarget(item);
      setShowReactions(true);
      // You can use measure() to position the reactionBar but for now we show it globally.
    };

    const handleSelectReaction = async emoji => {
      if (!reactionTarget) return;
      // For now, we just update UI state (should send API call to save reaction)
      setMessageReactions(prev => ({
        ...prev,
        [reactionTarget.id]: emoji,
      }));
      setShowReactions(false);
      setReactionTarget(null);
      // TODO: Call API to react to message if backend exists.
    };

    const renderRightActions = item => {
      return (
        <TouchableOpacity
          style={styles.replyAction}
          onPress={() => setReplyTo(item)}>
          <Icon name="arrow-undo" size={24} color="#fff" />
        </TouchableOpacity>
      );
    };

    const renderMessage = ({ item }) => {
      const isCurrentUserMessage = item.parent_id === currentUserId;
      const isReply = item.isReply === 1;
      const senderName = isCurrentUserMessage
        ? 'You'
        : item.user?.first_name || 'Unknown';
      const senderImage = `https://argosmob.com/being-petz/public/${item.user?.profile}`;

      // Show reaction over this message if any
      const messageReaction = messageReactions[item.id] || null;

      return (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleMessagePress(item.id)}
            delayPressIn={0}
            delayPressOut={0}
            onLongPress={() => handleLongPressMessage(item)}
          >
            <View
              style={[
                styles.fullMessageContainer,
                isCurrentUserMessage
                  ? styles.myFullMessage
                  : styles.theirFullMessage,
              ]}>
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUserMessage ? styles.myMessage : styles.theirMessage,
                ]}>
                <View style={styles.messageHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      style={{ height: 40, width: 40, borderRadius: 20 }}
                      source={{ uri: senderImage }}
                    />
                    <Text style={styles.senderName}>{senderName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => {
                      setSelectedMessage(item);
                      setModalVisible(true);
                    }}>
                    <Icon name="ellipsis-vertical" size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                {item.likes_count > 0 && (
                  <View
                    style={[
                      styles.likeContainer,
                      isCurrentUserMessage
                        ? styles.myLikeContainer
                        : styles.theirLikeContainer,
                    ]}>
                    <Icon
                      name="heart"
                      size={12}
                      color="#ff4d6d"
                      style={styles.likeIcon}
                    />
                    <Text style={styles.likeCount}>{item.likes_count}</Text>
                  </View>
                )}

                {/* Show selected emoji reaction above the message */}
                {messageReaction && (
                  <View style={styles.reactionIconContainer}>
                    <Text style={styles.reactionIcon}>{messageReaction}</Text>
                  </View>
                )}

                {isReply ? (
                  <View style={styles.replyContainer}>
                    <View style={styles.originalMessageContainer}>
                      <Text style={styles.originalMessageSender}>
                        {item.old_message.parent_id === currentUserId
                          ? 'You'
                          : item.user.first_name}
                      </Text>
                      {item.old_message.message_type === 'text' && (
                        <Text style={styles.originalMessageText}>
                          {item.old_message.message_text}
                        </Text>
                      )}
                      {item.old_message.message_type === 'image' && (
                        <Image
                          source={{
                            uri: `https://argosmob.com/being-petz/public/${item.old_message.media_path}`,
                          }}
                          style={styles.originalMessageImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>

                    {item.message_type === 'image' ? (
                      <ImageMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                        zoomOnPress={true} // now zooms on press
                      />
                    ) : item.message_type === 'poll' ? (
                      <PollMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        currentUserId={currentUserId}
                        onVotePoll={onVotePoll}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                      />
                    ) : (
                      <TextMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                      />
                    )}
                  </View>
                ) : (
                  <>
                    {item.message_type === 'image' ? (
                      <ImageMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                        zoomOnPress={true} // now zooms on press
                      />
                    ) : item.message_type === 'poll' ? (
                      <PollMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        currentUserId={currentUserId}
                        onVotePoll={onVotePoll}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                      />
                    ) : (
                      <TextMessage
                        item={item}
                        isMe={isCurrentUserMessage}
                        onDoubleTap={() => handleLikeUnlike(item.id)}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    };

    return (
      <>
        <FlatList
          ref={ref}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesContainer}
        />

        {/* Reply Input UI */}
        {replyTo && (
          <View style={styles.replyInputContainer}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyingToText}>
                Replying to: {replyTo.message_text}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Close button pressed');
                  clearReplyTo();
                }}
                activeOpacity={0.7}>
                <Icon name="close" size={30} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.replyTextInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Type your reply..."
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendReply}>
                <Icon name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Emoji Reaction Bar */}
        {showReactions && (
          <View style={styles.reactionBarOverlay}>
            <View style={styles.reactionBar}>
              {REACTION_EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleSelectReaction(emoji)}
                >
                  <Text style={styles.reactionBarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Dismiss if tap elsewhere */}
            <TouchableOpacity
              style={styles.reactionBarBackdrop}
              onPress={() => {
                setShowReactions(false);
                setReactionTarget(null);
              }}
            />
          </View>
        )}

        {/* Modal for delete options */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Message Options</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedMessage &&
              (selectedMessage.parent_id === currentUserId) ? (
                <>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={async () => {
                      try {
                        const formData = new FormData();
                        formData.append(
                          'message_id',
                          selectedMessage.id.toString(),
                        );
                        formData.append('user_id', currentUserId.toString());

                        const response = await axios.post(
                          'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-all',
                          formData,
                          {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          },
                        );

                        if (response.data.status) {
                          Alert.alert(
                            'Success',
                            'Message deleted for everyone',
                          );
                        } else {
                          Alert.alert(
                            'Error',
                            response.data.message || 'Failed to delete message',
                          );
                        }
                      } catch (error) {
                        console.error('Delete for all error:', error);
                        Alert.alert(
                          'Error',
                          'Failed to delete message for everyone',
                        );
                      } finally {
                        setModalVisible(false);
                      }
                    }}>
                    <Text style={styles.modalOptionText}>
                      Delete for everyone
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={async () => {
                      try {
                        const formData = new FormData();
                        formData.append(
                          'message_id',
                          selectedMessage.id.toString(),
                        );
                        formData.append('user_id', currentUserId.toString());

                        const response = await axios.post(
                          'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
                          formData,
                          {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          },
                        );

                        if (response.data.status) {
                          Alert.alert('Success', 'Message deleted for me');
                        } else {
                          Alert.alert(
                            'Error',
                            response.data.message || 'Failed to delete message',
                          );
                        }
                      } catch (error) {
                        console.error('Delete for me error:', error);
                        Alert.alert('Error', 'Failed to delete message for me');
                      } finally {
                        setModalVisible(false);
                      }
                    }}>
                    <Text style={styles.modalOptionText}>Delete for me</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={async () => {
                    try {
                      const formData = new FormData();
                      formData.append(
                        'message_id',
                        selectedMessage.id.toString(),
                      );
                      formData.append('user_id', currentUserId.toString());

                      const response = await axios.post(
                        'https://argosmob.com/being-petz/public/api/v1/community/delete-message-for-me',
                        formData,
                        {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        },
                      );

                      if (response.data.status) {
                        Alert.alert('Success', 'Message deleted for me');
                      } else {
                        Alert.alert(
                          'Error',
                          response.data.message || 'Failed to delete message',
                        );
                      }
                    } catch (error) {
                      console.error('Delete for me error:', error);
                      Alert.alert('Error', 'Failed to delete message for me');
                    } finally {
                      setModalVisible(false);
                    }
                  }}>
                  <Text style={styles.modalOptionText}>Delete for me</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </>
    );
  },
);

// TEXT MESSAGE
const TextMessage = ({ item, isMe, onDoubleTap }) => {
  const [lastTap, setLastTap] = useState(null);

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      onDoubleTap();
      setLastTap(null);
    } else {
      setLastTap(now);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.textMessageTouchable}>
      <Text
        style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.theirMessageText,
        ]}>
        {item.message_text}
      </Text>
      <MessageFooter item={item} isMe={isMe} />
    </TouchableOpacity>
  );
};

// IMAGE MESSAGE: Zoom on PRESS instead of long press
const ImageMessage = ({ item, isMe, onDoubleTap, zoomOnPress }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [lastTap, setLastTap] = useState(null);

  const handlePress = () => {
    // Zoom on single press!
    setIsFullScreen(true);
  };

  const handleDoubleTap = () => {
    onDoubleTap && onDoubleTap();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress} // now zooms on just press
        onLongPress={handleDoubleTap}
      >
        <Image
          source={{
            uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <MessageFooter item={item} isMe={isMe} />
      </TouchableOpacity>

      <Modal
        visible={isFullScreen}
        transparent={true}
        onRequestClose={() => setIsFullScreen(false)}>
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullScreen(false)}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fullScreenTouchable}
            activeOpacity={1}
            onPress={() => setIsFullScreen(false)}>
            <Image
              source={{
                uri: `https://argosmob.com/being-petz/public/${item.media_path}`,
              }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

// POLL MESSAGE
const PollMessage = ({ item, isMe, currentUserId, onVotePoll, onDoubleTap }) => {
  const [lastTap, setLastTap] = useState(null);
  const options = item.poll?.options || [];
  const [selectedOption, setSelectedOption] = useState(null);

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      onDoubleTap();
      setLastTap(null);
    } else {
      setLastTap(now);
    }
  };

  const hasVoted = options.some(option =>
    option.votes?.some(vote => vote.parent_id === currentUserId),
  );

  const totalVotes = item.poll?.total_votes || 0;

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Please select an option before submitting');
      return;
    }

    try {
      await onVotePoll(item.poll.id, selectedOption);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit vote');
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.pollTouchable}>
      <Text style={styles.pollQuestion}>{item.poll?.question}</Text>

      {hasVoted ? (
        options.map(option => {
          const percentage = option.vote_percentage || 0;
          const votesCount = option.votes?.length || 0;

          return (
            <View key={option.id} style={styles.optionResultContainer}>
              <Text style={styles.pollOptionText}>
                {option.option_text} ({percentage}%)
              </Text>
              <View style={styles.pollBarContainer}>
                <View style={[styles.pollBar, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.voteCount}>{votesCount} votes</Text>
            </View>
          );
        })
      ) : (
        <>
          <RadioButton.Group
            onValueChange={value => setSelectedOption(value)}
            value={selectedOption}>
            {options.map(option => (
              <View key={option.id} style={styles.optionContainer}>
                <View style={styles.radioButtonContainer}>
                  <RadioButton
                    value={option.id}
                    color="#8337B2"
                    disabled={hasVoted}
                  />
                  <Text style={styles.pollOptionText}>
                    {option.option_text}
                  </Text>
                </View>
              </View>
            ))}
          </RadioButton.Group>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={hasVoted}>
            <Text style={styles.submitButtonText}>
              {hasVoted ? 'Vote Submitted' : 'Submit Vote'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <MessageFooter item={item} isMe={isMe} />
    </TouchableOpacity>
  );
};

const MessageFooter = ({ item, isMe }) => {
  const messageDate = new Date(item.created_at);
  const formattedTime = messageDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = messageDate.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.messageTimeContainer}>
      {item.like_count > 0 && (
        <View style={styles.likeIconContainer}>
          <Icon name="heart" size={14} color="#ff4d6d" />
          {item.likes_count > 1 && (
            <Text style={styles.likeCountText}>{item.likes_count}</Text>
          )}
        </View>
      )}
      <Text style={styles.messageTime}>
        {formattedTime} • {formattedDate}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  fullMessageContainer: {
    marginBottom: 12,
  },
  myFullMessage: {
    alignItems: 'flex-end',
  },
  theirFullMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
    marginLeft: 8,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 8,
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    borderTopRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: 'black',
  },
  theirMessageText: {
    color: 'black',
  },
  messageTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#667781',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 2,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  pollContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionContainer: {
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#111',
  },
  submitButton: {
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  optionResultContainer: {
    marginBottom: 12,
  },
  pollBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginVertical: 4,
    overflow: 'hidden',
  },
  pollBar: {
    height: '100%',
    backgroundColor: '#8337B2',
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
  },
  replyAction: {
    backgroundColor: '#8337B2',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderRadius: 8,
    marginVertical: 5,
  },
  replyInputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#8337B2',
    padding: 10,
    borderRadius: 50,
  },
  replyContainer: {
    width: '100%',
  },
  originalMessageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ccc',
    marginBottom: 8,
  },
  originalMessageSender: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
  },
  originalMessageText: {
    fontSize: 14,
    color: '#333',
  },
  originalMessageImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginTop: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  optionsButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  fullScreenTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  myLikeContainer: {
    backgroundColor: 'rgba(220, 248, 198, 0.7)',
  },
  theirLikeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  likeIcon: {
    marginRight: 2,
  },
  likeCount: {
    fontSize: 12,
    color: '#ff4d6d',
  },
  likeIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  likeCountText: {
    fontSize: 11,
    color: '#ff4d6d',
    marginLeft: 2,
  },
  textMessageTouchable: {
    padding: 8,
  },
  pollTouchable: {
    padding: 8,
  },
  // Reaction bar styles
  reactionBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    padding: 12,
    marginTop: -60,
    elevation: 8,
    shadowColor: '#333',
    shadowOpacity: 0.15,
    shadowOffset: { width: 1, height: 2 },
  },
  reactionBarEmoji: {
    fontSize: 28,
    marginHorizontal: 8,
  },
  reactionBarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  // Reaction icon on message
  reactionIconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  reactionIcon: {
    fontSize: 21,
  },
});

export default MessagesList;

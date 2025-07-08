import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';
import fireStore from '@react-native-firebase/firestore';
import TopBar from './components/TopBar';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

type Message = {
  image: any;
  id: string;
  sendBy: string;
  sendTo: string;
  message: string;
  createdAt: any;
  status: string;
  attachment?: {
    name: string;
    size: string;
  };
  time?: string;
  imageUrl?: string;
};

const ChatScreen = () => {
  const route = useRoute();
  const {myChatId, data} = route.params as {
    myChatId: string;
    data: {id: string; firstName: string; lastName: string; name: string};
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(20);

  const flatListRef = useRef<FlatList>(null);

  const chatIdA = `${data.id}${myChatId}`;
  const chatIdB = `${myChatId}${data.id}`;

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages.length]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowSub = Keyboard.addListener(showEvent, (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      scrollToBottom();
    });

    const keyboardWillHideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
  }, [scrollToBottom]);

  // useEffect(() => {
  //   const unsubscribe = fireStore()
  //     .collection('chats')
  //     .doc(chatIdA)
  //     .collection('messages')
  //     .orderBy('createdAt', 'asc')
  //     .onSnapshot(snapshot => {
  //       const fetchedMessages = snapshot.docs
  //         .map(doc => ({
  //           id: doc.id,
  //           ...(doc.data() as Omit<Message, 'id'>),
  //         }))
  //         .filter(msg => msg.createdAt)
  //         .sort((a, b) => {
  //           const parseTime = (timeStr: string) => {
  //             const date = new Date('1970-01-01 ' + timeStr);
  //             return date.getTime();
  //           };
  //           return parseTime(a.createdAt || '') - parseTime(b.createdAt || '');
  //         });

  //       setMessages(fetchedMessages);
  //     });

  //   return unsubscribe;
  // }, [chatIdA, scrollToBottom]);
  const sendImage = async () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const imageMessage = {
        sendBy: myChatId,
        sendTo: data.id,
        message: '',
        image: asset.uri,
        createdAt: new Date(),
        status: 'read',
      };

      const batch = fireStore().batch();
      const refA = fireStore()
        .collection('chats')
        .doc(chatIdA)
        .collection('messages')
        .doc();
      const refB = fireStore()
        .collection('chats')
        .doc(chatIdB)
        .collection('messages')
        .doc();

      batch.set(refA, imageMessage);
      batch.set(refB, imageMessage);
      batch.commit();
    });
  };
const generateChatId = (userId1: string, userId2: string): string => {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

  // const sendMessage = () => {
  //   const trimmed = inputText.trim();
  //   if (!trimmed) return;

  //   const newMessage = {
  //     sendBy: myChatId,
  //     sendTo: data.id,
  //     message: trimmed,
  //     createdAt: new Date(),
  //     status: 'read',
  //   };

  //   setInputText('');

  //   const batch = fireStore().batch();

  //   const refA = fireStore()
  //     .collection('chats')
  //     .doc(chatIdA)
  //     .collection('messages')
  //     .doc();
  //   const refB = fireStore()
  //     .collection('chats')
  //     .doc(chatIdB)
  //     .collection('messages')
  //     .doc();

  //   batch.set(refA, newMessage);
  //   batch.set(refB, newMessage);

  //   batch.commit();
  // };
  
useEffect(() => {
  if (!myChatId || !data?.id) return;

  const chatId = generateChatId(myChatId, data.id);
  console.log('Chat ID:', myChatId,'data ID:', data.id, 'Generated Chat ID:', chatId);

  const unsubscribe = fireStore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(snapshot => {
      const fetchedMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Message, 'id'>),
        }))
        .filter(msg => msg.createdAt instanceof Date || !!msg.createdAt); // safer filter

      setMessages(fetchedMessages);

      // Optional: If you want to scroll after new messages, handle that separately.
      scrollToBottom?.(); // assuming scrollToBottom is a function
    });

  return unsubscribe;
}, [myChatId, data?.id]);
console.log('Messages:', messages);
  const sendMessage = async () => {
  const trimmed = inputText.trim();
  if (!trimmed) return;

  const chatId = generateChatId(myChatId, data.id);
  const chatRef = fireStore().collection('chats').doc(chatId);

  const newMessage = {
    sendBy: myChatId,
    sendTo: data.id,
    message: trimmed,
    createdAt: fireStore.FieldValue.serverTimestamp(),
    status: 'sent', // Optional: you can use 'pending', 'delivered' etc.
  };

  setInputText('');

  const batch = fireStore().batch();

  const messageRef = chatRef.collection('messages').doc();
  batch.set(messageRef, newMessage);

  // Also update chat metadata (e.g., last message preview in chats list)
  batch.set(
    chatRef,
    {
      members: [myChatId, data.id],
      lastMessage: trimmed,
      lastMessageTime: fireStore.FieldValue.serverTimestamp(),
      createdAt: fireStore.FieldValue.serverTimestamp(), // Will only be used if creating the chat for the first time
    },
    { merge: true }
  );

  await batch.commit();
};
  const handleCamera = () => {
    launchCamera({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const imageMessage = {
        sendBy: myChatId,
        sendTo: data.id,
        message: '',
        image: asset.uri,
        createdAt: new Date(),
        status: 'read',
      };

      const batch = fireStore().batch();
      const refA = fireStore()
        .collection('chats')
        .doc(chatIdA)
        .collection('messages')
        .doc();
      const refB = fireStore()
        .collection('chats')
        .doc(chatIdB)
        .collection('messages')
        .doc();

      batch.set(refA, imageMessage);
      batch.set(refB, imageMessage);
      batch.commit();
    });
  };
  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const refA = fireStore()
                .collection('chats')
                .doc(chatIdA)
                .collection('messages')
                .doc(messageId);
              const refB = fireStore()
                .collection('chats')
                .doc(chatIdB)
                .collection('messages')
                .doc(messageId);

              const batch = fireStore().batch();
              batch.delete(refA);
              batch.delete(refB);
              await batch.commit();
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          },
        },
      ],
    );
  };

  const renderMessage = useCallback(
    ({item}: {item: Message}) => {
      const isSent = item.sendBy === myChatId;
      console.log('Rendering message:', item);
      const MessageWrapper = isSent ? TouchableOpacity : View;
      // 📄 Attachment Message
      if (item.attachment) {
        return (
          <View
            style={[
              styles.messageContainer,
              isSent ? styles.sent : styles.received,
              {flexDirection: 'row', alignItems: 'center'},
            ]}>
            <Icon name="file-pdf-box" size={30} color="#fff" />
            <View style={{marginLeft: 10}}>
              <Text style={styles.attachmentName}>{item.attachment.name}</Text>
              <Text style={styles.attachmentSize}>{item.attachment.size}</Text>
            </View>
            <Icon
              name="dots-vertical"
              size={20}
              color="#fff"
              style={{marginLeft: 'auto'}}
            />
            <Text style={styles.time}>{item.time}</Text>
          </View>
        );
      }

      // 🖼️ Image Message
      if (item.image) {
        return (
          <TouchableOpacity>
             <View
            style={[
              styles.messageContainer,
              isSent ? styles.sent : styles.received,
            ]}>
            <Image
              source={{uri: item.image}}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                marginBottom: item.message ? 5 : 0,
              }}
              resizeMode="cover"
            />
            {item.message ? (
              <Text style={[styles.messageText, isSent && {color: '#fff'}]}>
                {item.message}
              </Text>
            ) : null}
            <Text style={styles.time}>
              {item.time}{' '}
              {isSent && item.status === 'read' && (
                <Icon name="check-all" size={14} color="#4caf50" />
              )}
            </Text>
          </View>
          </TouchableOpacity>
         
        );
      }

      // 📝 Text Message
      return (
        
        <MessageWrapper
          onLongPress={() => isSent && handleDeleteMessage(item.id)}
          delayLongPress={300}
          style={[
            styles.messageContainer,
            isSent ? styles.sent : styles.received,
          ]}>
          <Text style={[styles.messageText, isSent && {color: '#fff'}]}>
            {item.message}
          </Text>
          <Text style={styles.time}>
            {item.time}{' '}
            {isSent && item.status === 'read' && (
              <Icon name="check-all" size={14} color="#4caf50" />
            )}
          </Text>
        </MessageWrapper>
      );
    },
    [myChatId],
  );

  return (
    <>
      <TopBar />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={styles.header}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/1.jpg',
                }}
                style={styles.avatar}
              />
              
              <View>
                <Text style={styles.name}>
                  {data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : data.name}
                </Text>
                <Text style={styles.status}>● Online</Text>
              </View>
            </View>

            <View style={{flex: 1}}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                showsVerticalScrollIndicator
                contentContainerStyle={{
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  flexGrow: 1,
                }}
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
                keyboardShouldPersistTaps="handled"
              />
            </View>
            {/* Input */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                onPress={handleCamera}
                style={{marginRight: 10}}>
                <Icon name="camera" size={24} color="#6264A7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendImage} style={{marginRight: 10}}>
                <Icon name="image" size={26} color="#6264A7" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Write your message"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Icon name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 3,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    color: '#4caf50',
    fontSize: 12,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    borderRadius: 15,
    padding: 10,
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#6264A7',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#eeeeee',
  },
  messageText: {
    color: '#333',
  },
  time: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    width: 45,
    height: 45,
    backgroundColor: '#6264A7',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attachmentSize: {
    color: '#fff',
    fontSize: 12,
  },
});

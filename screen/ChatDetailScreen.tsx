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
  Modal,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';
import fireStore from '@react-native-firebase/firestore';
import TopBar from './components/TopBar';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import DocumentPicker from 'react-native-document-picker';
// import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import {pick, types, isCancel} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

const {width, height} = Dimensions.get('window');

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
    type: string;
    uri: string;
  };
  time?: string;
  imageUrl?: string;
};

const ChatScreen = () => {
  const route = useRoute();
  const {myChatId, data} = route.params as {
    myChatId: string;
    data: {id: string; first_name: string; last_name: string; name: string};
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(20);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // New states for image preview modal
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>('');
  const [previewImageCaption, setPreviewImageCaption] = useState('');

  // Document picker states
  const [documentPreviewModal, setDocumentPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [downloadingDocuments, setDownloadingDocuments] = useState<{
    [key: string]: boolean;
  }>({});

  //Loading
  const [loading, setLoading] = useState(false);

  // Simple emoji data - safe fallback
  const commonEmojis = [
    '😀',
    '😂',
    '🤣',
    '😊',
    '😍',
    '🥰',
    '😘',
    '😋',
    '😎',
    '🤔',
    '😴',
    '😴',
    '🙄',
    '😬',
    '🤐',
    '😷',
    '👍',
    '👎',
    '👌',
    '✌️',
    '🤞',
    '👏',
    '🙌',
    '💪',
    '❤️',
    '💕',
    '💖',
    '💗',
    '💙',
    '💚',
    '💛',
    '🧡',
    '🔥',
    '⭐',
    '✨',
    '💫',
    '🎉',
    '🎊',
    '🎈',
    '🎁',
  ];

  const flatListRef = useRef<FlatList>(null);

  const chatIdA = `${data.id}${myChatId}`;
  const chatIdB = `${myChatId}${data.id}`;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
  const downloadDocument = async (attachment: any, messageId: string) => {
    try {
      // Request permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
        return;
      }

      // Set downloading state
      setDownloadingDocuments(prev => ({...prev, [messageId]: true}));

      // Get file extension
      const fileExtension = attachment.name.split('.').pop() || 'file';
      const fileName = attachment.name || `document_${Date.now()}.${fileExtension}`;

      // Determine download path
      const downloadPath = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      console.log('Downloading to:', downloadPath);
      console.log('Download URL:', attachment.uri);

      // Download the file
      const downloadResult = await RNFS.downloadFile({
        fromUrl: attachment.uri,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log('Download progress:', progress.toFixed(2) + '%');
        },
      }).promise;

      // Clear downloading state
      setDownloadingDocuments(prev => ({...prev, [messageId]: false}));

      if (downloadResult.statusCode === 200) {
        Alert.alert(
          'Download Complete',
          `File saved to: ${Platform.OS === 'ios' ? 'Files app' : 'Downloads folder'}`,
          [
            { text: 'OK' },
            Platform.OS === 'android' ? {
              text: 'Open Folder',
              onPress: () => {
                // Open file manager to downloads folder
                Linking.openURL('content://com.android.externalstorage.documents/document/primary%3ADownload')
                  .catch(() => {
                    Alert.alert('Info', 'Please check your Downloads folder');
                  });
              }
            } : undefined
          ].filter(Boolean)
        );

        console.log('Download successful:', downloadPath);
      } else {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }

    } catch (error) {
      console.error('Download error:', error);
      setDownloadingDocuments(prev => ({...prev, [messageId]: false}));
      
      Alert.alert(
        'Download Failed',
        'Unable to download the file. Please check your internet connection and try again.',
        [
          { text: 'OK' },
          {
            text: 'Open in Browser',
            onPress: () => {
              Linking.openURL(attachment.uri).catch(() => {
                Alert.alert('Error', 'Unable to open file');
              });
            }
          }
        ]
      );
    }
  };

  // Updated upload function with custom storage URL
  const uploadImageToStorage = async (uri: string, fileName: string) => {
    try {
      // Use the custom Firebase Storage bucket
      const reference = storage()
        .refFromURL('gs://chatfeature-8d518.firebasestorage.app')
        .child(`chat_images/${fileName}`);

      await reference.putFile(uri);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Updated upload function with custom storage URL for documents
  const uploadDocumentToStorage = async (uri: string, fileName: string) => {
    try {
      let fileUri = uri;

      // If it's a content URI, copy it to cache directory first
      if (uri.startsWith('content://')) {
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(uri, cachePath);
        fileUri = cachePath;
      }

      // Use the custom Firebase Storage bucket
      const reference = storage()
        .refFromURL('gs://chatfeature-8d518.firebasestorage.app')
        .child(`chat_documents/${fileName}`);

      await reference.putFile(fileUri);

      // Clean up the temporary file if we created one
      if (uri.startsWith('content://')) {
        await RNFS.unlink(fileUri).catch(() => {}); // Ignore errors
      }

      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  };
  const generateChatId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fixed document picker function
  const pickDocument = async () => {
    try {
      // Real implementation with new package
      const result = await pick({
        type: [types.allFiles], // same as DocumentPicker.types.allFiles
        allowMultiSelection: false,
      });
      console.log(result);
      if (result && result.length > 0) {
        setSelectedDocument(result[0]); // result is an array of picked files
        setDocumentPreviewModal(true);
      }
    } catch (err: any) {
      if (!isCancel(err)) {
        // new helper for cancel detection
        console.log('Document picker error:', err);
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const sendDocumentFromPreview = async () => {
    if (!selectedDocument) return;

    try {
      console.log('Uploading document...');

      const chatId = generateChatId(myChatId, data.id);
      const chatRef = fireStore().collection('chats').doc(chatId);
      const fileName = `${Date.now()}_${selectedDocument.name}`;

      const documentUrl = await uploadDocumentToStorage(
        selectedDocument.uri,
        fileName,
      );

      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const documentMessage = {
        sendBy: myChatId,
        sendTo: data.id,
        message: '',
        attachment: {
          name: selectedDocument.name,
          size: formatFileSize(selectedDocument.size || 0),
          type: selectedDocument.type,
          uri: documentUrl,
        },
        createdAt: fireStore.FieldValue.serverTimestamp(),
        status: 'sent',
      };

      const batch = fireStore().batch();
      const messageRef = chatRef.collection('messages').doc();
      batch.set(messageRef, documentMessage);

      // Update chat metadata
      batch.set(
        chatRef,
        {
          members: [myChatId, data.id],
          lastMessage: `📄 ${selectedDocument.name}`,
          lastMessageTime: fireStore.FieldValue.serverTimestamp(),
          createdAt: fireStore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );

      await batch.commit();
      console.log('Document message sent successfully');

      // Close modal and reset states
      setDocumentPreviewModal(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error sending document:', error);
      Alert.alert('Error', 'Failed to send document. Please try again.');
    }
  };

  useEffect(() => {
    if (!myChatId || !data?.id) {
      console.log('inthere');
    }

    const chatId = generateChatId(myChatId, data.id);

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
          .filter(msg => msg.createdAt instanceof Date || !!msg.createdAt);

        setMessages(fetchedMessages);
        scrollToBottom?.();
      });

    return unsubscribe;
  }, [myChatId, data?.id]);

  // Updated sendImage function to show preview modal
  const sendImage = async () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      // Show preview modal instead of sending directly
      setPreviewImageUri(asset.uri);
      setPreviewImageCaption('');
      setImagePreviewModal(true);
    });
  };

  // Updated handleCamera function to show preview modal
  const handleCamera = () => {
    launchCamera({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel || response.errorCode) return;

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      // Show preview modal instead of sending directly
      setPreviewImageUri(asset.uri);
      setPreviewImageCaption('');
      setImagePreviewModal(true);
    });
  };

  // Function to actually send the image after preview
  const sendImageFromPreview = async () => {
    if (!previewImageUri) return;
    setLoading(true);

    const chatId = generateChatId(myChatId, data.id);
    const chatRef = fireStore().collection('chats').doc(chatId);
    const fileName = `IMG_${Date.now()}.jpg`;
    const imageUrl = await uploadImageToStorage(previewImageUri, fileName);

    const imageMessage = {
      sendBy: myChatId,
      sendTo: data.id,
      message: previewImageCaption.trim(),
      imageUrl, // 🔥 now saving the Firebase URL
      createdAt: fireStore.FieldValue.serverTimestamp(),
      status: 'sent',
    };

    const batch = fireStore().batch();
    const messageRef = chatRef.collection('messages').doc();
    batch.set(messageRef, imageMessage);

    // Update chat metadata
    batch.set(
      chatRef,
      {
        members: [myChatId, data.id],
        lastMessage: previewImageCaption.trim() || 'Photo',
        lastMessageTime: fireStore.FieldValue.serverTimestamp(),
        createdAt: fireStore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );

    await batch.commit();

    // Close modal and reset states
    setLoading(false);
    setImagePreviewModal(false);
    setPreviewImageUri('');
    setPreviewImageCaption('');
  };

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
      status: 'sent',
    };

    setInputText('');

    const batch = fireStore().batch();
    const messageRef = chatRef.collection('messages').doc();
    batch.set(messageRef, newMessage);

    batch.set(
      chatRef,
      {
        members: [myChatId, data.id],
        lastMessage: trimmed,
        lastMessageTime: fireStore.FieldValue.serverTimestamp(),
        createdAt: fireStore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );

    await batch.commit();
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
      const MessageWrapper = isSent ? TouchableOpacity : View;
            const isDownloading = downloadingDocuments[item.id] || false;


      // Attachment Message
      if (item.attachment) {
        const getFileIcon = (type: string) => {
          if (type?.includes('pdf')) return 'file-pdf-box';
          if (type?.includes('word') || type?.includes('document'))
            return 'file-word-box';
          if (type?.includes('excel') || type?.includes('spreadsheet'))
            return 'file-excel-box';
          if (type?.includes('powerpoint') || type?.includes('presentation'))
            return 'file-powerpoint-box';
          if (type?.includes('text')) return 'file-document-outline';
          return 'file-outline';
        };

        const getFileColor = (type: string) => {
          if (type?.includes('pdf')) return '#FF6B6B';
          if (type?.includes('word') || type?.includes('document'))
            return '#4ECDC4';
          if (type?.includes('excel') || type?.includes('spreadsheet'))
            return '#45B7D1';
          if (type?.includes('powerpoint') || type?.includes('presentation'))
            return '#FFA07A';
          return '#96CEB4';
        };

        return (
        <TouchableOpacity
            onLongPress={() => isSent && handleDeleteMessage(item.id)}
            delayLongPress={300}>
            <View
              style={[
                styles.messageContainer,
                isSent ? styles.sent : styles.received,
                styles.attachmentContainer,
              ]}>
              <View style={styles.attachmentContent}>
                <View
                  style={[
                    styles.fileIconContainer,
                    {backgroundColor: getFileColor(item.attachment.type || '')},
                  ]}>
                  <Icon
                    name={getFileIcon(item.attachment.type || '')}
                    size={24}
                    color="#fff"
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text
                    style={[styles.attachmentName, isSent && {color: '#fff'}]}>
                    {item.attachment.name}
                  </Text>
                  <Text
                    style={[styles.attachmentSize, isSent && {color: '#ddd'}]}>
                    {item.attachment.size}
                  </Text>
                </View>
                
                {/* Enhanced Download Button */}
                <TouchableOpacity
                  style={[styles.downloadButton, isDownloading && styles.downloadingButton]}
                  onPress={() => downloadDocument(item.attachment, item.id)}
                  disabled={isDownloading}>
                  {isDownloading ? (
                    <ActivityIndicator size="small" color={isSent ? '#fff' : '#666'} />
                  ) : (
                    <Icon
                      name="download"
                      size={20}
                      color={isSent ? '#fff' : '#666'}
                    />
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.time, isSent && {color: '#ddd'}]}>
                {isDownloading && (
                  <Text style={styles.downloadingText}>Downloading... </Text>
                )}
                {item.time}{' '}
                {isSent && item.status === 'read' && (
                  <Icon name="check-all" size={14} color="#4caf50" />
                )}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      // Image Message
      if (item.imageUrl) {
        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(item?.imageUrl);
              setImageViewerVisible(true);
            }}>
            <View
              style={[
                styles.messageContainer,
                isSent ? styles.sent : styles.received,
              ]}>
              <Image
                source={{uri: item.imageUrl}}
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

      // Text Message
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
                  {data.first_name && data.last_name
                    ? `${data.first_name} ${data.last_name}`
                    : data.name}
                </Text>
                {/* <Text style={styles.status}>● Online</Text> */}
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
                keyboardShouldPersistTaps="handled"
              />
            </View>

            {/* Input Container */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                onPress={() => {
                  setShowEmojiPicker(prev => !prev);
                }}
                style={{marginRight: 10}}>
                <Icon name="emoticon-outline" size={26} color="#6264A7" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCamera}
                style={{marginRight: 10}}>
                <Icon name="camera" size={24} color="#6264A7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendImage} style={{marginRight: 10}}>
                <Icon name="image" size={26} color="#6264A7" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickDocument}
                style={{marginRight: 10}}>
                <Icon name="paperclip" size={24} color="#6264A7" />
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

         {showEmojiPicker && (
              <View style={styles.emojiContainer}>
                <View style={styles.emojiHeader}>
                  <Text style={styles.emojiTitle}>Choose Emoji</Text>
                  <TouchableOpacity
                    onPress={() => setShowEmojiPicker(false)}
                    style={styles.emojiCloseButton}>
                    <Icon name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={commonEmojis}
                  numColumns={8}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.emojiItem}
                      onPress={() => {
                        setInputText(prev => prev + item);
                        setShowEmojiPicker(false);
                      }}>
                      <Text style={styles.emojiText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )} 
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImagePreviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.imagePreviewContainer}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={() => setImagePreviewModal(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Send Photo</Text>
              <View style={{width: 24}} />
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{uri: previewImageUri}}
                style={styles.previewImage}
                resizeMode="contain"
              />

              {/* Loader overlay on top of the image */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>

            {/* Caption Input with Emoji Support */}
            <View style={styles.captionContainer}>
              <View style={styles.captionInputContainer}>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Add a caption..."
                  placeholderTextColor="#999"
                  value={previewImageCaption}
                  onChangeText={setPreviewImageCaption}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity
                  style={styles.emojiButtonInModal}
                  onPress={() => setShowEmojiPicker(false)}>
                  <Icon name="emoticon-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Send Button with Loading State */}
            <TouchableOpacity
              style={styles.sendImageButton}
              onPress={sendImageFromPreview}>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Send Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        visible={documentPreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDocumentPreviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.documentPreviewContainer}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={() => setDocumentPreviewModal(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Send Document</Text>
              <View style={{width: 24}} />
            </View>

            {/* Document Preview */}
            <View style={styles.documentContainer}>
              <View style={styles.documentPreview}>
                <View style={styles.largeFileIcon}>
                  <Icon
                    name={
                      selectedDocument?.type?.includes('pdf')
                        ? 'file-pdf-box'
                        : selectedDocument?.type?.includes('word')
                        ? 'file-word-box'
                        : selectedDocument?.type?.includes('excel')
                        ? 'file-excel-box'
                        : 'file-outline'
                    }
                    size={60}
                    color="#6264A7"
                  />
                </View>
                <Text style={styles.documentName}>
                  {selectedDocument?.name}
                </Text>
                <Text style={styles.documentSize}>
                  {selectedDocument?.size
                    ? typeof selectedDocument.size === 'string'
                      ? selectedDocument.size
                      : `${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB`
                    : 'Unknown size'}
                </Text>
                <Text style={styles.documentType}>
                  {selectedDocument?.type?.split('/').pop()?.toUpperCase() ||
                    'FILE'}
                </Text>
              </View>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={styles.sendImageButton}
              onPress={sendDocumentFromPreview}>
              <Icon name="send" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Send Document</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setImageViewerVisible(false)}>
          <View style={styles.imageViewerOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Image
                source={{uri: selectedImage}}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingBottom: 0,
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#eeeeee',
    paddingBottom: 0,
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
    paddingBottom: 30,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
  },
  attachmentContainer: {
    minWidth: 200,
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  downloadingText: {
  fontSize: 14,             // slightly smaller for status text
  color: '#6264A7',         // matching your primary color palette
  fontWeight: '500',        // medium weight
  textAlign: 'center',      // center-align for clarity
  marginTop: 8,             // spacing above
  marginBottom: 8,          // spacing below
},
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  downloadButton: {
    padding: 5,
    marginLeft: 10,
  },
  // New styles for image preview modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewImage: {
    width: width - 40,
    height: height * 0.6,
    borderRadius: 10,
  },
  captionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  captionInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingRight: 10,
  },
  captionInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  emojiButtonInModal: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6264A7',
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Image viewer styles
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.8,
  },
  // Emoji picker styles
  emojiContainer: {
    height: 250,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.4,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  emojiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emojiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emojiCloseButton: {
    padding: 5,
  },
  emojiGrid: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  emojiItem: {
    width: (width - 40) / 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  emojiText: {
    fontSize: 24,
  },
  // Document preview styles
  documentPreviewContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  documentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  documentPreview: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 20,
    minWidth: 250,
  },
  largeFileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  documentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  documentSize: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
  },
  documentType: {
    color: '#bbb',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

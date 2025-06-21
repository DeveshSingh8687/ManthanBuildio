import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../navigation/Navigation';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import TopBar from './components/TopBar';
import fireStore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './components/BottomNavigaionBar';
import 'firebase/auth';
import 'firebase/firestore';
type Message = {
  id: string;
  text?: string;
  createdAt?: any;
  senderId?: string;
  // Add other fields as needed based on your Firestore message schema
};

const ChatListScreen = () => {
  const [chatId, setChatId] = useState('');




  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [users, setUsers] = React.useState<any[]>([]);
  useEffect(() => {
    getUsers();
  }, []);
  const getUsers = async () => {
    const storedChatId = (await AsyncStorage.getItem('USERID')) || '';
    setChatId(storedChatId); // ✅ use state instead of global variable
    console.log('chatId', storedChatId);

    const myEmail = await AsyncStorage.getItem('EMAIL');

    try {
      const res = await fireStore().collection('users').get();
      // Removed: const authUsers = await firebase.auth().listUsers();

      // Filter out current user email
      const filteredUsers = res.docs
        .map(doc => {
          const data = doc.data();
          data.id = doc.id; // assign document ID for keyExtractor
          return data;
        })
        .filter(user => user.email !== myEmail && user.email !== '');

      setUsers(filteredUsers);
    } catch (error) {}
  };
  // Subscribe to chats where current user is a participant

  console.log(users, 'ususers');

  // Random avatar fallback
  const getRandomAvatar = (index: number) => {
    const gender = index % 2 === 0 ? 'men' : 'women';
    const imgNum = (index % 99) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${imgNum}.jpg`;
  };
    const [messages, setMessages] = useState<Message[]>([]);
  
  const chatIdA = chatId || 'defaultChatId'; // Fallback to a default chat ID if not set
   useEffect(() => {
    const unsubscribe = fireStore()
      .collection('chats')
      .doc(chatIdA)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const fetchedMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Message, 'id'>),
          }))
          
        console.log('Fetched messages :', fetchedMessages);
        setMessages(fetchedMessages);
        // 👇 This will ensure scrolling works when new messages arrive

      });

    return unsubscribe;
  }, [chatIdA]);
  console.log(messages)
  const renderItem = ({item, index}: {item: any; index: number}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatDetailScreen', {
          myChatId: chatId,
          data: item,
        })
      }>
      <Image
        source={{
          uri: item.avatarUrl || getRandomAvatar(index),
        }}
        style={styles.avatar}
      />{' '}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>
            {item.firstName && item.lastName
              ? `${item.firstName} ${item.lastName}`
              : item.name}
          </Text>{' '}
          <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.chatFooter}>
          {/* <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TopBar />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            // You can implement search filtering here if needed
          />
        </View>

        {/* Chat List */}
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 20}}>
              No chats found
            </Text>
          }
        />
      </View>
      <BottomTabBar />
    </>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8ECF4',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderColor: '#DDD',
    paddingBottom: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatTime: {
    color: '#999',
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    color: '#555',
    flex: 1,
    fontSize: 14,
  },
});

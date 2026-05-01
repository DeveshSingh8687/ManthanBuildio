import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {generateChatId, markMessagesAsRead} from '../utils/chatUtils';

interface ChatInfo {
  lastMessage: string;
  lastMessageTime: any;
  lastMessageBy: string;
  unreadCount: number;
}

const ChatListScreen = () => {
  const [currentUserId, setCurrentUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [chatInfos, setChatInfos] = useState<{[key: string]: ChatInfo}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Memoized function to get random avatar
  const getRandomAvatar = useCallback((index: number) => {
    const gender = index % 2 === 0 ? 'men' : 'women';
    const imgNum = (index % 99) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${imgNum}.jpg`;
  }, []);

  // Optimized timestamp formatting
  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24)
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7)
        return date.toLocaleDateString([], {weekday: 'short'});
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }, []);

  // Initialize current user ID
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const [userString, storedUserId] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('USERID'),
        ]);

        let userId = storedUserId;
        if (!userId && userString) {
          const user = JSON.parse(userString);
          userId = user.id;
        }

        if (userId) setCurrentUserId(userId);
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const [myEmail, token] = await Promise.all([
        AsyncStorage.getItem('EMAIL'),
        AsyncStorage.getItem('authToken'),
      ]);

      const response = await fetch(
        'https://buildio.co.nz/api/chats/users_list',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        const filteredUsers = result.data.filter(
          (user: any) => user.email !== myEmail && user.email !== '',
        );
        setUsers(filteredUsers);
      } else {
        console.error('Failed to fetch users:', result.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch users when currentUserId is available
  useEffect(() => {
    if (currentUserId) fetchUsers();
  }, [currentUserId, fetchUsers]);

  // Subscribe to chat updates
  useEffect(() => {
    if (!currentUserId || users.length === 0) return;

    const unsubscribes = users.map(user => {
      const chatDocId = generateChatId(currentUserId, user.id);

      return fireStore()
        .collection('chats')
        .doc(chatDocId)
        .onSnapshot(
          chatDoc => {
            const chatData = chatDoc.data();
            const unreadCount = chatData?.unreadCounts?.[currentUserId] || 0;
            console.log(unreadCount,'unreadCount')

            setChatInfos(prev => ({
              ...prev,
              [user.id]: {
                lastMessage: chatData?.lastMessage || '',
                lastMessageTime: chatData?.lastMessageTime || null,
                lastMessageBy: chatData?.lastMessageBy || '',
                unreadCount,
              },
            }));
          },
          error =>
            console.error(`Error listening to chat ${chatDocId}:`, error),
        );
    });

    return () => {
      unsubscribes.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [currentUserId, users]);

  // Handle chat press
  const handleChatPress = useCallback(
    async (user: any) => {
      try {
        await markMessagesAsRead(currentUserId, user.id);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }

      navigation.navigate('ChatDetailScreen', {
        myChatId: currentUserId,
        data: user,
      });
    },
    [currentUserId, navigation],
  );

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = users.filter(user => {
        const fullName = `${user.first_name || ''} ${
          user.last_name || ''
        }`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    // Sort by last message time (most recent first)
    return filtered.sort((a, b) => {
      const timeA = chatInfos[a.id]?.lastMessageTime;
      const timeB = chatInfos[b.id]?.lastMessageTime;

      if (timeA && timeB) {
        const dateA = timeA.toDate ? timeA.toDate() : new Date(timeA);
        const dateB = timeB.toDate ? timeB.toDate() : new Date(timeB);
        return dateB.getTime() - dateA.getTime();
      }

      if (timeA && !timeB) return -1;
      if (!timeA && timeB) return 1;

      // Sort alphabetically if no timestamps
      const nameA =
        `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email;
      const nameB =
        `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email;
      return nameA.localeCompare(nameB);
    });
  }, [users, chatInfos, searchQuery]);

  // Render chat item
  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const chatInfo = chatInfos[item.id] || {
        lastMessage: '',
        lastMessageTime: null,
        lastMessageBy: '',
        unreadCount: 0,
      };

      const {unreadCount, lastMessage, lastMessageTime, lastMessageBy} =
        chatInfo;
      console.log(chatInfo, 'chatInfo');

      const hasUnread = unreadCount > 0;
      const isLastMessageFromMe = lastMessageBy === currentUserId;
      const displayName =
        item.first_name && item.last_name
          ? `${item.first_name} ${item.last_name}`
          : item.email;

      return (
        <TouchableOpacity
          style={[styles.chatItem, hasUnread && styles.unreadChatItem]}
          onPress={() => handleChatPress(item)}
          activeOpacity={0.7}>
          <View style={styles.avatarContainer}>
            <Image
              source={{uri: item.profile_picture || getRandomAvatar(index)}}
              style={styles.avatar}
            />
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text
                style={[styles.chatName, hasUnread && styles.unreadChatName]}
                numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.chatTime}>{formatTime(lastMessageTime)}</Text>
            </View>

            <View style={styles.chatFooter}>
              <View style={styles.lastMessageContainer}>
                {lastMessage ? (
                  <Text
                    style={[
                      styles.lastMessage,
                      hasUnread && styles.unreadLastMessage,
                    ]}
                    numberOfLines={1}>
                    {isLastMessageFromMe ? 'You: ' : ''}
                    {lastMessage}
                  </Text>
                ) : (
                  <Text style={styles.noMessage}>No messages yet</Text>
                )}
              </View>
              {hasUnread && (
                <View style={styles.unreadIndicator}>
                  <Text style={styles.unreadText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [chatInfos, currentUserId, handleChatPress, formatTime, getRandomAvatar],
  );

  return (
    <>
      <TopBar />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}>
              <Icon name="close" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredAndSortedUsers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Loading conversations...'
                  : searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
              </Text>
              {!loading && !searchQuery && (
                <TouchableOpacity
                  onPress={fetchUsers}
                  style={styles.refreshButton}>
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
      <BottomTabBar />
    </>
  );
};

export default React.memo(ChatListScreen);

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
  clearButton: {
    padding: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  unreadChatItem: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#6264A7',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
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
  unreadChatName: {
    fontWeight: 'bold',
    color: '#000',
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
  lastMessageContainer: {
    flex: 1,
    marginRight: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadLastMessage: {
    color: '#333',
    fontWeight: '600',
  },
  noMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  unreadIndicator: {
    backgroundColor: '#6264A7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    color: '#6264A7',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

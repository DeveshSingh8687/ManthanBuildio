import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, NavigationProp, useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import {NavPopup} from './components/Modal';
import TopBar from './components/TopBar';
import {fetchMyPosts, handleDeletePost} from '../utils/fetchPosts';
import Heading from './components/CommonHeader';
import ImageSlider from './components/ImageSlider';
import CustomModal from './components/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {capitalizeFirstLetter} from '../utils/helper';

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------
const PostCard = ({item, navigation, onDeletePress}: any) => {
  const [likes, setLikes] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const descriptionWords = item.description ? item.description.split(/\s+/) : [];
  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to like posts.');
        return;
      }
      const response = await fetch(
        `https://buildio.co.nz/api/posts/like/${item.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'multipart/form-data',
          },
        },
      );
      if (!response.ok) throw new Error('Failed to toggle like');
      const data = await response.json();
      if (data?.status && data?.message) {
        if (data.message === 'Post Liked') {
          item.likes_count = item.likes_count + 1;
          item.is_liked = true;
        } else if (data.message === 'Post Unliked') {
          item.likes_count = Math.max(0, item.likes_count - 1);
          item.is_liked = false;
        }
      }
      setLikes(prev => prev + 1);
    } catch (error) {
      Alert.alert('Error', 'Unable to update like. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      if (isCreatingLink) return;
      const userName =
        item.user?.first_name && item.user?.last_name
          ? `${item.user.first_name} ${item.user.last_name}`
          : 'Someone';
      const shareableLink = `buildio://Home`;
      const shareContent = {
        title: 'Job Opportunity',
        message: `🔥 Amazing Job Opportunity!\n\n👤 Posted by: ${userName}\n📅 Date: ${new Date(
          item.createdAt,
        ).toDateString()}\n\n${
          item.description
            ? item.description.length > 100
              ? item.description.substring(0, 100) + '...'
              : item.description
            : 'Check out this great opportunity!'
        }\n\n📱 Open in app: ${shareableLink}`,
        url: shareableLink,
      };
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Error', 'Unable to share this job. Please try again.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{uri: item.user?.profile_picture || 'https://via.placeholder.com/50'}}
          style={styles.avatar}
        />
        <View style={{flex: 1}}>
          <Text style={styles.name}>
            {capitalizeFirstLetter(item.user?.first_name)}{' '}
            {capitalizeFirstLetter(item.user?.last_name)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Edit & Delete */}
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddPostScreen', {updateFeed: true, item})
            }
            style={{paddingHorizontal: 4}}>
            <Icon name="edit" size={20} color="#6264A7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDeletePress(item.id)}
            style={{paddingHorizontal: 4}}>
            <Icon name="delete" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Images */}
      <ImageSlider images={item.images} />

      {/* Description */}
      <Text style={styles.content}>{displayText}</Text>
      {isLong && (
        <Text
          style={{color: '#6264A7', marginTop: 4}}
          onPress={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      )}

      {/* Like & Share */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Icon
            name={item.is_liked ? 'favorite' : 'favorite-border'}
            size={20}
            color={item.is_liked ? '#e0245e' : '#6264A7'}
          />
          <Text style={styles.buttonLabel}>{item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, isCreatingLink && styles.disabledButton]}
          onPress={handleShare}
          disabled={isCreatingLink}>
          <Icon name="share" size={20} color="#6264A7" />
          <Text style={styles.buttonLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// FooterLoader
// ---------------------------------------------------------------------------
const FooterLoader = ({isVisible}: {isVisible: boolean}) => {
  if (!isVisible) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color="#6264A7" />
      <Text style={styles.loadingText}>Loading more posts...</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Icon name="article" size={64} color="#ccc" />
    <Text style={styles.emptyTitle}>No Posts Yet</Text>
    <Text style={styles.emptySubtitle}>
      {"You haven't created any posts yet.\nTap the + button to get started!"}
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// MyFeed screen
// ---------------------------------------------------------------------------
export default function MyFeed() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // ✅ Ref tracks pagination state synchronously — prevents duplicate API calls
  const paginationRef = useRef({
    currentPage: 1,
    loadingMore: false,
    hasMoreData: true,
  });

  const loadPosts = useCallback(
    async (page: number = 1, isLoadMore: boolean = false) => {
      if (isLoadMore && paginationRef.current.loadingMore) return;
      if (isLoadMore && !paginationRef.current.hasMoreData) return;

      try {
        if (isLoadMore) {
          paginationRef.current.loadingMore = true;
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const fetchedPosts = await fetchMyPosts(page, 10);

        const noMoreData = fetchedPosts.length < 10;
        paginationRef.current.hasMoreData = !noMoreData;
        paginationRef.current.currentPage = page;

        if (isLoadMore) {
          // ✅ Deduplicate before appending
          setPosts(prev => {
            const existingIds = new Set(prev.map((p: any) => p.id));
            const newPosts = fetchedPosts.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newPosts];
          });
        } else {
          setPosts(fetchedPosts);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        paginationRef.current.loadingMore = false;
        setLoadingMore(false);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // ✅ Reload from page 1 every time screen is focused (e.g. after editing a post)
  useFocusEffect(
    useCallback(() => {
      paginationRef.current = {currentPage: 1, loadingMore: false, hasMoreData: true};
      loadPosts(1, false);
    }, [loadPosts]),
  );

  const handleLoadMore = useCallback(() => {
    if (!paginationRef.current.loadingMore && paginationRef.current.hasMoreData) {
      loadPosts(paginationRef.current.currentPage + 1, true);
    }
  }, [loadPosts]);

  const handleRefresh = useCallback(() => {
    paginationRef.current = {currentPage: 1, loadingMore: false, hasMoreData: true};
    setRefreshing(true);
    loadPosts(1, false);
  }, [loadPosts]);

  const confirmDeletePost = (postId: number) => {
    setSelectedPostId(postId);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPostId) return;
    setDeleteModalVisible(false);
    try {
      const data = await handleDeletePost(selectedPostId);
      setModalTitle('Success');
      setModalMessage(data.message || 'Post deleted successfully.');
      setResultModalVisible(true);
      handleRefresh(); // Reload from page 1 after deletion
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Failed to delete post.');
      setResultModalVisible(true);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <TopBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Heading>My Feed</Heading>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#6264A7" style={{marginTop: 20}} />
      ) : error ? (
        <Text style={{color: 'red', textAlign: 'center', marginTop: 20}}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          renderItem={({item}) => (
            <PostCard
              item={item}
              navigation={navigation}
              onDeletePress={confirmDeletePost}
            />
          )}
          contentContainerStyle={[
            styles.list,
            posts.length === 0 && styles.emptyList,
          ]}
          // ✅ Infinite scroll
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={<FooterLoader isVisible={loadingMore} />}
          // ✅ Empty state
          ListEmptyComponent={<EmptyState />}
          // ✅ Pull-to-refresh
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // ✅ Performance
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />
      )}

      {/* Confirm Delete Modal */}
      <CustomModal
        visible={deleteModalVisible}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
        buttonText="Cancel"
        confirmText="Delete"
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Result Modal */}
      <CustomModal
        visible={resultModalVisible}
        title={modalTitle}
        message={modalMessage}
        buttonText="OK"
        onClose={() => setResultModalVisible(false)}
      />

      <View style={{height: 100}} />
      <BottomTabBar />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  emptyList: {
    flexGrow: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    marginRight: 8,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: '#6264A7',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6264A7',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
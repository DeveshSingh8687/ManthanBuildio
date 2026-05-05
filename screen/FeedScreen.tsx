import React, {useEffect, useState, useCallback} from 'react';
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
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import {NavPopup} from './components/Modal';
import TopBar from './components/TopBar';
import {fetchPosts} from '../utils/fetchPosts';
import Heading from './components/CommonHeader';
import ImageSlider from './components/ImageSlider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { capitalizeFirstLetter } from '../utils/helper';
interface FeedProps {
  myJobs?: { data: any[]; [key: string]: any };
}

const PostCard = ({item, navigation}: any) => {
  const [likes, setLikes] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const descriptionWords = item.description
    ? item.description.split(/\s+/)
    : [];
  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');

  const createFirebaseDynamicLink = async (jobId: string) => {
    try {
      setIsCreatingLink(true);

      // Uncomment this when you set up Firebase Dynamic Links
      /*
      const link = await dynamicLinks().buildLink({
        link: `https://yourapp.com/job/${jobId}`,
        domainUriPrefix: 'https://yourapp.page.link',
        android: {
          packageName: 'com.yourapp',
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.yourapp',
        },
        ios: {
          bundleId: 'com.yourapp.ios',
          fallbackUrl: 'https://apps.apple.com/app/your-app/id123456789',
        },
        social: {
          title: `Job Opportunity - ${item.user?.first_name || 'Unknown'} ${item.user?.last_name || 'User'}`,
          descriptionText: item.description?.substring(0, 100) + '...' || 'Check out this job opportunity!',
          imageUrl: item.images?.[0] || 'https://yourapp.com/default-job-image.png',
        },
      });
      */

      // 🔥 Use deep link for local app
      const link = `buildio://job/${jobId}`;

      setIsCreatingLink(false);
      return link;
    } catch (error) {
      console.error('Error creating dynamic link:', error);
      setIsCreatingLink(false);
      return null;
    }
  };

  const handleShareWithDynamicLink = async () => {
    try {
      if (isCreatingLink) return;

      const userName =
        item.user?.first_name && item.user?.last_name
          ? `${item.user.first_name} ${item.user.last_name}`
          : 'Someone';

      // 🔥 Create deep link for local app
 const shareableLink = `buildio://Home`;
      if (!shareableLink) {
        Alert.alert('Error', 'Failed to create share link. Please try again.');
        return;
      }

      const shareContent = {
        title: 'Job Opportunity',
        message: `🔥 Amazing Job Opportunity!

👤 Posted by: ${userName}
📅 Date: ${new Date(item.createdAt).toDateString()}

${
  item.description
    ? item.description.length > 100
      ? item.description.substring(0, 100) + '...'
      : item.description
    : 'Check out this great opportunity!'
}

📱 Open in BuildIO app: ${shareableLink}

If you don't have the app installed, search for "BuildIO" in your app store!`,
        url: shareableLink,
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        console.log('Job shared successfully with deep link!');
      }
    } catch (error: any) {
      console.error('Error sharing with dynamic link:', error);
      Alert.alert('Error', 'Unable to share this job. Please try again.');
    }
  };

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
      console.log('Like API response:', data);

      if (data?.status && data?.message) {
        if (data.message === 'Post Liked') {
          item.likes_count = item.likes_count + 1;
          item.is_liked = true;
        } else if (data.message === 'Post Unliked') {
          item.likes_count = Math.max(0, item.likes_count - 1);
          item.is_liked = false;
        }
      }

      // Force re-render
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Unable to update like. Please try again.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: item.user?.profile_picture || 'https://via.placeholder.com/50',
          }}
          style={styles.avatar}
        />
        <View style={{flex: 1}}>
          <Text style={styles.name}>
            {capitalizeFirstLetter(item.user?.first_name)} {capitalizeFirstLetter(item.user?.last_name)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Image */}
      <ImageSlider images={item.images} />

      {/* Description with Show more/less */}
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
          <Icon name="thumb-up" size={20} color="#6264A7" />
          <Text style={styles.buttonLabel}>{item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, isCreatingLink && styles.disabledButton]}
          onPress={handleShareWithDynamicLink}
          disabled={isCreatingLink}>
          {isCreatingLink ? (
            <ActivityIndicator size="small" color="#6264A7" />
          ) : (
            <Icon name="share" size={20} color="#6264A7" />
          )}
          <Text style={styles.buttonLabel}>
            {isCreatingLink ? 'Creating...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Footer component with loading indicator
const FooterLoader = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="large" color="#6264A7" />
      <Text style={styles.loadingText}>Loading more posts...</Text>
    </View>
  );
};

export default function Feed({ myJobs }: FeedProps = {}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(!myJobs); // skip loading if props provided
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const loadPosts = async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Update fetchPosts call to include pagination
      const fetchedPosts = await fetchPosts(page, 10);
      
      if (isLoadMore) {
        // Append new posts to existing ones
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        // Set initial posts
        setPosts(fetchedPosts);
      }

      // Check if we have more data
      // You might need to update your fetchPosts function to return pagination info
      // For now, assuming if we get less than 10 posts, no more data
      setHasMoreData(fetchedPosts.length === 10);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!myJobs) {
      loadPosts();
    }
  }, [myJobs]);

  const handleLoadMore = useCallback(() => {
    // Only load more if not currently loading and has more data
    if (!loadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadPosts(nextPage, true);
    }
  }, [loadingMore, hasMoreData, currentPage]);

  const onEndReached = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  const onRefresh = useCallback(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    loadPosts(1, false);
  }, []);
 const displayData = myJobs ? myJobs.data : posts;
  const isEmbedded = !!myJobs;
return (
    <View style={{ flex: 1 }}>
      {/* Only show TopBar/NavPopup/Header in standalone mode */}
      {!isEmbedded && <TopBar />}
      {!isEmbedded && (
        <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />
      )}
      {!isEmbedded && (
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} />
          <Heading>Feed</Heading>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#6264A7" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          renderItem={({ item }) => (
            <PostCard item={item} navigation={navigation} />
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={!isEmbedded} // disable scroll when embedded
          // Pagination only in standalone mode
          onEndReached={!isEmbedded ? onEndReached : undefined}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            !isEmbedded ? (
              <FooterLoader isVisible={loadingMore && hasMoreData} />
            ) : null
          }
          refreshing={!isEmbedded && loading && currentPage === 1}
          onRefresh={!isEmbedded ? onRefresh : undefined}
          removeClippedSubviews={true}
          maxToRenderPerBatch={isEmbedded ? 3 : 10}
          windowSize={10}
          initialNumToRender={isEmbedded ? 3 : 10}
        />
      )}

      {!isEmbedded && <View style={{ height: 100 }} />}
      {!isEmbedded && <BottomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
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
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginVertical: 10,
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
  heading: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '40%',
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
});
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNewsWithoutAuth } from '../utils/fetchPosts';

const NewsCard = ({item}: any) => {
  const [expanded, setExpanded] = useState(false);

  const descriptionWords = item.description
    ? item.description.split(/\s+/)
    : [];

  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');
  
  return (
    <View style={styles.postCard}>
      {item.images?.[0] && (
        <Image source={{uri: item.images[0]}} style={styles.postImage} />
      )}
      {/* Description */}
      <Text style={styles.postText}>{displayText}</Text>

      {isLong && (
        <Text
          style={{color: '#6264A7', marginTop: 4}}
          onPress={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      )}
      <View style={styles.userRow}>
        <Image
          source={{
            uri: item.user?.profile_picture || 'https://via.placeholder.com/30',
          }}
          style={{width: 24, height: 24, borderRadius: 12, marginRight: 6}}
        />
        <Text style={styles.userText}>
          By {item.user?.first_name} {item.user?.last_name} •{' '}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
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
      <Text style={styles.loadingText}>Loading more news...</Text>
    </View>
  );
};

export default function NewsFeed({
  heading = 'News Feed',
  showBackButton = true,
  showHeading = true,
  onBackPress = () => {},
  limit = 3,
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showHeading?: boolean;
  limit?: number;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newsWithAuth, setNewsWithoutAuth] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const loadJobsWithoutAuth = async () => {
    try {
      setLoading(true);
      const res = await fetchNewsWithoutAuth();
      setNewsWithoutAuth(res || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const authToken = await AsyncStorage.getItem('authToken');
      setToken(authToken);
      
      const url = authToken
        ? `https://buildio.co.nz/api/news/list?page=${page}&limit=10`
        : 'https://buildio.co.nz/api/home/news';

      const headers: any = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {headers});
      const data = await response.json();

      const newPosts = data?.data?.data || [];
      
      if (isLoadMore) {
        // Append new posts to existing ones
        setJobPosts(prev => [...prev, ...newPosts]);
      } else {
        // Set initial posts
        setJobPosts(newPosts);
      }

      // Check if we have more data
      const totalPages = data?.data?.totalPages || 1;
      setHasMoreData(page < totalPages);

    } catch (error) {
      console.error('Error fetching job posts:', error);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNews();
    loadJobsWithoutAuth();
  }, []);

  const handleLoadMore = useCallback(() => {
    // Only load more if:
    // 1. We have token (authenticated user)
    // 2. Not currently loading more
    // 3. Has more data to load
    if (token && !loadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNews(nextPage, true);
    }
  }, [token, loadingMore, hasMoreData, currentPage]);

  const onEndReached = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  // Determine which data to show
  const dataToShow = token 
    ? (showBackButton ? jobPosts : jobPosts?.slice(0, limit))
    : newsWithAuth?.data || [];

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6264A7" style={styles.loader} />
      ) : (
        <>
          {showHeading && <TopBar />}

          <View style={styles.topBar}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              />
            )}
            {showHeading && <Text style={styles.heading}>{heading}</Text>}
          </View>

          <FlatList
            data={dataToShow}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => <NewsCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.1} // Trigger when 10% from bottom
            ListFooterComponent={<FooterLoader isVisible={loadingMore && hasMoreData} />}
            removeClippedSubviews={true} // Optimize for large lists
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />

          {showHeading && <View style={{height: 100}} />}
          {showHeading && <BottomTabBar />}
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  topBar: {flexDirection: 'row', alignItems: 'center', padding: 10},
  backButton: {padding: 8, marginRight: 10, borderRadius: 8},
  heading: {fontSize: 20, fontWeight: '700', color: '#6264A7'},
  list: {padding: 10},
  postCard: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
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
  postImage: {width: '100%', height: 150, borderRadius: 10},
  postText: {marginTop: 10, fontSize: 14},
  userRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  userText: {fontSize: 12, color: '#777'},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

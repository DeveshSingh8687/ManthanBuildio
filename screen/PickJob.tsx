import React, {useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Share} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import Heading from './components/CommonHeader';
import ImageSlider from './components/ImageSlider';
import {fetchJobs, getMyJobs, handleApply} from '../utils/fetchJobs';
import CustomModal from './components/CustomModal';
import {capitalizeFirstLetter} from '../utils/helper';

const screenWidth = Dimensions.get('window').width;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PostFeedProps {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showBottomBar?: boolean;
  showButtonText?: string;
  showHeader?: boolean;
  showLikeAndShare?: boolean;
  myJobs: any[];
}

interface PostCardProps {
  item: any;
  showLikeAndShare: boolean;
  showButtonText?: string;
  showLikeAndShareButton?: boolean;
  refreshJobs: () => Promise<void>;
  onRemoveJob: (id: number) => void;
  navigation: NavigationProp<RootStackParamList>;
}

const noUserHeaderStyle = {paddingTop: 0};
const cancelledButtonStyle = {backgroundColor: '#ccc'};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function PostFeed({
  heading = 'Job Posts',
  showBackButton = true,
  showBottomBar = true,
  showButtonText,
  showHeader = true,
  showLikeAndShare = true,
  myJobs = [],
}: PostFeedProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();
  console.log(myJobs, 'my jobs in pick job screen');
  const {showLikeAndShareButton, myJob: myJobFromRoute} = (route.params ||
    {}) as {
    showLikeAndShareButton?: boolean;
    myJob?: any[];
  };

  const jobData = myJobs?.data?.length ? myJobs : myJobFromRoute || [];
  console.log(jobData, 'job data in pick job screen');

  const [jobs, setJobs] = useState(jobData);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // ── Loading logic ──
  useEffect(() => {
    if (Array.isArray(jobData?.data) || Array.isArray(jobData)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setTimeoutReached(true);
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [jobData]);

  // ── Refresh jobs from API ──
  const refreshJobs = async () => {
    try {
      // Check if user has auth token
      const token = await AsyncStorage.getItem('authToken');
      // Use fetchJobs (public) if no token, otherwise use getMyJobs
      const updatedJobs = token ? await getMyJobs() : await fetchJobs();
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Refresh jobs failed:', err);
    }
  };

  // ── Remove a single job card from state ──
  const removeJob = (jobId: number) => {
    setJobs((prev: any) => {
      if (
        prev &&
        typeof prev === 'object' &&
        !Array.isArray(prev) &&
        Array.isArray(prev.data)
      ) {
        return {...prev, data: prev.data.filter((j: any) => j.id !== jobId)};
      }
      if (Array.isArray(prev)) {
        return prev.filter((j: any) => j.id !== jobId);
      }
      return prev;
    });
  };

  // ── Guard: Loading ──
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6264A7" />
        <Text style={{marginTop: 10}}>Loading jobs...</Text>
      </View>
    );
  }

  // ── Guard: Timeout with no data ──
  if (timeoutReached && (!jobData?.data || jobData.data.length === 0)) {
    return (
      <View style={styles.centered}>
        <Text>No posts available</Text>
      </View>
    );
  }

  // ── Guard: Empty data ──
  const hasNoData =
    !loading &&
    (jobData?.data?.length === 0 ||
      (Array.isArray(jobData) && jobData.length === 0));

  if (hasNoData) {
    return (
      <View style={styles.centered}>
        <Text>No posts available</Text>
      </View>
    );
  }
console.log(jobs?.data ?? (Array.isArray(jobs) ? jobs : []), 'jobs data in pick job screen');

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      {(showHeader || showLikeAndShareButton) && <TopBar />}

      {showBackButton && (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />
          <Heading>{heading}</Heading>
        </View>
      )}
      <FlatList
        data={jobs?.data ?? (Array.isArray(jobs) ? jobs : [])}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <PostCard
            item={item}
            showLikeAndShare={showLikeAndShare}
            showButtonText={showButtonText}
            showLikeAndShareButton={showLikeAndShareButton}
            refreshJobs={refreshJobs}
            onRemoveJob={removeJob}
            navigation={navigation}
          />
        )}
      />

      {(showBottomBar || showLikeAndShareButton) && (
        <>
          <View style={{height: 100, backgroundColor: '#fff'}} />
          <BottomTabBar />
        </>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// PostCard Component
// ─────────────────────────────────────────────
const PostCard = ({
  item,
  showLikeAndShare,
  showButtonText,
  showLikeAndShareButton,
  onRemoveJob,
  navigation,
}: PostCardProps) => {
  const [_likes, _setLikes] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [_isCreatingLink, setIsCreatingLink] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // ── Description truncation ──
  const descriptionWords = item.description
    ? item.description.split(/\s+/)
    : [];
  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');

  // ── Like ──
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
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      const data = await response.json();
      if (data?.status && data?.message) {
        if (data.message === 'Post Liked') {
          item.likes_count += 1;
          item.is_liked = true;
        } else if (data.message === 'Post Unliked') {
          item.likes_count = Math.max(0, item.likes_count - 1);
          item.is_liked = false;
        }
      }
      _setLikes(prev => prev + 1); // force re-render
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Unable to update like. Please try again.');
    }
  };

  // ── Share ──
  const handleShare = async () => {
    if (_isCreatingLink) {
      return;
    }
    try {
      const shareableLink = 'buildio://Home';
      await Share.share({
        message: `📱 Open in app: ${shareableLink}`,
        url: shareableLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Unable to share this job. Please try again.');
    }
  };

  // ── Cancel job ──
  const handleCancelJob = async () => {
    try {
      setApplyLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setModalTitle('Error');
        setModalMessage('Authorization token not found. Please sign in again.');
        setModalVisible(true);
        return;
      }

      const response = await fetch(
        `https://buildio.co.nz/api/jobs/cancel/${item?.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'multipart/form-data',
          },
        },
      );

      if (response.ok) {
        console.log('Job cancelled successfully');

        setModalTitle('Success');
        setModalMessage('Job cancelled successfully.');
        setModalVisible(true);

        // Delay removal so modal is visible
        if (item.apply_status !== 'approved') {
          setTimeout(() => {
            onRemoveJob(item.id);
          }, 1500); // 1.5 seconds delay
        }

        // For approved, just reset status
        item.apply_status = null;
      } else {
        setModalTitle('Error');
        setModalMessage('Failed to cancel the job. Please try again.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      setModalTitle('Error');
      setModalMessage('Something went wrong. Please try again.');
      setModalVisible(true);
    } finally {
      setApplyLoading(false);
    }
  };

  // ── Apply / main CTA ──
  const handleClick = async () => {
    if (showButtonText === 'Applications') {
      navigation.navigate('JobListComponent' as any, {jobId: item?.id,  fromPage: 'PickJob'} as any);
      return;
    }
    console.log(
      item.apply_status,
      'apply status',
      (item.staus === 'open' || item.apply_status === 'pending') &&
        item.apply_status !== 'approved',
    );
    if (
      (item.staus === 'open' || item.apply_status === 'pending') &&
      item.apply_status !== 'approved'
    ) {
      handleCancelJob();
      return;
    }
    // try {
    //   setApplyLoading(true);
    //   const result = await handleApply(item?.id);
    //   if (result?.status === true) {
    //     setModalTitle('Success');
    //     setModalMessage('You have successfully applied to this job.');
    //     item.apply_status = 'applied';
    //     await refreshJobs();
    //   } else {
    //     setModalTitle('Info');
    //     setModalMessage('You have already applied to this job.');
    //   }
    // } catch {
    //   setModalTitle('Error');
    //   setModalMessage('Something went wrong. Please try again.');
    // } finally {
    //   setApplyLoading(false);
    //   setModalVisible(true);
    // }
  };

  // ── Button label logic ──
  const buttonLabel =
    showButtonText === 'Status' && item.status === 'open'
      ? 'Cancel'
      : showButtonText !== 'Applications' && item.apply_status === 'approved'
      ? item.status
      : showButtonText || 'Apply';
  console.log(item,'item in post card');
  return (
    <>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        buttonText="Close"
        onClose={() => setModalVisible(false)}
      />

      <View
        style={[
          styles.card,
          !(item.user?.first_name && item.user?.last_name) && noUserHeaderStyle,
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{uri: item.user?.profile_picture}}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>
              {[
                item.user?.first_name &&
                  capitalizeFirstLetter(item.user.first_name),
                item.user?.last_name &&
                  capitalizeFirstLetter(item.user.last_name),
              ]
                .filter(Boolean)
                .join(' ')}
            </Text>
            {item.user?.first_name && item.user?.last_name && (
              <Text style={styles.date}>
                {new Date(item.createdAt).toDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Images */}
        {item.images && <ImageSlider images={item.images} />}

        {/* Description */}
        <Text style={styles.content}>{displayText}</Text>
        {isLong && (
          <Text
            style={styles.expandToggle}
            onPress={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        )}

        {/* Like / Share */}
        {!showLikeAndShare && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Icon name="thumb-up" size={20} color="#6264A7" />
              <Text style={styles.buttonLabel}>{item.likes_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.shareButton,
                _isCreatingLink && styles.disabledButton,
              ]}
              onPress={handleShare}
              disabled={_isCreatingLink}>
              {_isCreatingLink ? (
                <ActivityIndicator size="small" color="#6264A7" />
              ) : (
                <Icon name="share" size={20} color="#6264A7" />
              )}
              <Text style={styles.buttonLabel}>
                {_isCreatingLink ? 'Creating...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View More / Apply */}
        {(showLikeAndShare || showLikeAndShareButton) && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() =>
                navigation.navigate(
                  'JobDetailsScreen' as any,
                  {
                    job: item,
                    updateJob: !!item.is_my_job,
                  } as any,
                )
              }>
              <Text style={styles.viewMoreButtonText}>View More</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                showButtonText !== 'Applications' && item.apply_status
                  ? cancelledButtonStyle
                  : null,
              ]}
              onPress={handleClick}
              disabled={applyLoading}>
              {applyLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>{buttonLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    marginTop: 5,
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
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  expandToggle: {
    color: '#6264A7',
    marginTop: 4,
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
  disabledButton: {
    opacity: 0.6,
  },
  buttonLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: '#6264A7',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewMoreButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  viewMoreButtonText: {
    color: '#6264A7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sliderImage: {
    width: screenWidth - 40,
    height: 250,
    borderRadius: 10,
    marginRight: 10,
  },
});

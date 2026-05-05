import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import CustomModal from '../components/CustomModal';
import ImageSlider from '../components/ImageSlider';
import {getMyJobs, handleApply, fetchJobs} from '../../utils/fetchJobs';
import BottomTabBar from '../components/BottomNavigaionBar';
import TopBar from '../components/TopBar';
import Heading from '../components/CommonHeader';
import {useFocusEffect} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const PostCard = ({onUpdateJob, onRemoveJob, refreshJobs}) => {
  const navigation = useNavigation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({visible: false, title: '', message: ''});
  const [applyLoadingId, setApplyLoadingId] = useState(null); // track per-item
  const [expandedIds, setExpandedIds] = useState({}); // track per-item

  const showModal = useCallback(
    (title, message) => setModal({visible: true, title, message}),
    [],
  );
  const closeModal = () => setModal(prev => ({...prev, visible: false}));

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Check if user has auth token
      const token = await AsyncStorage.getItem('authToken');
      
      // Use fetchJobs (public) if no token, otherwise use getMyJobs
      const res = token ? await getMyJobs() : await fetchJobs();
      
      if (res?.status) {
        setJobs(res.data?.data || res.data || []);
      } else {
        showModal('Error', 'Failed to load jobs.');
      }
    } catch (err) {
      console.error('Failed to load jobs:', err?.message);
      showModal('Error', 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [showModal]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleCancelJob = useCallback(
    async item => {
      try {
        setApplyLoadingId(item.id);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          showModal(
            'Error',
            'Authorization token not found. Please sign in again.',
          );
          return;
        }

        const response = await fetch(
          `https://buildio.co.nz/api/jobs/cancel/${item.id}`,
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
          showModal('Success', 'Job cancelled successfully.');
        } else {
          showModal('Error', 'Failed to cancel the job. Please try again.');
        }
      } catch (error) {
        console.error('Error cancelling job:', error);
        showModal('Error', 'Something went wrong. Please try again.');
      } finally {
        setApplyLoadingId(null);
      }
    },
    [showModal],
  );

  const handleClick = useCallback(
    async item => {
      const isCancelMode =
        item.apply_status === 'applied' || item.apply_status === 'pending';

      if (isCancelMode) {
        await handleCancelJob(item);
        // Also update local state to remove apply_status (since cancel succeeded)
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === item.id ? {...job, apply_status: null} : job,
          ),
        );
        return;
      }

      try {
        setApplyLoadingId(item.id);
        const result = await handleApply(item.id);
        if (result?.status === true) {
          // Update local state to toggle apply_status to 'applied'
          setJobs(prevJobs =>
            prevJobs.map(job =>
              job.id === item.id ? {...job, apply_status: 'applied'} : job,
            ),
          );
          showModal('Success', 'You have successfully applied to this job.');
        } else {
          showModal('Info', 'You have already applied to this job.');
        }
      } catch {
        showModal('Error', 'Something went wrong. Please try again.');
      } finally {
        setApplyLoadingId(null);
      }
    },
    [handleCancelJob, showModal],
  );
  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs]),
  );
  const renderJob = ({item}) => {
    if (!item) return null;

    const description = item.description || '';
    const isLong = description.length > 100;
    const isExpanded = !!expandedIds[item.id];
    const displayText =
      isExpanded || !isLong ? description : description.slice(0, 100) + '...';

    const fullName = `${item.user?.first_name || ''} ${
      item.user?.last_name || ''
    }`.trim();

    const isCancelMode =
      item.apply_status === 'applied' || item.apply_status === 'pending';
    const buttonLabel = isCancelMode ? 'Cancel' : 'Apply';
    const isThisButtonLoading = applyLoadingId === item.id;

    return (
      <View style={styles.card}>
        {/* Header */}
        {fullName && (
          <View style={styles.header}>
            <Image
              source={{uri: item.user?.profile_picture}}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.date}>
                {item.createdAt ? new Date(item.createdAt).toDateString() : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Images */}
        {item.images?.length > 0 ? (
          <ImageSlider images={item.images} />
        ) : (
          <View
            style={[
              styles.placeholderImage,
              {justifyContent: 'center', alignItems: 'center'},
            ]}>
            <Text>No Images</Text>
          </View>
        )}

        {/* Description */}
        <Text style={styles.content}>{displayText}</Text>
        {isLong && (
          <Text
            style={styles.expandToggle}
            onPress={() =>
              setExpandedIds(prev => ({...prev, [item.id]: !prev[item.id]}))
            }>
            {isExpanded ? 'Show less' : 'Show more'}
          </Text>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() =>
              navigation.navigate('JobDetailsScreen', {
                job: item,
                pickJob: !item.is_my_job,
                fromPage: 'JobList'
              })
            }>
            <Text style={styles.viewMoreButtonText}>View More</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, isCancelMode && styles.cancelButton]}
            onPress={() => handleClick(item)} // ✅ pass item directly
            disabled={isThisButtonLoading}>
            {isThisButtonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>{buttonLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6264A7" />
      </View>
    );
  }

  if (!jobs.length) {
    return (
      <View style={styles.centered}>
        <Text>No jobs found.</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <TopBar />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Heading>Job Posts</Heading>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderJob}
        contentContainerStyle={styles.list}
      />
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttonText="Close"
        onClose={closeModal}
      />
      <>
        <View style={styles.bottomSpacer} />
        <BottomTabBar />
      </>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  list: {padding: 16},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {flexDirection: 'row', marginBottom: 8, alignItems: 'center'},
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 8},
  name: {fontWeight: '600', fontSize: 14},
  date: {color: '#888', fontSize: 12},
  content: {fontSize: 14, color: '#333', marginVertical: 8},
  expandToggle: {color: '#6264A7', fontSize: 13, marginBottom: 8},
  sliderImage: {width: screenWidth - 32, height: 200, borderRadius: 12},
  placeholderImage: {
    width: screenWidth - 32,
    height: 200,
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewMoreButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  viewMoreButtonText: {color: '#6264A7', fontWeight: 'bold', fontSize: 14},
  applyButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {backgroundColor: '#ccc'},
  applyButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
  bottomSpacer: {
    height: 100,
    backgroundColor: '#fff',
  },
});

import React, {useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import Heading from './components/CommonHeader';
import ImageSlider from './components/ImageSlider';
import {getMyJobs, handleApply} from '../utils/fetchJobs';
import CustomModal from './components/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAccordionColors} from 'react-native-paper/lib/typescript/components/List/utils';
const screenWidth = Dimensions.get('window').width;


//   {
//     id: '1',
//     user: 'Gabie Sheber',
//     date: 'Jan. 02, 2024',
//     image:
//       'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=60',
//     content:
//       'Just finished this challenging but rewarding renovation project. Loved the transformation!',
//   },
//   {
//     id: '2',
//     user: 'John Smith',
//     date: 'Jan. 02, 2024',
//     image: 'https://randomuser.me/api/portraits/men/1.jpg',
//     content:
//       'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
//   },
//   {
//     id: '3',
//     user: 'Gabie Sheber',
//     date: 'Jan. 02, 2024',
//     image:
//       'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=60',
//     content:
//       'Hiring experienced carpenters and roofers for our upcoming project. Apply today!',
//   },
// ];

const PostCard = ({
  item,
  showLikeAndShare,
  showButtonText,
  showLikeAndShareButton,
  refreshJobs
}: any) => {
  const [likes, setLikes] = useState(0);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
    const [expanded, setExpanded] = useState(false);
  
    const descriptionWords = item.description
      ? item.description.split(/\s+/)
      : [];
    const isLong = descriptionWords.length > 20;
    const displayText = expanded
      ? item.description
      : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');

  const handleLike = () => setLikes(prev => prev + 1);
  // console.log(item.status, 'item in job post');
  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('user');
      if (userId !== null) {
        console.log('User ID:', userId);
      } else {
        console.log('No user ID found');
      }
    } catch (error) {
      console.error('Error reading user ID:', error);
    }
  };


  const handleClick = async () => {
    if (showButtonText === 'Applications') {
      navigation.navigate('JobListComponent', {jobId: item?.id});
      return;
    }

    try {
      const result = await handleApply(item?.id);
      console.log(result,'result')

      if (result?.status === true) {
        setModalTitle('Success');
        setModalMessage('You have successfully applied to this job.');
        await refreshJobs?.(); // ✅ get latest data from parent
      } else {
        setModalTitle('Info');
        setModalMessage('You have already applied to this job.');
      }
    } catch {
      setModalTitle('Error');
      setModalMessage('Something went wrong. Please try again.');
    }

    setModalVisible(true);
  };

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
          !(item.user?.first_name && item.user?.last_name) && {paddingTop: 0},
        ]}>
        <View style={styles.header}>
          <Image
            source={{uri: item.user?.profile_picture}} // fallback avatar
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>
              {item.user?.first_name && item.user?.last_name
                ? `${item.user.first_name} ${item.user.last_name}`
                : ''}
            </Text>
            <Text style={styles.date}>
              {item.user?.first_name && item.user?.last_name && (
                <Text>{new Date(item.createdAt).toDateString()}</Text>
              )}
            </Text>
          </View>
        </View>

       
        <ImageSlider images={item.images} />

        {/* Job Description */}
          <Text style={styles.content}>{displayText}</Text>
             {isLong && (
               <Text
                 style={{color: '#6264A7', marginTop: 4}}
                 onPress={() => setExpanded(!expanded)}>
                 {expanded ? 'Show less' : 'Show more'}
               </Text>
             )}

        {!showLikeAndShare && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Icon name="thumb-up" size={20} color="#6264A7" />
              <Text style={styles.buttonLabel}>{likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share" size={20} color="#6264A7" />
              <Text style={styles.buttonLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        )}

        {(showLikeAndShare || showLikeAndShareButton) && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() =>
                navigation.navigate('JobDetailsScreen', {
                  job: item,
                  updateJob: item.is_my_job ? true : false,
                })
              }>
              <Text style={styles.viewMoreButtonText}>View More</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyButton,
                showButtonText !== 'Applications' &&
                  item.apply_status && {
                    backgroundColor: '#ccc',
                  },
              ]}
              disabled={item.apply_status === 'pending'}
              onPress={handleClick}>
              <Text style={styles.applyButtonText}>
                {showButtonText === 'Status'
                  ? item.status
                  : showButtonText !== 'Applications' && item.apply_status
                  ? 'Applied'
                  : showButtonText || 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default function PostFeed({
  heading = 'Job Posts',
  showBackButton = true,
  onBackPress = () => {},
  showBottomBar = true,
  showButtonText,
  showHeader = true,
  showLikeAndShare = true,
  myJobs = [],
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showBottomBar?: boolean;
  showButtonText?: string;
  showHeader?: boolean;
  showLikeAndShare?: boolean;
  myJobs: any[];
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();

  const {
    showLikeAndShareButton,
    showHeading,
    myJob: myJobFromRoute,
  } = (route.params || {}) as {
    showLikeAndShareButton?: boolean;
    showHeading?: string;
    myJob?: any[];
  };

  const jobData = myJobs?.data?.length ? myJobs : myJobFromRoute || [];
  const [jobs, setJobs] = useState(jobData);
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!jobData?.data?.length) {
      setLoading(true);
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        setLoading(false);
      }, 25000); // 25 sec

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [jobData]);

  const refreshJobs = async () => {
    try {
      const updatedJobs = await getMyJobs();
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Refresh jobs failed:', err);
    }
  };

  // Loader view
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6264A7" />
        <Text style={{ marginTop: 10 }}>Loading jobs...</Text>
      </View>
    );
  }

  // No posts view
  if (timeoutReached && (!jobData?.data || jobData.data.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No posts available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor:'#fff'}}>
      {(showHeader || showLikeAndShareButton) && <TopBar />}
      {showBackButton && (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
          </TouchableOpacity>
          <Heading>{heading}</Heading>
        </View>
      )}
      <FlatList
        data={jobData?.data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            showLikeAndShare={showLikeAndShare}
            showButtonText={showButtonText}
            showLikeAndShareButton={showLikeAndShareButton}
            refreshJobs={refreshJobs}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {(showBottomBar || showLikeAndShareButton) && (
        <>
          <View style={{ height: 100, backgroundColor: '#fff' }} />
          <BottomTabBar />
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    alignSelf: 'flex-end',
    padding: 10,
  },
  profileButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 5,
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
    width: 200,
    height: 200, // or whatever height fits your card
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 170,
  },
  sliderImage: {
    width: screenWidth - 40, // if your card has padding/margin
    height: 250,
    borderRadius: 10,
    marginRight: 10,
  },

  imageSliderContainer: {
    marginTop: 10,
  },
  content: {
    fontSize: 14,
    color: '#333',
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  heading: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '32%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  noImage: {
    fontStyle: 'italic',
    color: '#999',
    paddingVertical: 10,
  },
});

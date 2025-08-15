import React, {memo, useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import ExploreMoreButton from './components/ExploreMoreButton';
import PostFeed from './PickJob';
import NewsFeed from './NewsScreen';
import {Icon} from 'react-native-elements';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleSecurePress} from './config/auth';
import {getMyJobs} from '../utils/fetchJobs';
import {fetchPosts} from '../utils/fetchPosts';


const {height} = Dimensions.get('window');

const NavPopup = memo(({visible, onClose}: any) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => navigation.navigate('AccountScreen')}>
            <Icon name="account-circle" type="material" size={24} />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => navigation.navigate('JobsSection')}>
            <Icon name="assignment" type="material" size={24} />
            <Text style={styles.navText}>Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItemMenu}>
            <Icon name="logout" type="material" size={24} color="#FF3B30" />
            <Text style={[styles.navText, {color: '#FF3B30'}]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [jobs, setJobs] = useState<any>(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await getMyJobs();
      if (res?.status) setJobs(res.data);
    } catch (err: any) {
      console.error('Failed to load jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };
useFocusEffect(
  
  React.useCallback(() => {
    // This runs every time screen comes into focus
    loadJobs();
  }, [])
);
  const loadPosts = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://buildio.co.nz/api/posts/list?page=1&limit=10',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setPosts(data?.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
      setTokenChecked(true);
      if (storedToken) loadPosts(storedToken);
    })();
    loadJobs();
  }, []);

  useFocusEffect(useCallback(() => setModalVisible(false), []));

  if (!tokenChecked) return null;

  return (
    <>
      <TopBar />
      <ScrollView style={styles.container}>
        <TextInput style={styles.search} placeholder="Search" />

        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => handleSecurePress('JobDetailS', navigation)}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>Post a job</Text>
                <Text style={styles.cardSubtitle}>Explore &gt;</Text>
              </View>
              <View style={styles.cardIcon}>
                <Image
                  source={require('../assets/pickTask.png')}
                  style={styles.iconImage}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => navigation.navigate('PickJob', {myJob: jobs})}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>Pick a Job</Text>
                <Text style={styles.cardSubtitle}>Explore &gt;</Text>
              </View>
              <View style={styles.cardIcon}>
                <Image
                  source={require('../assets/postTask.png')}
                  style={styles.iconImage}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.recentlyPosted}>
          <View style={styles.leftSection}>
            <Icon name="edit-note" size={16} color="#fff" />
            <Text style={styles.buttonText}>News Section</Text>
          </View>
        </TouchableOpacity>

        <NewsFeed showBackButton={false} showHeading={false} limit={3} />

        <TouchableOpacity
          style={styles.exploreCard}
          onPress={() => handleSecurePress('NewsScreen', navigation)}>
          <Text style={styles.exploreText}>
            "Find reliable workers for construction needs"
          </Text>
          <ExploreMoreButton
            text="Know More"
            onPress={() => handleSecurePress('NewsScreen', navigation)}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recentlyPosted}
          onPress={() => handleSecurePress('PickJob', navigation)}>
          <View style={styles.leftSection}>
            <Icon name="edit-note" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Recently posted</Text>
            <Icon
              name="arrow-right"
              size={16}
              color="#fff"
              style={styles.rightIcon}
            />
            <Text style={styles.moreText}>More</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.recentJobs}>
          {jobs?.data?.slice(0, 3).map((job: any, index: number) => (
            <View style={styles.jobItem} key={index}>
              <View>
                <Text style={styles.jobTitle}>
                  {job.job_type?.job || 'Job Title'}
                </Text>
                <Text style={styles.jobSubText}>
                  {job.address?.building || 'Unknown City'}
                </Text>
                <Text style={styles.jobSubText}>
                  Project completion by{' '}
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString('en-NZ', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Unknown'}
                </Text>
              </View>
              <Image
                source={{
                  uri:
                    job.user?.profile_picture ||
                    `https://randomuser.me/api/portraits/men/${30 + index}.jpg`,
                }}
                style={styles.jobAvatar}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => navigation.navigate('PickJob', {myJob: jobs})}>
          <Text style={{color: '#fff'}}>See All</Text>
        </TouchableOpacity>

        <PostFeed
          showBackButton={false}
          showBottomBar={false}
          showHeader={false}
          showLikeAndShare={false}
          myJobs={posts}
        />

        <TouchableOpacity
          style={styles.exploreCard}
          onPress={() => handleSecurePress('Feed', navigation)}>
          <Text style={styles.exploreText}>
            "Find reliable workers for construction needs"
          </Text>
          <ExploreMoreButton
            text="Explore More"
            onPress={() => handleSecurePress('Feed', navigation)}
          />
        </TouchableOpacity>
      </ScrollView>

      <View style={{height: 100, backgroundColor: '#fff'}} />
      <BottomTabBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10, backgroundColor: '#fff', flex: 1},
  search: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: -15,
  },
  cardRow: {flexDirection: 'column', alignItems: 'stretch',backgroundColor:'#fff'},
  cardBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    height: 120,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  cardSubtitle: {color: 'white', fontSize: 14, marginTop: 4},
  cardIcon: {marginLeft: 'auto'},
  iconImage: {width: 100, height: 100, resizeMode: 'contain'},
  leftSection: {flexDirection: 'row', alignItems: 'center'},
  buttonText: {color: '#fff', fontSize: 14, fontWeight: '600'},
  moreText: {color: '#fff', fontSize: 14},
  rightIcon: {marginLeft: 150},
  recentlyPosted: {
    marginTop: 24,
    backgroundColor: '#C1C5D0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    padding:20
  },
  exploreCard: {
    backgroundColor: '#f4f6ff',
    padding: 20,
    marginTop: 15,
    borderRadius: 10,
  },
  exploreText: {fontWeight: 'bold', marginBottom: 10},
  seeAll: {
    marginTop: 10,
    backgroundColor: '#6264A7',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  recentJobs: {marginTop: 16},
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal:10
  },
  jobTitle: {fontWeight: 'bold', fontSize: 14},
  jobSubText: {fontSize: 12, color: '#555'},
  jobAvatar: {width: 50, height: 50, borderRadius: 25},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  navContainer: {
    width: 150,
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 50,
    marginRight: 10,
    elevation: 5,
  },
  navText: {marginLeft: 10, fontSize: 16, color: '#3F51B5'},
  navItemMenu: {flexDirection: 'row', alignItems: 'center', marginVertical: 10},
});

export default HomeScreen;

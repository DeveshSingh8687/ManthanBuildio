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
import {fetchJobs, getMyJobs} from '../utils/fetchJobs';
import {fetchFeed, fetchPosts} from '../utils/fetchPosts';
import Feed from './FeedScreen';

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

const mockJobs = {
  data: [
    {
      id: 44,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 27,
        job: 'Foundations',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 4,
        user_id: 1,
        label:
          'R. Vinte e Cinco de Março - Centro Histórico de São Paulo, São Paulo - SP, Brazil',
        lat: '32.31744754',
        long: '75.59774115',
        map_text: '8H8X+W4M, Sujanpur, Punjab 145023, India',
        apartment: '25',
        building: 'Home2',
        notes: 'opposite to this that',
        created_at: '2025-07-31T16:09:55.000Z',
        updated_at: '2025-08-19T13:36:08.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '13',
      deadline: '2025-09-18T00:00:00.000Z',
      budget: '23.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-18T16:44:58.000Z',
      updatedAt: '2025-08-18T16:44:58.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755535498943-438863899.jpg',
        'https://buildio.co.nz/uploads/jobs/images-1755535498943-408066621.jpg',
      ],
    },
    {
      id: 42,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 26,
        job: 'Pergolas',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 4,
        user_id: 1,
        label:
          'R. Vinte e Cinco de Março - Centro Histórico de São Paulo, São Paulo - SP, Brazil',
        lat: '32.31744754',
        long: '75.59774115',
        map_text: '8H8X+W4M, Sujanpur, Punjab 145023, India',
        apartment: '25',
        building: 'Home2',
        notes: 'opposite to this that',
        created_at: '2025-07-31T16:09:55.000Z',
        updated_at: '2025-08-19T13:36:08.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '1469',
      deadline: '2025-08-17T00:00:00.000Z',
      budget: '145.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-17T15:48:26.000Z',
      updatedAt: '2025-08-17T15:48:26.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755445706932-904985431.jpg',
      ],
    },
    {
      id: 37,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 28,
        job: 'General Plumbing',
        parent_id: 2,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 4,
        user_id: 1,
        label:
          'R. Vinte e Cinco de Março - Centro Histórico de São Paulo, São Paulo - SP, Brazil',
        lat: '32.31744754',
        long: '75.59774115',
        map_text: '8H8X+W4M, Sujanpur, Punjab 145023, India',
        apartment: '25',
        building: 'Home2',
        notes: 'opposite to this that',
        created_at: '2025-07-31T16:09:55.000Z',
        updated_at: '2025-08-19T13:36:08.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '146',
      deadline: null,
      budget: '1468.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-15T06:38:41.000Z',
      updatedAt: '2025-08-15T06:38:41.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755239921255-575007077.jpg',
      ],
    },
    {
      id: 36,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 23,
        job: 'Extensions',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 3,
        user_id: 1,
        label: '14 Freshland Drive, Flat Bush, Auckland 2019, New Zealand',
        lat: '32.31693305',
        long: '75.54490255',
        map_text: '8G8V+HRR, Punjab 145023, India',
        apartment: '14',
        building: 'Home',
        notes: '',
        created_at: '2025-07-28T14:21:08.000Z',
        updated_at: '2025-08-18T17:39:17.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '127',
      deadline: null,
      budget: '134.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-15T06:34:44.000Z',
      updatedAt: '2025-08-15T06:34:44.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755239684730-908823325.jpg',
      ],
    },
    {
      id: 35,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 25,
        job: 'Decking',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 3,
        user_id: 1,
        label: '14 Freshland Drive, Flat Bush, Auckland 2019, New Zealand',
        lat: '32.31693305',
        long: '75.54490255',
        map_text: '8G8V+HRR, Punjab 145023, India',
        apartment: '14',
        building: 'Home',
        notes: '',
        created_at: '2025-07-28T14:21:08.000Z',
        updated_at: '2025-08-18T17:39:17.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '134',
      deadline: null,
      budget: '56.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-15T06:19:22.000Z',
      updatedAt: '2025-08-15T06:19:22.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755238762243-792120350.jpg',
        'https://buildio.co.nz/uploads/jobs/images-1755238762244-856081285.jpg',
        'https://buildio.co.nz/uploads/jobs/images-1755238762245-981267800.jpg',
      ],
    },
    {
      id: 33,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 27,
        job: 'Foundations',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 3,
        user_id: 1,
        label: '14 Freshland Drive, Flat Bush, Auckland 2019, New Zealand',
        lat: '32.31693305',
        long: '75.54490255',
        map_text: '8G8V+HRR, Punjab 145023, India',
        apartment: '14',
        building: 'Home',
        notes: '',
        created_at: '2025-07-28T14:21:08.000Z',
        updated_at: '2025-08-18T17:39:17.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '567',
      deadline: null,
      budget: '234.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-15T06:05:12.000Z',
      updatedAt: '2025-08-15T06:05:12.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755237912784-948212847.jpg',
      ],
    },
    {
      id: 29,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 27,
        job: 'Foundations',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 4,
        user_id: 1,
        label:
          'R. Vinte e Cinco de Março - Centro Histórico de São Paulo, São Paulo - SP, Brazil',
        lat: '32.31744754',
        long: '75.59774115',
        map_text: '8H8X+W4M, Sujanpur, Punjab 145023, India',
        apartment: '25',
        building: 'Home2',
        notes: 'opposite to this that',
        created_at: '2025-07-31T16:09:55.000Z',
        updated_at: '2025-08-19T13:36:08.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: '690holl',
      deadline: null,
      budget: '7900.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-14T16:47:58.000Z',
      updatedAt: '2025-08-14T16:47:58.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755190078143-752030630.jpg',
      ],
    },
    {
      id: 27,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 26,
        job: 'Pergolas',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 4,
        user_id: 1,
        label:
          'R. Vinte e Cinco de Março - Centro Histórico de São Paulo, São Paulo - SP, Brazil',
        lat: '32.31744754',
        long: '75.59774115',
        map_text: '8H8X+W4M, Sujanpur, Punjab 145023, India',
        apartment: '25',
        building: 'Home2',
        notes: 'opposite to this that',
        created_at: '2025-07-31T16:09:55.000Z',
        updated_at: '2025-08-19T13:36:08.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description: 'R56uy',
      deadline: null,
      budget: '134.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-14T15:57:02.000Z',
      updatedAt: '2025-08-14T15:57:02.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755187022006-303764243.jpg',
      ],
    },
    {
      id: 21,
      user_id: 15,
      is_my_job: false,
      job_type: {
        id: 24,
        job: 'Retaining Walls',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 22,
        user_id: 15,
        label: '14 Freshland Drive, Flat Bush, Auckland 2019, New Zealand',
        lat: '-36.9770699',
        long: '174.9081592',
        map_text: null,
        apartment: 'Home',
        building: '',
        notes: '',
        created_at: '2025-08-12T05:11:25.000Z',
        updated_at: '2025-08-12T05:11:25.000Z',
      },
      user: {
        id: 15,
        first_name: 'Rajinder',
        last_name: 'Lastt',
        email: 'rajinder.dulku.dev11@gmail.com',
        phone_number: '971567105527',
        is_enable: 1,
        social_media_provider: 'Google',
        provider_token: '101994429514918393289',
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754302836652-835222365.jpg',
        about: 'Testtt',
        experience: '5 yestttttt',
        created_at: '2025-07-25T17:21:43.000Z',
        updated_at: '2025-08-04T10:20:36.000Z',
        deleted_at: null,
      },
      description: 'Thissssss dec',
      deadline: null,
      budget: '5000.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-14T05:26:17.000Z',
      updatedAt: '2025-08-14T05:26:17.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1755149176994-353934079.jpg',
      ],
    },
    {
      id: 19,
      user_id: 1,
      is_my_job: false,
      job_type: {
        id: 27,
        job: 'Foundations',
        parent_id: 1,
        created_at: '2025-07-18T12:53:20.000Z',
        updated_at: '2025-07-18T12:53:20.000Z',
        deleted_at: null,
      },
      address: {
        id: 18,
        user_id: 1,
        label: '56 Dukan St, New Palasia, Indore, Madhya Pradesh 452001, India',
        lat: '22.7241698',
        long: '75.8845896',
        map_text: 'data from google map',
        apartment: '',
        building: '',
        notes: '',
        created_at: '2025-08-04T19:05:59.000Z',
        updated_at: '2025-08-12T16:49:05.000Z',
      },
      user: {
        id: 1,
        first_name: 'kaur',
        last_name: 'rajinder',
        email: 'rajinder@example.com',
        phone_number: '43434434',
        is_enable: 1,
        social_media_provider: null,
        provider_token: null,
        profile_picture:
          'https://buildio.co.nz/uploads/profile/profile_picture-1754978277737-932928676.jpg',
        about: 'this is ab',
        experience: '323',
        created_at: '2025-07-02T18:18:53.000Z',
        updated_at: '2025-08-12T05:57:57.000Z',
        deleted_at: null,
      },
      description:
        'Some claim lorem ipsum threatens to promote design over content, while others defend its value in the process of planning.',
      deadline: '2025-11-26T00:00:00.000Z',
      budget: '1500.00',
      status: 'open',
      apply_status: 'pending',
      createdAt: '2025-08-12T05:30:19.000Z',
      updatedAt: '2025-08-12T05:30:19.000Z',
      images: [
        'https://buildio.co.nz/uploads/jobs/images-1754976619359-295360485.jpeg',
      ],
    },
  ],
  meta: {
    total: 15,
    page: 1,
    limit: 10,
    totalPages: 2,
  },
};
const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [jobs, setJobs] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [postWithoutAuth, setPostsWithoutAuth] = useState([]);
  const [jobsWithoutAuth, setJobsWithoutAUth] = useState<any[]>([]);
  console.log(posts, "Posts in HomeScreen");

  // Check if terms are accepted on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const checkTermsAcceptance = async () => {
        try {
          const isTermsAccepted = await AsyncStorage.getItem('is_terms_accepted');
          if (isTermsAccepted !== 'true') {
            // Redirect to PrivacySecurity if terms not accepted
            navigation.reset({
              index: 0,
              routes: [{name: 'PrivacySecurity'}],
            });
          }
        } catch (error) {
          console.error('Error checking terms acceptance:', error);
        }
      };

      checkTermsAcceptance();
    }, [navigation]),
  );

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await getMyJobs();
      console.log("Jobs API response:", res.data);
      if (res?.status) {setJobs(res.data);}
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
    }, []),
  );
  const loadPosts = async (authToken?: string) => {
    setLoading(true);
    try {
      // ✅ Correct endpoints
      const url = authToken
        ? 'https://buildio.co.nz/api/posts/list?page=1&limit=10'
        : 'https://buildio.co.nz/api/home/feed';

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || `HTTP error! Status: ${response.status}`,
        );
      }

      setPosts(data?.data || []);
    } catch (err: any) {
      console.error('loadPosts error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const loadFeedWithoutAuth = async () => {
    const authToken = AsyncStorage.getItem('authToken');
    try {
      setLoading(true);

        const res = await fetchFeed();
        setPostsWithoutAuth(res || []);
      
      // API returns {status, message, data}
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadJobsWithoutAuth = async () => {
    try {
      setLoading(true);
      const res = await fetchJobs();
      setJobsWithoutAUth(res || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  (async () => {
    const storedToken = await AsyncStorage.getItem("authToken");
    setToken(storedToken);
    setTokenChecked(true);

    if (storedToken) {
      // Authenticated
      loadPosts(storedToken);
      loadJobs(); // if you have a token-aware jobs API
    } else {
      // Guest / Without Auth
      loadFeedWithoutAuth();
      loadJobsWithoutAuth();
    }
  })();
}, []);

  useFocusEffect(useCallback(() => setModalVisible(false), []));

  if (!tokenChecked) return null;
  const jobList = jobs?.data?.length
    ? jobs.data.slice(0, 3)
    : jobsWithoutAuth?.data?.slice(0, 3);

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
            onPress={() => {
              if (jobs?.data?.length) {
                             navigation.navigate('PostCard');

              } else {
                navigation.navigate('Login');
              }
            }}>
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

        {/* <TouchableOpacity style={styles.recentlyPosted}>
          <View style={styles.leftSection}>
            <Icon name="edit-note" size={16} color="#fff" />
            <Text style={styles.buttonText}>News Section</Text>
          </View>
        </TouchableOpacity> */}

        {/* <NewsFeed showBackButton={false} showHeading={false} limit={3} /> */}
{/* 
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
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.recentlyPosted}
          // onPress={() => handleSecurePress('PickJob', navigation)}
          >
          <View style={styles.leftSection}>
            <Icon name="edit-note" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Recently posted</Text>
            {/* <Icon
              name="arrow-right"
              size={16}
              color="#fff"
              style={styles.rightIcon}
            /> */}
            {/* <Text style={styles.moreText}>More</Text> */}
          </View>
        </TouchableOpacity>

        <View style={styles.recentJobs}>
          {jobList?.slice(0, 3).map((job: any, index: number) => (
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
          onPress={() => {
            if (jobs?.data?.length) {
              navigation.navigate('PostCard');
            } else {
              navigation.navigate('Login');
            }
          }}>
          <Text style={{color: '#fff'}}>See All</Text>
        </TouchableOpacity>
       <Feed
  myJobs={
    posts?.data?.length
      ? { ...posts, data: posts?.data.slice(0, 3) }
      : postWithoutAuth
  }
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
    marginTop: -8,
  },
  cardRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
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
    padding: 20,
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
    paddingHorizontal: 10,
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

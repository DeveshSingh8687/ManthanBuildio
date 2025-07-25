import React, {useCallback, useEffect, useState} from 'react';
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
import { handleSecurePress } from './config/auth';

const {height} = Dimensions.get('window');
const NavPopup = ({ visible, onClose }: any) => {
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
            <Text style={[styles.navText, { color: '#FF3B30' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
      setTokenChecked(true);
    };
    getToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
    }, [])
  );
// useEffect(() => {
//   const checkAuth = async () => {
//     const storedToken = await AsyncStorage.getItem('authToken');
//     if (!storedToken) {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: 'Login' }],
//       });
//     }
//   };

//   checkAuth();
// }, []);
 

  if (!tokenChecked) return null; // Optional: Replace with splash or loader

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
            onPress={() => handleSecurePress('PickJob' , navigation)}>
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
            <Icon name="edit-note" size={16} color="#fff" style={styles.icon} />
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
          <ExploreMoreButton text={'Know More'} onPress={() => handleSecurePress('NewsScreen', navigation)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recentlyPosted}
          onPress={() => handleSecurePress('PickJob', navigation)}>
          <View style={styles.leftSection}>
            <Icon name="edit-note" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Recently posted</Text>
            <Icon name="arrow-right" size={16} color="#fff" style={styles.rightIcon} />
            <Text style={styles.moreText}>More</Text>
          </View>
        </TouchableOpacity>

        {/* Recent jobs list */}
        <View style={styles.recentJobs}>
          {[
            { title: 'Carpenter', city: 'Auckland', avatar: 'men/34.jpg' },
            { title: 'Electrician', city: 'Christchurch', avatar: 'men/32.jpg' },
            { title: 'Concrete Finisher', city: 'Queenstown', avatar: 'women/32.jpg' },
          ].map((job, index) => (
            <View style={styles.jobItem} key={index}>
              <View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobSubText}>{job.city}, New Zealand</Text>
                <Text style={styles.jobSubText}>Project completion by 13 Jan 2025</Text>
              </View>
              <Image
                source={{ uri: `https://randomuser.me/api/portraits/${job.avatar}` }}
                style={styles.jobAvatar}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => handleSecurePress('PickJob', navigation)}>
          <Text style={{ color: '#fff' }}>See All</Text>
        </TouchableOpacity>

        <PostFeed
          showBackButton={false}
          showBottomBar={false}
          showHeader={false}
          showLikeAndShare={false}
        />

        <TouchableOpacity
          style={styles.exploreCard}
          onPress={() => handleSecurePress('Feed', navigation)}>
          <Text style={styles.exploreText}>
            "Find reliable workers for construction needs"
          </Text>
          <ExploreMoreButton text={'Explore More'} onPress={() => handleSecurePress('Feed', navigation)} />
        </TouchableOpacity>
      </ScrollView>

      <View style={{ height: 100, backgroundColor: '#fff' }} />
      <BottomTabBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1, // take full height of the screen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileButton: {marginRight: 10, padding: 10, borderRadius: 8, marginTop: 15},
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    alignSelf: 'flex-end',
    padding: 10,
  },
  search: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: -15,
  },
  icon: {
    marginRight: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  moreText: {
    color: '#fff',
    fontSize: 14,
  },
  iconImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain', // Makes sure the image is not stretched
  },

  cardBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    height: 120, // ⬅️ adjust height here as needed
    justifyContent: 'center', // to vertically center the content
  },

  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  cardSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },

  cardIcon: {
    marginLeft: 'auto', // Add styles for real image or icon if needed
  },
  rightIcon: {
    marginLeft: 150, // Add styles for real image or icon if needed
  },
  sectionTitle: {marginTop: 24, fontWeight: 'bold', fontSize: 16},
  recentlyPosted: {
    marginTop: 24,
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: '#C1C5D0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderRadius: 10,
    shadowRadius: 3,
  },

  seeAll: {
    marginTop: 10,
    backgroundColor: '#6264A7',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  exploreCard: {
    backgroundColor: '#f4f6ff',
    padding: 20,
    marginTop: 15,
    borderRadius: 10,
  },
  exploreText: {fontWeight: 'bold', marginBottom: 10},
  postCard: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  postImage: {width: '100%', height: 150, borderRadius: 10},
  postText: {marginTop: 10, fontSize: 14},
  userRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  avatarSmall: {width: 30, height: 30, borderRadius: 15, marginRight: 8},
  userText: {fontSize: 12, color: '#777'},
  recentJobs: {marginTop: 16},
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  jobTitle: {fontWeight: 'bold', fontSize: 14},
  jobSubText: {fontSize: 12, color: '#555'},
  jobAvatar: {width: 50, height: 50, borderRadius: 25},

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  profileSubText: {
    fontSize: 12,
    color: 'gray',
  },
  // navItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginVertical: 10,
  // },
  navText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3F51B5',
  },
  navItemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default HomeScreen;

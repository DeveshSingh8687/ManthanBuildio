import React, {useCallback} from 'react';
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

const {height} = Dimensions.get('window');
const NavPopup = ({visible, onClose}: any) => {
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
          {/* User Profile Section */}
          {/* <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>John Smith</Text>
            <Text style={styles.profileSubText}>Software Developer</Text>
          </View> */}

          {/* Menu Options */}
          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => navigation.navigate('AccountScreen')}>
            <Icon
              name="account-circle"
              type="material"
              size={24}
              // color="#000"
            />{' '}
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => navigation.navigate('JobsSection')}>
            <Icon
              name="assignment"
              type="material"
              size={24}
              // color="#FF0000"
            />{' '}
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
};
const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // const jobPosts = [
  //   {
  //     id: 1,
  //     user: 'Sadie Shelton',
  //     date: 'Jan 05, 2024',
  //     text: 'Just finished this challenging but rewarding renovation project. Loved the transformation!',
  //     image: 'https://picsum.photos/id/1/200/300',
  //     avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  //   },
  //   {
  //     id: 2,
  //     user: 'Sadie Shelton',
  //     date: 'Jan 05, 2024',
  //     text: 'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
  //     image: 'https://loremflicker.com',
  //     avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  //   },
  //   {
  //     id: 3,
  //     user: 'Sadie Shelton',
  //     date: 'Jan 05, 2024',
  //     text: 'Hiring experienced carpenters and roofers for upcoming projects. Contact us for more info!',
  //     image: 'https://picsum.photos/200/300.jpg',
  //     avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  //   },
  // ];
  const handlePress = () => {
    // Navigate to PostJob screen
    navigation.navigate('JobDetailS');
  };
  const [modalVisible, setModalVisible] = React.useState(false);

  const [feed, setFeed] = React.useState(false);
  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);

      // On focus, close the modal
    }, []),
  );
  return (
    <>
      <TopBar />
      {/* <View style={styles.header}>
        <Image
          source={require('../assets/asset_logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="person-outline" size={24} />
        </TouchableOpacity>
        <NavPopup
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View> */}
      <ScrollView style={styles.container}>
        <TextInput style={styles.search} placeholder="Search" />
        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.cardBtn} onPress={handlePress}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>Post a job</Text>
                <Text style={styles.cardSubtitle}>Explore &gt;</Text>
              </View>
              <View style={styles.cardIcon}>
                {/* Image for Post a task */}
                <Image
                  source={require('../assets/pickTask.png')} // Replace with your own image for Post
                  style={styles.iconImage}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Pick a task card */}
          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => navigation.navigate('PickJob')}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardTitle}>Pick a Job</Text>
                <Text style={styles.cardSubtitle}>Explore &gt;</Text>
              </View>
              <View style={styles.cardIcon}>
                {/* Image for Pick a task */}
                <Image
                  source={require('../assets/postTask.png')} // Replace with your own image for Pick
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
        {/* <FlatList
      data={jobPosts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPost}
      scrollEnabled={false}
    /> */}
        <NewsFeed showBackButton={false} showHeading={false} limit={3} />
        {/* <View style={styles.jobItem}>
        <View>
          <Text style={styles.jobTitle}>Electrician</Text>
          <Text style={styles.jobSubText}>Another day, another project! Working on a staircase today.</Text>
          <Text style={styles.jobSubText}>#woodworking #craftsmanship </Text>
        </View>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/36.jpg' }}
          style={styles.jobAvatar}
        />
      </View>
      <View style={styles.jobItem}>
        <View>
          <Text style={styles.jobTitle}>Electrician</Text>
          <Text style={styles.jobSubText}>Another day, another project! Working on a staircase today.</Text>
          <Text style={styles.jobSubText}>#woodworking #craftsmanship </Text>
        </View>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/37.jpg' }}
          style={styles.jobAvatar}
        />
      </View> */}
        <TouchableOpacity style={styles.exploreCard}>
          <Text style={styles.exploreText}>
            "Find reliable workers for construction needs"
          </Text>
          <ExploreMoreButton
            text={'Know More'}
            onPress={() => navigation.navigate('NewsScreen')}
          />{' '}
        </TouchableOpacity>
        {/* <FlatList
data={[...jobPosts, { id: 'explore-card' }]}
keyExtractor={(item) => item.id}
renderItem={({ item }) =>
item.id === 'explore-card' ? (
  <ExploreCard onPress={handleExploreMore} />
) : (
  <PostCard item={item} />
)
}
contentContainerStyle={styles.list}
/> */}
        <TouchableOpacity
          style={styles.recentlyPosted}
          onPress={() => navigation.navigate('PickJob')}>
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
        {/* Simulated job list */}
        <View style={styles.recentJobs}>
          <View style={styles.jobItem}>
            <View>
              <Text style={styles.jobTitle}>Carpenter</Text>
              <Text style={styles.jobSubText}>Auckland, New Zealand</Text>
              <Text style={styles.jobSubText}>
                Project completion by 13 Jan 2025
              </Text>
            </View>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/34.jpg'}}
              style={styles.jobAvatar}
            />
          </View>

          <View style={styles.jobItem}>
            <View>
              <Text style={styles.jobTitle}>Electrician</Text>
              <Text style={styles.jobSubText}>Christchurch, New Zealand</Text>
              <Text style={styles.jobSubText}>
                Project completion by 13 Jan 2025
              </Text>
            </View>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
              style={styles.jobAvatar}
            />
          </View>

          <View style={styles.jobItem}>
            <View>
              <Text style={styles.jobTitle}>Concrete Finisher</Text>
              <Text style={styles.jobSubText}>Queenstown, New Zealand</Text>
              <Text style={styles.jobSubText}>
                Project completion by 13 Jan 2025
              </Text>
            </View>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/women/32.jpg'}}
              style={styles.jobAvatar}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => navigation.navigate('PickJob')}>
          <Text style={{color: '#fff'}}>See All</Text>
        </TouchableOpacity>
        {/* <FlatList
      data={jobPosts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={PostFeed}
      scrollEnabled={false}
    /> */}
        <PostFeed
          showBackButton={false}
          showBottomBar={false}
          showHeader={false}
          showLikeAndShare={false}
        />
        <TouchableOpacity style={styles.exploreCard}>
          <Text style={styles.exploreText}>
            "Find reliable workers for construction needs"
          </Text>
          <ExploreMoreButton
            text={'Explore More'}
            onPress={() => navigation.navigate('Feed')}
          />{' '}
        </TouchableOpacity>{' '}
        {/* <TouchableOpacity style={styles.exploreCard}>
    <Text style={styles.exploreText}>
      "Find reliable workers for construction needs"
    </Text>
    <Text style={styles.exploreButton}>Explore</Text>
  </TouchableOpacity> */}
        {/* <View style={{ height: 100 }} />
      <BottomTabBar /> */}
        {/* <View style={styles.bottomNav}>
<TouchableOpacity style={styles.navItem}>
  <Icon name="home" size={24} color="#6264A7" />
  <Text style={styles.navLabel}>Home</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.navItem}>
  <Icon name="event-note" size={24} color="#888" />
  <Text style={styles.navLabel}>Booking</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.fab}>
  <Icon name="add" size={28} color="#fff" />
</TouchableOpacity>

<TouchableOpacity style={styles.navItem}>
  <Icon name="chat" size={24} color="#888" />
  <Text style={styles.navLabel}>Chat</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.navItem}>
  <Icon name="notifications-none" size={24} color="#888" />
  <Text style={styles.navLabel}>Notify</Text>
</TouchableOpacity>
</View> */}
      </ScrollView>
      <View style={{height: 100}} />
      <BottomTabBar />
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

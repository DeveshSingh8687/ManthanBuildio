import React from 'react';
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
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { Icon } from 'react-native-elements';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation'

const { height } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const jobPosts = [
    {
      id: 1,
      user: 'Sadie Shelton',
      date: 'Jan 05, 2024',
      text: 'Just finished this challenging but rewarding renovation project. Loved the transformation!',
      image: 'https://source.unsplash.com/featured/?kitchen',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
      id: 2,
      user: 'Sadie Shelton',
      date: 'Jan 05, 2024',
      text: 'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
      image: 'https://source.unsplash.com/featured/?stairs',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
    {
      id: 3,
      user: 'Sadie Shelton',
      date: 'Jan 05, 2024',
      text: 'Hiring experienced carpenters and roofers for upcoming projects. Contact us for more info!',
      image: 'https://source.unsplash.com/featured/?construction',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
  ];
  const handlePress = () => {
    // Navigate to PostJob screen
    navigation.navigate('JobDetailS');
  };
  const renderPost = ({ item }:any) => (
    <View style={styles.postCard}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.userRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
        <Text style={styles.userText}>
          By {item.user} • {item.date}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
         source={require('../assets/launch_logo.png')}
          style={styles.logo}
        />
        <Icon name="person-outline" size={24} />
      </View>

      <TextInput style={styles.search} placeholder="Search" />

      <View style={styles.cardRow}>
      <TouchableOpacity style={styles.cardBtn}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>Post a task</Text>
            <Text style={styles.cardSubtitle}>Explore &gt;</Text>
          </View>
          <View style={styles.cardIcon}>
            {/* Image for Post a task */}
            <Image
              source={require('../assets/pickTask.png')}  // Replace with your own image for Post
              style={styles.iconImage}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Pick a task card */}
      <TouchableOpacity style={styles.cardBtn} onPress={handlePress}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>Pick a task</Text>
            <Text style={styles.cardSubtitle}>Explore &gt;</Text>
          </View>
          <View style={styles.cardIcon}>
            {/* Image for Pick a task */}
            <Image
              source={require('../assets/postTask.png')}  // Replace with your own image for Pick
              style={styles.iconImage}
            />
          </View>
        </View>
      </TouchableOpacity>

</View>

      <Text style={styles.sectionTitle}>Recently posted</Text>

      {/* Simulated job list */}
      <View style={styles.recentJobs}>
        <View style={styles.jobItem}>
          <View>
            <Text style={styles.jobTitle}>Carpenter</Text>
            <Text style={styles.jobSubText}>Auckland, New Zealand</Text>
            <Text style={styles.jobSubText}>Project completion by 13 Jan 2025</Text>
          </View>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/34.jpg' }}
            style={styles.jobAvatar}
          />
        </View>

        <View style={styles.jobItem}>
          <View>
            <Text style={styles.jobTitle}>Electrician</Text>
            <Text style={styles.jobSubText}>Christchurch, New Zealand</Text>
            <Text style={styles.jobSubText}>Project completion by 13 Jan 2025</Text>
          </View>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.jobAvatar}
          />
        </View>

        <View style={styles.jobItem}>
          <View>
            <Text style={styles.jobTitle}>Concrete Finisher</Text>
            <Text style={styles.jobSubText}>Queenstown, New Zealand</Text>
            <Text style={styles.jobSubText}>Project completion by 13 Jan 2025</Text>
          </View>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
            style={styles.jobAvatar}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.seeAll}>
        <Text style={{ color: '#fff' }}>See All</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exploreCard}>
        <Text style={styles.exploreText}>
          "Find reliable workers for construction needs"
        </Text>
        <Text style={styles.exploreButton}>Explore</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Social Feed</Text>

      <FlatList
        data={jobPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        scrollEnabled={false}
      />

      <View style={{ height: 100 }} />
      <View style={styles.bottomNav}>
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
</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { width: 100, height: 30, resizeMode: 'contain', marginTop:20 },
  search: {
    marginVertical: 16,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop:20
  },
  cardRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
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
  
  cardSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  
  cardIcon: {
    marginLeft: 12,
    // Add styles for real image or icon if needed
  },
  sectionTitle: { marginTop: 24, fontWeight: 'bold', fontSize: 16 },
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
    marginTop: 20,
    borderRadius: 10,
  },
  exploreText: { fontWeight: 'bold', marginBottom: 10 },
  exploreButton: { color: '#6264A7' },
  postCard: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  postImage: { width: '100%', height: 150, borderRadius: 10 },
  postText: { marginTop: 10, fontSize: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatarSmall: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  userText: { fontSize: 12, color: '#777' },
  recentJobs: { marginTop: 16 },
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  jobTitle: { fontWeight: 'bold', fontSize: 14 },
  jobSubText: { fontSize: 12, color: '#555' },
  jobAvatar: { width: 50, height: 50, borderRadius: 25 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 70,
    paddingBottom: 10,
    zIndex: 10,
  },
  
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#888',
  },
  
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6264A7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomeScreen;

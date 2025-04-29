import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';

const jobPosts = [
  {
    id: '1',
    user: 'Gabie Sheber',
    date: 'Jan. 02, 2024',
    image:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=60',
    content:
      'Just finished this challenging but rewarding renovation project. Loved the transformation!',
  },
  {
    id: '2',
    user: 'Gabie Sheber',
    date: 'Jan. 02, 2024',
    image:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=60',
    content:
      'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
  },
  {
    id: '3',
    user: 'Gabie Sheber',
    date: 'Jan. 02, 2024',
    image:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crp&w=800&q=6',
    content:
      'Hiring experienced carpenters and roofers for our upcoming project. Apply today!',
  },
];

const PostCard = ({ item, showLikeAndShare }: any) => {
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setLikes(likes + 1);
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity style={styles.card}    >
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://randomuser.me/api/portraits/women/65.jpg',
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item.user}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.content}>{item.content}</Text>
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
          {/* Apply Button */}
          {showLikeAndShare && (
  <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.viewMoreButton} onPress={() => {
      navigation.navigate('JobDetailsScreen')
    }}>
      <Text style={styles.viewMoreButtonText}>View More</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.applyButton}>
      <Text style={styles.applyButtonText}>Apply</Text>
    </TouchableOpacity>
  </View>
)}
  </TouchableOpacity>
  );
};

// 🧩 PostFeed now accepts props: heading, showBackButton, and onBackPress
export default function PostFeed({
  heading = 'Job Posts', // Default heading
  showBackButton = true,
  onBackPress = () => {},
  showHeader = true,
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showHeader?: boolean;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'My Jobs' | 'Applied Jobs'>('My Jobs');

  return (
<View style={{ flex: 1 }}>
    {(showBackButton && (
      <>
        <View style={styles.headerLogo}>
          <Image
            source={require('../assets/asset_logo.png')}
            style={styles.logo}
          />
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('AccountScreen')}>
            <Icon name="person-outline" size={24} />
          </TouchableOpacity>
          {/* <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} /> */}
        </View>
        {showBackButton && (
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Icon name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            {showBackButton && <Text style={styles.heading}>{heading}</Text>}
          </View>
        )}
      </>
    ))}

    <FlatList
      data={jobPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard item={item} showLikeAndShare={showBackButton} />
      )}
      contentContainerStyle={styles.list}
    />
    {showHeader && <View style={{ height: 100 }} />}
    {showHeader && <BottomTabBar />}
</View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff'

  },
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
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
  logo: { width: 100, height: 100, resizeMode: 'contain', marginTop:10,  alignSelf: 'flex-end', padding: 10},
  profileButton:{marginRight: 10, padding: 10, borderRadius: 8},


  header: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#fff'

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
    marginRight: 8, // space between buttons
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
  content: {
    fontSize: 14,
    color: '#333',
  },
  backButton: {
    // marginTop: 10,
    padding: 8,
    // backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  heading: {
    // marginTop:10,
    marginLeft: 10,          // add left space after back button
    fontSize: 18,
    fontWeight: 'bold',
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
  // applyButton: {
  //   backgroundColor: '#6264A7',
  //   paddingVertical: 10,
  //   borderRadius: 8,
  //   marginTop: 12,
  //   alignItems: 'center',
  // },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',     // horizontal layout
    alignItems: 'center',     // vertical center
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    // marginBottom: 8,          // small space after header
  },
});

import React, {useState} from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
import {NavPopup} from './components/Modal';
import TopBar from './components/TopBar';

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
    user: 'John Smith',
    date: 'Jan. 02, 2024',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    content:
      'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
  },
  {
    id: '3',
    user: 'Gabie Sheber',
    date: 'Jan. 02, 2024',
    image:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=800&q=60',
    content:
      'Hiring experienced carpenters and roofers for our upcoming project. Apply today!',
  },
];

const PostCard = ({
  item,
  showLikeAndShare,
  showButtonText,
  showLikeAndShareButton,
}: any) => {
  const [likes, setLikes] = useState(0);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLike = () => setLikes(prev => prev + 1);

  const handleClick = () => {
    if (showButtonText === 'Applications') {
      navigation.navigate('JobListComponent');
    } else {
      Alert.alert('Title', 'This is an alert message');
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{uri: 'https://randomuser.me/api/portraits/women/65.jpg'}}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item.user}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>

      <Image source={{uri: item.image}} style={styles.postImage} />
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

      {(showLikeAndShare || showLikeAndShareButton) && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('JobDetailsScreen')}>
            <Text style={styles.viewMoreButtonText}>View More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleClick}>
            <Text style={styles.applyButtonText}>
              {showButtonText || 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showBottomBar?: boolean;
  showButtonText?: string;
  showHeader?: boolean;
  showLikeAndShare?: boolean;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();
  const [modalVisible, setModalVisible] = React.useState(false);

  const {showLikeAndShareButton, showHeading} = (route.params || {}) as {
    showLikeAndShareButton?: boolean;
    showHeading?: string;
  };

  return (
    <View style={{flex: 1}}>
      {(showHeader || showLikeAndShareButton) && (
             <TopBar />
      )}
  {showBackButton && (
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#6264A7" />
              </TouchableOpacity>
              <Text style={styles.heading}>{heading}</Text>
            </View>
          )}
      <FlatList
        data={jobPosts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <PostCard
            item={item}
            showLikeAndShare={showLikeAndShare}
            showButtonText={showButtonText}
            showLikeAndShareButton={showLikeAndShareButton}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {(showBottomBar || showLikeAndShareButton) && (
        <>
        <View style={{height: 100, backgroundColor:'#fff'}} />
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
    padding: 12,
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
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginVertical: 10,
  },
  content: {
    fontSize: 14,
    color: '#333',
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
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});

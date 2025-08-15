import React, {useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import {NavPopup} from './components/Modal';
import TopBar from './components/TopBar';
import {fetchPosts} from '../utils/fetchPosts';
import Heading from './components/CommonHeader';
import ImageSlider from './components/ImageSlider';


const PostCard = ({item, navigation}: any) => {
  const [likes, setLikes] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const descriptionWords = item.description
    ? item.description.split(/\s+/)
    : [];
  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: item.user?.profile_picture || 'https://via.placeholder.com/50',
          }}
          style={styles.avatar}
        />
        <View style={{flex: 1}}>
          <Text style={styles.name}>
            {item.user?.first_name} {item.user?.last_name}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Edit & Delete Icons */}
        {/* <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddPostScreen', {
                updateFeed: true, // boolean, not string
                item: item, // pass the current item
              })
            }
            style={{paddingHorizontal: 4}}>
            <Icon name="edit" size={20} color="#6264A7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('Delete pressed', item.id)}
            style={{paddingHorizontal: 4}}>
            <Icon name="delete" size={20} color="#e53935" />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Image */}
      {/* {item.images?.length > 0 && (
        <Image source={{uri: item.images[0]}} style={styles.postImage} />
      )} */}
      <ImageSlider images={item.images} />

      {/* Description with Show more/less */}
      <Text style={styles.content}>{displayText}</Text>
      {isLong && (
        <Text
          style={{color: '#6264A7', marginTop: 4}}
          onPress={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      )}

      {/* Like & Share */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => setLikes(prev => prev + 1)}>
          <Icon name="thumb-up" size={20} color="#6264A7" />
          <Text style={styles.buttonLabel}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={20} color="#6264A7" />
          <Text style={styles.buttonLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Feed() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // start as loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts(1, 10); // pass page & limit if needed
        setPosts(fetchedPosts);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <View style={{flex: 1}}>
      <TopBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <Heading>Feed</Heading>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6264A7"
          style={{marginTop: 20}}
        />
      ) : error ? (
        <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          renderItem={({item}) => (
            <PostCard item={item} navigation={navigation} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={{height: 100}} />
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
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
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  heading: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '40%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});

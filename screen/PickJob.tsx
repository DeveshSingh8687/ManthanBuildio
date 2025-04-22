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

  return (
    <TouchableOpacity style={styles.card}>
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
    </TouchableOpacity>
  );
};

// 🧩 PostFeed now accepts props: heading, showBackButton, and onBackPress
export default function PostFeed({
  heading = 'Job Posts', // Default heading
  showBackButton = true,
  onBackPress = () => {},
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1 }}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      )}
      
      {/* Add Heading */}
      <Text style={styles.heading}>{heading}</Text>

      <FlatList
        data={jobPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard item={item} showLikeAndShare={showBackButton} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
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
  backButton: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
    margin: 16,
    borderRadius: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
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
});

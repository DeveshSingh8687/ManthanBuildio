import React from 'react';
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

const PostCard = ({ item }: any) => (
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
  </TouchableOpacity>
);

// 🧩 PostFeed now accepts props: showBackButton and onBackPress
export default function PostFeed({
  showBackButton = true,
  onBackPress = () => {},
}: {
  showBackButton?: boolean;
  onBackPress?: () => void;
}) 

{
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  return (
    <><View style={{ flex: 1 }}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack(); } }>
          <Icon name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      )}
      <FlatList
        data={jobPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard item={item} />}
        contentContainerStyle={styles.list} />
    </View><View style={{ height: 100 }} /><View style={styles.bottomNav}>
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
      </View></>
    
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
    marginBottom: 16,
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
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#888',
  },
  backButtonText: {
    fontSize: 16,
  },
});

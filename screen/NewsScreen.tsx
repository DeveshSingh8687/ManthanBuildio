import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackParamList } from '../navigation/Navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomTabBar from './components/BottomNavigaionBar';
import { NavPopup } from './components/Modal';
import TopBar from './components/TopBar';

const jobPosts = [
  {
    id: 1,
    user: 'Sadie Shelton',
    date: 'Jan 05, 2024',
    text: 'Just finished this challenging but rewarding renovation project. Loved the transformation!',
    image: 'https://picsum.photos/id/1/200/300',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 2,
    user: 'Sadie Shelton',
    date: 'Jan 05, 2024',
    text: 'Another day, another project! Working on a custom staircase today. #woodworking #craftsmanship',
    image: 'https://picsum.photos/200/300.jpg',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 3,
    user: 'Sadie Shelton',
    date: 'Jan 05, 2024',
    text: 'Hiring experienced carpenters and roofers for upcoming projects. Contact us for more info!',
    image: 'https://picsum.photos/200/300.jpg',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
];

const NewsScreen = ({ item }: any) => {
  return (
    <View style={styles.postCard}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.userRow}>
        <Text style={styles.userText}>
          By {item.user} • {item.date}
        </Text>
      </View>
    </View>
  );
};

export default function NewsFeed({
  heading = 'New Feed',
  showBackButton = true,
  showHeading = true,
  onBackPress = () => {},
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showHeading?: boolean;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View style={styles.container}>
         {(showHeading&&<>
         <TopBar/>
         {/* <View style={styles.header}>
        <Image
          source={require('../assets/asset_logo.png')}
          style={styles.logo} />
        <TouchableOpacity style={styles.profileButton}onPress={() => setModalVisible(true)}>
          <Icon name="person-outline" size={24} />
        </TouchableOpacity>
        <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />   
      </View> */}
      <ScrollView style={styles.container}></ScrollView></>)}
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        {showHeading && (
          <Text style={styles.heading}>{heading}</Text>
        )}
      </View>

      {/* Main Content */}
      <FlatList
        data={jobPosts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <NewsScreen item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Bar */}
      {(showHeading&& <View style={{ height: 100 }} />)}
      
      {(showHeading&&<BottomTabBar />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'

  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    // backgroundColor: '#f2f2f2',
  },
  // logo: { width: 100, height: 100, resizeMode: 'contain', marginTop:10,  alignSelf: 'flex-end', padding: 10},
  profileButton:{marginRight: 10, padding: 10, borderRadius: 8},
  backButton: {
    marginTop: 10,
    padding: 8,
    marginRight: 10,
    borderRadius: 8,
  },
  heading: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  logo: { width: 100, height: 70, resizeMode: 'contain', marginTop:10 },

  list: {
    padding: 10,
    // paddingBottom: 80, // Space for BottomTabBar
  },
  postCard: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  postText: {
    marginTop: 10,
    fontSize: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userText: {
    fontSize: 12,
    color: '#777',
  },
});

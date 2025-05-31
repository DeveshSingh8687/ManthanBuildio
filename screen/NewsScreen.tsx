import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { RootStackParamList } from '../navigation/Navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomTabBar from './components/BottomNavigaionBar';
import { NavPopup } from './components/Modal';
import TopBar from './components/TopBar';

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
  limit = 3,
}: {
  heading?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showHeading?: boolean;
  limit?: number;
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const limitedPosts = jobPosts.slice(0, limit);

  // Fetch data from the API
  useEffect(() => {
    fetch('https://6821d085b342dce8004be96b.mockapi.io/buildio/home/home')
      .then((response) => response.json())
      .then((data) => {
        setJobPosts(data); // Set the fetched data to the jobPosts state
        setLoading(false); // Set loading to false once data is loaded
      })
      .catch((error) => {
        console.error('Error fetching job posts:', error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        // Show loader only when data is loading
        <ActivityIndicator size="large" color="#6264A7" style={styles.loader} />
      ) : (
        <>
          {showHeading && (
            <>
              <TopBar />
              <ScrollView style={styles.container}></ScrollView>
            </>
          )}

          {/* Top Bar */}
          <View style={styles.topBar}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Icon name="arrow-back" size={24} color="#6264A7" />
              </TouchableOpacity>
            )}
            {showHeading && <Text style={styles.heading}>{heading}</Text>}
          </View>

          {/* Main Content */}
          <FlatList
            data={showBackButton ? jobPosts : limitedPosts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <NewsScreen item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Bar */}
          {showHeading && <View style={{ height: 100 }} />}
          {showHeading && <BottomTabBar />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profileButton: { marginRight: 10, padding: 10, borderRadius: 8 },
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
  list: {
    padding: 10,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

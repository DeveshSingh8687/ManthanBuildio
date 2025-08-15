import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';

const NewsCard = ({item}: any) => {
  const [expanded, setExpanded] = useState(false);
  const descriptionWords = item.description
    ? item.description.split(/\s+/)
    : [];

  const isLong = descriptionWords.length > 20;
  const displayText = expanded
    ? item.description
    : descriptionWords.slice(0, 20).join(' ') + (isLong ? '...' : '');
  return (
    <View style={styles.postCard}>
      {item.images?.[0] && (
        <Image source={{uri: item.images[0]}} style={styles.postImage} />
      )}
      {/* Description */}
      <Text style={styles.postText}>{displayText}</Text>

      {isLong && (
        <Text
          style={{color: '#6264A7', marginTop: 4}}
          onPress={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      )}
      <View style={styles.userRow}>
        <Image
          source={{
            uri: item.user?.profile_picture || 'https://via.placeholder.com/30',
          }}
          style={{width: 24, height: 24, borderRadius: 12, marginRight: 6}}
        />
        <Text style={styles.userText}>
          By {item.user?.first_name} {item.user?.last_name} •{' '}
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

export default function NewsFeed({
  heading = 'News Feed',
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
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://buildio.co.nz/api/news/list?page=1&limit=10', {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJyYWppbmRlckBleGFtcGxlLmNvbSIsImlhdCI6MTc1NDgyNzg2MiwiZXhwIjoxNzU1NDMyNjYyfQ.us1M3wpV900mfHMFBqA67vwmhXS1AI1uu2g2NknmB58',
      },
    })
      .then(response => response.json())
      .then(data => {
        setJobPosts(data?.data?.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching job posts:', error);
        setLoading(false);
      });
  }, []);

  const limitedPosts = showBackButton ? jobPosts : jobPosts.slice(0, limit);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6264A7" style={styles.loader} />
      ) : (
        <>
          {showHeading && <TopBar />}

          <View style={styles.topBar}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              />
            )}
            {showHeading && <Text style={styles.heading}>{heading}</Text>}
          </View>

          <FlatList
            data={limitedPosts}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => <NewsCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {showHeading && <View style={{height: 100}} />}
          {showHeading && <BottomTabBar />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  topBar: {flexDirection: 'row', alignItems: 'center', padding: 10},
  backButton: {padding: 8, marginRight: 10, borderRadius: 8},
  heading: {fontSize: 20, fontWeight: '700', color: '#6264A7'},
  list: {padding: 10},
  postCard: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  postImage: {width: '100%', height: 150, borderRadius: 10},
  postText: {marginTop: 10, fontSize: 14},
  userRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  userText: {fontSize: 12, color: '#777'},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});

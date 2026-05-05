import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import BottomTabBar from './BottomNavigaionBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from './TopBar';

export default function Bookings() {
  const navigation = useNavigation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://buildio.co.nz/api/users/my_bookings';

  const fetchBookings = async () => {
    const token = await AsyncStorage.getItem('authToken');

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      console.log('Bookings:', json); // DEBUG
      if (json && json.data && json.data.data) {
        setBookings(json.data.data); // ← drill into the nested data array
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderItem = ({item}) => {
    const user = item.user || {};
    const profileImage =
      user.profile_picture || 'https://via.placeholder.com/50';
    const jobImage = item.images?.[0];

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('UserScreen', {user})}>
        <View style={styles.jobContainer}>
          <Image source={{uri: profileImage}} style={styles.avatar} />

          <View style={styles.jobDetails}>
            <Text style={styles.jobTitle}>
              {user.first_name || 'N/A'} {user.last_name || ''}
            </Text>
            <Text style={styles.jobType}>
              {item.job_type?.job || 'Unknown Job'}
            </Text>
            <Text>Status: {item.status || 'Unknown'}</Text>
            <Text>Budget: ${item.budget}</Text>
            <Text>
              Deadline: {new Date(item.deadline).toLocaleDateString()}
            </Text>
          </View>

          {jobImage && (
            <Image source={{uri: jobImage}} style={styles.jobImage} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6264A7" />
          </View>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderItem}
            keyExtractor={item => item?.id?.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bookings found</Text>
              </View>
            }
          />
        )}

        <View style={{height: 100}} />
        <BottomTabBar />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  jobDetails: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

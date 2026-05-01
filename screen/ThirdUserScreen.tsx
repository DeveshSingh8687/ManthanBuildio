import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import {capitalizeFirstLetter} from '../utils/helper';
import {generateChatId, markMessagesAsRead} from '../utils/chatUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserScreen = ({route}) => {
  const {user} = route.params;
  const [currentUserId, setCurrentUserId] = useState('');

  console.log(user?.id, 'user'); // 👈 comes from navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // default coords (since your response doesn't have lat/lng)
  const [region] = React.useState({
    latitude: -36.8485,
    longitude: 174.7633,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const storedUserId = await AsyncStorage.getItem('USERID');

        let userId = storedUserId;
        if (!userId && userString) {
          const user = JSON.parse(userString);
          userId = user.id;
        }

        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUser();
  }, []);
  const handleChatPress = useCallback(
    (user: any, event?: any) => {
      // If you need the event object for any reason, persist it
      if (event && event.persist) {
        event.persist();
      }
      console.log(user?.id);

      const handlePressAsync = async () => {
        console.log(user, 'sere');
        try {
          await markMessagesAsRead(currentUserId, user?.id);
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }

        navigation.navigate('ChatDetailScreen', {
          myChatId: currentUserId,
          data: user,
        });
      };

      handlePressAsync();
    },
    [currentUserId, navigation],
  );

  return (
    <>
      <TopBar />
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.titleCardWrapper}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{uri: user.profile_picture}}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.titleCard}>
            <Text style={styles.titleText}>
              {capitalizeFirstLetter(user.first_name)}{' '}
              {capitalizeFirstLetter(user.last_name)}
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            {capitalizeFirstLetter(user.about) || 'No bio available'}
          </Text>
        </View>

        {/* Location (Static Map, since no coords in response) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>Auckland, New Zealand</Text>
          <MapView style={styles.map} initialRegion={region}>
            <Marker coordinate={region} />
          </MapView>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
            <View style={styles.infoDivider} />
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phone_number}</Text>
            <View style={styles.infoDivider} />
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{user.experience} Years</Text>
            <View style={styles.infoDivider} />
          </View>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => handleChatPress(user)} // ✅ Correct
          >
            <Text style={styles.applyText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomTabBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginBottom: 28,
    marginTop: 18,
  },
  backArrow: {
    fontSize: 24,
    color: '#25396F',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 15,
  },

  titleCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  profileImageWrapper: {
    position: 'absolute',
    top: -45,
    zIndex: 2,
    elevation: 2,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  titleCard: {
    backgroundColor: '#ccc',
    alignItems: 'center',
    width: '100%',
    height: 80,
    justifyContent: 'center',
    zIndex: 1,
    borderRadius: 10,
    paddingTop: 30,
  },
  titleText: {marginTop: 10, fontSize: 14, fontWeight: '600'},

  section: {marginBottom: 20},
  sectionTitle: {fontWeight: 'bold', color: '#25396F', marginBottom: 5},
  sectionText: {color: '#333', alignItems: 'center'},
  readMore: {color: '#25396F', fontWeight: 'bold', marginTop: 5},

  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    ...Platform.select({
      ios: {overflow: 'hidden'},
      android: {},
    }),
  },

  infoBlock: {marginBottom: 12},
  infoLabel: {fontWeight: '600', fontSize: 13, color: '#25396F'},
  infoValue: {fontSize: 13, color: '#444', marginTop: 2},
  infoDivider: {height: 1, backgroundColor: '#eee', marginTop: 8},

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  chip: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  applyBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 120,
  },
  applyText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
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
  profileButton: {marginRight: 10, padding: 10, borderRadius: 8},
  heading: {
    // marginTop:10,
    marginLeft: 10, // add left space after back button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserScreen;

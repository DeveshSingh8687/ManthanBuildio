import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from './config/auth';

const profileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  about:
    'Experienced software developer with a passion for building great mobile apps.',
  job: 'Software Developer',
  profilePhoto: 'https://i.pravatar.cc/150?img=3',
};

const AccountScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  type UserData = {
    first_name: string;
    last_name: string;
    profile_picture?: string;
    social_media_provider?: string;
    // add other fields as needed
  };

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Error', 'No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch(
        'https://buildio.co.nz/api/users/my_profile',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLoading(true);
      const contentType = response.headers.get('content-type');
      const text = await response.text();

      if (contentType && contentType.includes('application/json')) {
        const json = JSON.parse(text);
        if (response.ok) {
          setUserData(json.data);
        } else {
          Alert.alert('Error', json.message || 'Failed to fetch user');
        }
      } else {
        Alert.alert('Error', 'Unexpected response format');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) return <ActivityIndicator style={{flex: 1}} size="large" color="#6264A7" />;
  const socialMediaCheck = userData?.social_media_provider;
  const handleBackPress = () => {
    navigation.goBack();
  };
  const handleLogout = async () => {
    const success = await logout();
    console.log('logout');
    if (success) {
      navigation.navigate('Login');
    }
  };  
  const handleEditPress = () => {
    navigation.navigate('UserDetailScreen', {
      userData: userData,
    } as any);
  };

  // const handleLogout = () => {
  //   console.log('Logout pressed');
  // };

  const renderRow = (label: string, p0: () => void) => {
    const onPress = () => {
      if (label === 'Manage address') {
        navigation.navigate('ManageAddressScreen');
      } else if (label === 'Manage Payment Methods') {
        navigation.navigate('ManagePaymentMethodsScreen'); // example
      } else if (label === 'About Buildio') {
        navigation.navigate('AboutUsScreen');
        // example
      } else if (label === 'Notifications') {
        navigation.navigate('NotificationsScreen');
        // example
      } else if (label === 'Privacy & Security') {
        navigation.navigate('PrivacySecurity');
        // example
      } else if (label === 'Reset Password') {
        navigation.navigate('ResetPassword');
        // example
      }
      // handle others similarly...
    };

    return (
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <Text style={styles.rowText}>{label}</Text>
        <Icon name="chevron-forward" type="ionicon" size={16} color="#333" />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageWrapper}>
                <Image
                  source={{uri: userData?.profile_picture}}
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={handleEditPress}>
                  <Icon
                    name="pencil"
                    type="ionicon"
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>
                {userData?.first_name} {userData?.last_name}
              </Text>
            </View>

            {renderRow('Manage address', () =>
              navigation.navigate('ManageAddressScreen'),
            )}
            {renderRow('Manage Payment Methods', () =>
              navigation.navigate('ManagePaymentMethodsScreen'),
            )}
            {renderRow('Notifications', () =>
              navigation.navigate('NotificationsScreen'),
            )}
            {renderRow('Privacy & Security', () =>
              navigation.navigate('PrivacySecurity'),
            )}
            {renderRow('About Buildio', () =>
              navigation.navigate('AboutUsScreen'),
            )}
            {userData?.social_media_provider === null &&
              renderRow('Reset Password', () =>
                navigation.navigate('ResetPassword'),
              )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon
                name="log-out-outline"
                type="ionicon"
                size={24}
                color="#fff"
              />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BottomTabBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 40,
    // paddingHorizontal: 16,
    marginTop: 30,
    paddingBottom: 10,
    // justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingLeft: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6264A7',
    borderRadius: 12,
    padding: 6,
  },
  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#6264A7',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: '#6264A7',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120, // extra space to avoid being hidden by BottomTabBar
    paddingTop: 24,
  },
});

export default AccountScreen;

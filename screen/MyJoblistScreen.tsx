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
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {acceptJobApplication, declineJobApplication} from '../utils/fetchJobs';

export default function TopTabsComponent() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedApplicants, setApprovedApplicants] = useState<number[]>([]);

  const route = useRoute();
  const {jobId} = route.params as {jobId: number};
  const API_URL = `https://buildio.co.nz/api/jobs/applicants/${jobId}`;

  const fetchApplicants = async () => {
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
      if (json.status) {
        setApplicants(json.data);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);
  const handleApplicantAction = async (
    action: 'accept' | 'decline',
    applicantId: number,
  ) => {
    try {
      if (action === 'accept') {
        await acceptJobApplication(applicantId);
      } else {
        await declineJobApplication(applicantId);
      }
      await fetchApplicants(); // 🔄 refresh list after action
    } catch (err) {
      console.error(`Error trying to ${action} job`, err);
    }
  };

  const renderItem = ({item}: any) => {
    const user = item.user || {};
    const profileImage =
      user.profile_picture || 'https://via.placeholder.com/50';
    const isDisabled = item.status === 'approved' || item.status === 'rejected';
    console.log(isDisabled,'isDisabled')

    return (
      <TouchableOpacity onPress={() => navigation.navigate('UserScreen')}>
        <View style={styles.jobContainer}>
          <Image source={{uri: profileImage}} style={styles.avatar} />
          <View style={styles.jobDetails}>
            <Text style={styles.jobTitle}>
              {user.first_name} {user.last_name}
            </Text>
            <Text>Experience: {user.experience}</Text>
            <Text style={styles.completion}>Status: {item.status}</Text>
          </View>

          <View style={styles.iconGroup}>
            {/* Accept button */}
            <TouchableOpacity
              disabled={isDisabled}
              onPress={() => handleApplicantAction('accept', item.id)}>
              <Icon
                name="check-circle"
                size={24}
                color={isDisabled ? '#ccc' : '#6264A7'}
              />
            </TouchableOpacity>

            {/* Decline button */}
            <TouchableOpacity
              style={{marginLeft: 10}}
              disabled={isDisabled}
              onPress={() => handleApplicantAction('decline', item.id)}>
              <Icon
                name="cancel"
                size={24}
                color={isDisabled ? '#ccc' : '#e53935'}
              />
            </TouchableOpacity>
          </View>
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
            data={applicants}
            renderItem={renderItem}
            keyExtractor={item => item?.id.toString()}
            contentContainerStyle={{paddingBottom: 20}}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No applicant found</Text>
                </View>
              ) : null
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
  completion: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

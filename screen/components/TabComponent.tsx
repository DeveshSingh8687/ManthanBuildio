import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import PostFeed from '../PickJob';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/Navigation';
import {NavPopup} from './Modal';
import TopBar from './TopBar';
import {fetchMyJobs, getAppliedJobs} from '../../utils/fetchJobs';

const Tab = createMaterialTopTabNavigator();

export default function TopTabsComponent() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const result = await fetchMyJobs();
      if (result.success) {
        const jobs = result.data;

        // Filter based on how your API marks applied vs. created jobs
        // console.log(jobs,jobs);

        setMyJobs(jobs);
        // setAppliedJobs(appliedJobsList);
      } else {
        console.warn('Error loading jobs:', result.error);
      }
      setLoading(false);
    };

    loadJobs();
  }, []);
  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);

      // On focus, close the modal
    }, []),
  );

    useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAppliedJobs();
        setAppliedJobs(data?.data || []);
      } catch (error) {
        console.log('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  console.log(appliedJobs,'applied jobs')
    console.log(myJobs,'myJobs')

 
  return (
    <>
      <TopBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Tab Section */}
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
              textTransform: 'none',
            },
            tabBarStyle: {
              backgroundColor: 'white',
              elevation: 2,
              shadowColor: '#ccc',
              shadowOpacity: 0.1,
              shadowOffset: {width: 0, height: 2},
              marginTop: -10,
            },
            tabBarIndicatorStyle: {
              backgroundColor: '#5e5ba3',
              height: 3,
              borderRadius: 2,
            },
          }}>
          <Tab.Screen
            name="My Jobs"
            children={() => (
              <PostFeed
                key={`my-jobs-${myJobs.length}`}
                showButtonText="Applications"
                showBottomBar={true}
                showHeader={false}
                showBackButton={false}
                myJobs={myJobs}
              />
            )}
          />
          <Tab.Screen
            name="Applied Jobs"
            children={() => (
              <PostFeed
                showButtonText="Status"
                showBottomBar={true}
                showHeader={false}
                showBackButton={false}
                myJobs ={appliedJobs}
              />
            )}
          />
        </Tab.Navigator>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    backgroundColor: 'white',
  },
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
  profileButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  backButtonContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 24,
    color: '#25396F',
  },
  backButtonText: {
    fontSize: 20,
    marginLeft: 5,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
});

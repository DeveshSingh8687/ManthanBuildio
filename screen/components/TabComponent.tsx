import React, {useCallback} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/Navigation';
import {NavPopup} from './Modal';
import TopBar from './TopBar';

const Tab = createMaterialTopTabNavigator();

export default function TopTabsComponent() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = React.useState(false);
  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);

      // On focus, close the modal
    }, []),
  );
  return (
    <>
      {/* <View style={styles.headerLogo}>
      <Image
        source={require('../../assets/asset_logo.png')}
        style={styles.logo}
      />
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setModalVisible(true)}>
        <Icon name="person-outline" size={24} />
      </TouchableOpacity>
    </View> */}
      <TopBar />
      <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Back Button */}
      {/* <View style={styles.backButtonContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#000" />
        <Text style={styles.backButtonText}>Jobs</Text>
      </TouchableOpacity>
    </View> */}

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
                showButtonText="Applications"
                showBottomBar={true}
                showHeader={false}
                showBackButton={false}
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

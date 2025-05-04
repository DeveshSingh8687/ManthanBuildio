import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  FlatList,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';

const data = [
  { id: '1', name: 'Ultimate Doe', location: 'New York', completion: 'Jan 2025', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Jane Smith', location: 'Los Angeles', completion: 'Feb 2025', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Michael Johnson', location: 'Chicago', completion: 'Mar 2025', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Sarah Lee', location: 'Houston', completion: 'Apr 2025', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'David Brown', location: 'Phoenix', completion: 'May 2025', image: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: '6', name: 'Emily Davis', location: 'Philadelphia', completion: 'Jun 2025', image: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { id: '7', name: 'James Wilson', location: 'San Antonio', completion: 'Jul 2025', image: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { id: '8', name: 'Olivia Martinez', location: 'Dallas', completion: 'Aug 2025', image: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { id: '9', name: 'Liam Anderson', location: 'San Diego', completion: 'Sep 2025', image: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { id: '10', name: 'Sophia Thomas', location: 'Detroit', completion: 'Oct 2025', image: 'https://randomuser.me/api/portraits/women/10.jpg' },
];

export default function TopTabsComponent() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate('UserScreen')}>

    <View style={styles.jobContainer}>
      <Image source={{ uri: item.image }} style={styles.avatar} />

      <View style={styles.jobDetails}>
        <Text style={styles.jobTitle}>{item.name}</Text>
        <Text>{item.location}</Text>
        <Text style={styles.completion}>Completion: {item.completion}</Text>
      </View>

      <View style={styles.iconGroup}>
        <TouchableOpacity>
          <Icon name="check-circle" size={24} color="#6264A7" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 10 }}>
          <Icon name="cancel" size={24} color="#cccccc" />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <><TopBar /><SafeAreaView style={styles.safeArea}>
      {/* Optional custom status bar color */}
      {/* <View style={styles.headerLogo}>
      <Image
        source={require('../assets/asset_logo.png')}
        style={styles.logo}
      />
      <TouchableOpacity style={styles.profileButton}>
        <Icon name="person-outline" size={24} />
      </TouchableOpacity>
    </View> */}
{/* 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Applicants</Text>
      </View> */}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }} />
      <View style={{ height: 100 }} />
      <BottomTabBar />
    </SafeAreaView></>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  profileButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    // textAlign: 'center',
    marginRight: 30, // Adjusted to center the heading when back button exists
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
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
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
});

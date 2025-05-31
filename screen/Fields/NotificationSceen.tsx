import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';
const notificationData = [
  {
    id: 1,
    title: 'New message',
    description: 'You have a new message from a potential client.',
    time: '1 minute',
    buttonText: 'View now',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    highlighted: true,
    backgroundColor: '#E8EAF6',
  },
  {
    id: 2,
    title: 'Your job notification',
    description:
      'A contractor has shortlisted your profile for a painting project. View their project details.',
    time: '1 Hour',
    buttonText: 'See Details',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    highlighted: false,
    backgroundColor: '#fff',
  },
  {
    id: 3,
    title: 'New job alert',
    description:
      'A new carpentry project has been posted in Auckland. Check it out now!',
    time: '6 Hours',
    buttonText: 'See job',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    highlighted: false,
    backgroundColor: '#E8EAF6',
  },
];

type Props = {
  navigation: {
    goBack: () => void;
  };
};
function NotificationsScreen({navigation}: Props) {
  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        <TouchableOpacity style={styles.markReadButton}>
          <Text style={styles.markReadText}>Mark as read</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollArea}>
          {notificationData.map(item => (
            <View
              key={item.id}
              style={[styles.card, {backgroundColor: item.backgroundColor}]}>
              <Image source={{uri: item.image}} style={styles.avatar} />
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <View style={{height: 100}} />
      <BottomTabBar />
    </>
  );
}
export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  markRead: {
    color: '#6264A7',
    fontWeight: '600',
    fontSize: 13,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B4B',
    marginLeft: 12,
  },
  header: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  markReadButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  markReadText: {
    color: '#6264A7',
    fontWeight: '600',
  },
  scrollArea: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    //   height: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  backButton: {
    marginRight: 12,
    backgroundColor: '#6264A7',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  description: {
    color: '#333',
    fontSize: 14,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#6264A7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

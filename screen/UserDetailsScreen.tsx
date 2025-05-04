import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditPress = () => {
    navigation.navigate('UserDetailScreen');
  };

  const handleLogout = () => {
    console.log('Logout pressed');
  };

  const renderRow = (label: string) => (
    <TouchableOpacity style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Icon name="chevron-forward" size={20} color="#333" />
    </TouchableOpacity>
  );

  return (
    <><TopBar /><ScrollView><View style={styles.container}>

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 24 }} /> 
      </View> */}

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: profileData.profilePhoto }}
              style={styles.profileImage} />
            <TouchableOpacity style={styles.editIcon} onPress={handleEditPress}>
              <Icon name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profileData.name}</Text>
        </View>

        {/* List Rows */}
        {renderRow('Manage address')}
        {renderRow('Manage payment method')}
        {renderRow('Notifications')}
        {renderRow('Privacy & Security')}
        {renderRow('About Buildio')}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View></ScrollView><BottomTabBar /></>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
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
});

export default AccountScreen;

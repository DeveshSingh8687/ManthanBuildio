import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/Navigation';
import { handleSecurePress, logout } from '../config/auth';

export const NavPopup = ({ visible, onClose }: any) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, [visible]); // re-check when modal is shown

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setIsLoggedIn(false);
      navigation.navigate('Login');
    }
  };

  const handleNavigate = (screen: keyof RootStackParamList) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.navContainer}>
            {isLoggedIn ? (
              <>
                <TouchableOpacity
                  style={styles.navItemMenu}
                  onPress={() => handleSecurePress('AccountScreen', navigation)}>
                  <Icon name="account-circle" type="material" size={22} />
                  <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItemMenu}
                  onPress={() => handleSecurePress('JobsSection', navigation)}>
                  <Icon name="assignment" type="material" size={22} />
                  <Text style={styles.navText}>Jobs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItemMenu}
                  onPress={() => handleSecurePress('MyProfile', navigation)}>
                  <Icon name="person" type="material" size={22} />
                  <Text style={styles.navText}>My Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItemMenu} onPress={handleLogout}>
                  <Icon name="logout" type="material" size={22} color="#6264A7" />
                  <Text style={[styles.navText, { color: '#6264A7' }]}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.navItemMenu}
                  onPress={() => handleNavigate('Login')}>
                  <Icon name="login" type="material" size={22} color="#6264A7" />
                  <Text style={[styles.navText, { color: '#6264A7' }]}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItemMenu}
                  onPress={() => handleNavigate('SignUp')}>
                  <Icon name="person-add" type="material" size={22} color="#6264A7" />
                  <Text style={[styles.navText, { color: '#6264A7' }]}>Sign Up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 30 : 0,
  },
  navContainer: {
    width: 170,
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 15,
    // borderTopLeftRadius: 12,
    // borderBottomLeftRadius: 12,
    marginTop: 60,
    marginRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
  },
  navText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3F51B5',
  },
  navItemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/Navigation';

export const NavPopup = ({visible, onClose}: any) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    // TODO: Add your logout logic here (clear tokens, etc.)
    onClose(); // Close modal
    // navigation.navigate('LoginScreen'); // Redirect to login screen
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
        <View style={styles.navContainer}>
          {/* Profile Section can be added here */}

          {/* Profile Option */}
          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => {
              onClose();
              navigation.navigate('AccountScreen');
            }}>
            <Icon name="account-circle" type="material" size={24} />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          {/* Jobs Option */}
          <TouchableOpacity
            style={styles.navItemMenu}
            onPress={() => {
              onClose();
              navigation.navigate('JobsSection');
            }}>
            <Icon name="assignment" type="material" size={24} />
            <Text style={styles.navText}>Jobs</Text>
          </TouchableOpacity>

          {/* Logout Option */}
          <TouchableOpacity style={styles.navItemMenu} onPress={handleLogout}>
            <Icon name="logout" type="material" size={24} color="#6264A7" />
            <Text style={[styles.navText, {color: '#6264A7'}]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  navContainer: {
    width: 150,
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 50,
    marginRight: 10,
    elevation: 5,
  },
  navText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3F51B5',
  },
  navItemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
});

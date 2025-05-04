import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import BottomTabBar from './components/BottomNavigaionBar';
import JobCategoryList from './components/DropDown';
import TopBar from './components/TopBar';

// const NavPopup = ({visible, onClose}: any) => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   return (
//     <Modal
//       transparent
//       animationType="slide"
//       visible={visible}
//       onRequestClose={onClose}>
//       <TouchableOpacity
//         style={styles.modalOverlay}
//         activeOpacity={1}
//         onPress={onClose}>
//         <View style={styles.navContainer}>
//           {/* User Profile Section */}
//           {/* <View style={styles.profileSection}>
//             <Image
//               source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
//               style={styles.profileImage}
//             />
//             <Text style={styles.profileName}>John Smith</Text>
//             <Text style={styles.profileSubText}>Software Developer</Text>
//           </View> */}

//           {/* Menu Options */}
//           <TouchableOpacity
//             style={styles.navItemMenu}
//             onPress={() => navigation.navigate('AccountScreen')}>
//             <Icon
//               name="account-circle"
//               type="material"
//               size={24}
//               // color="#000"
//             />{' '}
//             <Text style={styles.navText}>Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.navItemMenu}
//             onPress={() => navigation.navigate('JobsSection')}>
//             <Icon
//               name="assignment"
//               type="material"
//               size={24}
//               // color="#FF0000"
//             />{' '}
//             <Text style={styles.navText}>Jobs</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navItemMenu}>
//             <Icon name="logout" type="material" size={24} color="#FF3B30" />
//             <Text style={[styles.navText, {color: '#FF3B30'}]}>Logout</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// };

const AddJobScreen = () => {
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [jobTypeValue, setJobTypeValue] = useState(null);
  const [jobTypeItems, setJobTypeItems] = useState([
    {label: 'Full-time', value: 'full_time'},
    {label: 'Part-time', value: 'part_time'},
    {label: 'Internship', value: 'internship'},
    {label: 'Freelance', value: 'freelance'},
  ]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fields = [
    'Description',
    'Requirements',
    'Job location',
    'Job position',
    'Job Status',
    'Experience',
    'Deadline',
    'Budget',
  ];

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Requirements';
  const [modalVisible, setModalVisible] = React.useState(false);
  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);

      // On focus, close the modal
    }, []),
  );
  return (
    
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar/>
      {/* <View style={styles.headerLogo}>
        <Image
          source={require('../assets/asset_logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="person-outline" size={24} />
        </TouchableOpacity>
      </View> */}
      {/* <NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} /> */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.flex}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.container}
            extraScrollHeight={100}
            enableOnAndroid
            keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.leftSection}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  <Icon name="arrow-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                {/* <Text style={styles.cancelText}>Cancel</Text> */}
              </View>

              <Text style={styles.title}>Post a Job</Text>

              {/* <View style={styles.rightSection}>
                <TouchableOpacity>
                  <Text style={styles.nextButton}>Next</Text>
                </TouchableOpacity>
              </View> */}
            </View>

            {/* Input Fields */}
            {fields.map((label, index) => {
              const multiline = isMultiline(label);
              return (
                <View key={index} style={styles.inputCard}>
                  <View style={styles.inputHeader}>
                    <Text style={styles.label}>{label}</Text>
                    <TouchableOpacity>
                      <Icon name="edit" size={18} color="#6264A7" />
                    </TouchableOpacity>
                  </View>
                  {(label === 'Description' || label === 'Requirements') && (
                    <View style={styles.separator} />
                  )}{' '}
                  {/* Separator */}
                  <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder="type..."
                    placeholderTextColor="#888"
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                  />
                </View>
              );
            })}
            <JobCategoryList />
            {/* Image Upload Section */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Add image</Text>
              <View style={styles.imageRow}>
                {['camera-alt', 'photo-library'].map((icon, idx) => (
                  <TouchableOpacity key={idx} style={styles.imageButton}>
                    <Icon name={icon} size={22} color="white" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
      <BottomTabBar />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 24,
    marginTop: 0,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  // rightSection: {
  //   justifyContent: 'flex-end',
  //   alignItems: 'flex-end',
  // },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    position: 'absolute',
    left: '30%',
    transform: [{translateX: -45}],
    top: 24,
    
  },
  // nextButton: {
  //   fontSize: 12,
  //   color: '#6264A7',
  //   marginTop: 40,
  // },
  // cancelText: {
  //   fontSize: 12,
  //   color: '#6264A7',
  //   marginTop: 10,
  // },
  inputCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 10,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  input: {
    paddingVertical: 6,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  imageButton: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
  },
  backButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 4,
    marginBottom: 8,
  },
  // headerLogo: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 10,
  //   paddingVertical: 8,
  //   backgroundColor: '#fff',
  // },
  // logo: {
  //   width: 100,
  //   height: 100,
  //   resizeMode: 'contain',
  // },
  // profileButton: {
  //   marginRight: 10,
  //   padding: 10,
  //   borderRadius: 8,
  // },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  navContainer: {
    width: 250,
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

export default AddJobScreen;

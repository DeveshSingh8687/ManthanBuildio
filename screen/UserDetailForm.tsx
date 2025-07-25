import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';

import CustomJobSelector from './components/MultiSelectDropDown';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {RouteProp} from '@react-navigation/native';

const AddJobScreen = ({
  route,
}: {
  route: RouteProp<RootStackParamList, keyof RootStackParamList>;
}) => {
  const userData = (route.params as any)?.userData; // If you need userData, use: const userData = (route.params as any)?.userData;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  console.log('Selected Jobs:', selectedJobs);

  const handleCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    launchCamera({mediaType: 'photo', saveToPhotos: true}, response => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri ?? null);
      }
    });
  };
  const handleGallery = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri ?? null);
      }
    });
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        Name: userData.first_name || '',
        'Last Name': userData.last_name || '',
        'Phone Number': userData.phone_number || '',
        Description: userData.about || '',
        Experience: userData.experience || '',
        Email: userData.email || '',
        'Job Type': userData.user_job_types?.[0] || '', // adjust if needed
      });
      setSelectedImage(userData.profile_picture || null);
    }
  }, [userData]);
  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   try {
  //     const token = await AsyncStorage.getItem('YourAuthTokenKey'); // update with your key

  //     const form = new FormData();

  //     form.append('first_name', formData['Name']);
  //     form.append('last_name', formData['Name']); // or add a Last Name field
  //     form.append('phone_number', formData['Phone Number']);

  //     if (selectedImage) {
  //       const fileName = selectedImage.split('/').pop();
  //       const fileType = fileName?.split('.').pop();

  //       form.append('profile_image', {
  //         uri: selectedImage,
  //         type: `image/${fileType}`,
  //         name: fileName || 'profile.jpg',
  //       });
  //     }

  //     const response = await axios.post(
  //       'http://4.245.1.145:4000/api/users/update',
  //       form,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );

  //     console.log('Profile updated:', response.data);
  //     alert('Profile successfully updated!');
  //   } catch (error) {
  //     console.error('Update error:', error.message);
  //     alert('Failed to update profile');
  //   }
  // };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fields = [
    'Name',
    'Last Name',
    'Email',
    'Phone Number',
    'Description',
    'Experience',
  ];

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Experience';

  const handleInputChange = (label: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [label]: value,
    }));
  };

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData['Description'])
      errors['Description'] = 'Description is required.';
    if (!formData['Name']) errors['Name'] = 'Name is required.';
    if (!formData['Experience'])
      errors['Experience'] = 'Experience is required.';
    if (!formData['Email']) errors['Email'] = 'Email is required.';

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSubmit = () => {
  //   if (!validateForm()) return;
  //   // submit logic
  //   console.log('Form submitted:', formData);
  // };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const uri = selectedImage;

    if (!uri) {
      Alert.alert('Please select an image.');
      return;
    }
    setLoading(true);

    const fileName = uri.split('/').pop() || 'profile.jpg';
    const fileType = fileName.split('.').pop();

    const form = new FormData();
    form.append('first_name', formData['Name'] || '');
    form.append('last_name', formData['Last Name'] || '');
    form.append('phone_number', formData['Phone Number'] || '');
    console.log('Phone Number:', formData['Phone Number']);
  form.append('user_job_types', selectedJobs); // ✅ Key line
    // console.log(form.append('phone_number', Number(formData['Phone Number'] || 0)));
    form.append('profile_picture', {
      uri: selectedImage,
      name: fileName || `photo.jpg`, // must not be undefined
      type: `image/${fileType || 'jpg'}`, // should be like image/jpg or image/jpeg
    });

    try {
      const response = await fetch('https://buildio.co.nz/api/users/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT manually set Content-Type for FormData in fetch — let RN handle it
        },
        body: form,
      });

      const result = await response.json();
      setLoading(false);
      navigation.navigate('AccountScreen');

      if (response.ok) {
        Alert.alert('Profile updated successfully!');
        navigation.navigate('AccountScreen');
      } else {
        Alert.alert(`Failed to update: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed. Try again.');
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
    }, []),
  );

  const removeImage = () => {
    setSelectedImage(null);
  };

  {
    loading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#6264A7" />
        <Text style={{color: '#6264A7', marginTop: 10}}>
          Fetching location...
        </Text>
      </View>
    );
  }
  return (
    <>
      <TopBar />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
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
                <TextInput
                  style={[
                    styles.input,
                    multiline && styles.textArea,
                    errors[label] && styles.inputError, // <-- error border if error exists
                  ]}
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  placeholderTextColor="#888"
                  multiline={multiline}
                  numberOfLines={multiline ? 4 : 1}
                  textAlignVertical={multiline ? 'top' : 'center'}
                  onChangeText={text => handleInputChange(label, text)}
                  value={formData[label] || ''}
                />
                {errors[label] && (
                  <Text style={styles.errorText}>{errors[label]}</Text>
                )}
              </View>
            );
          })}

          <CustomJobSelector onSelectionChange={setSelectedJobs} />
          <View style={styles.inputCard}>
            <Text style={styles.label}>Add image</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity
                onPress={handleCamera}
                style={styles.imageButton}>
                <Icon name="camera-alt" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGallery}
                style={styles.imageButton}>
                <Icon name="photo-library" size={22} color="white" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={{
                  width: '100%',
                  height: 200,
                  marginTop: 10,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Update Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {!keyboardVisible && <BottomTabBar />}
    </>
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
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  leftSection: {
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    position: 'absolute',
    left: '30%',
    transform: [{translateX: -45}],
    top: 24,
  },
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
    marginTop: 10,
  },
  imageButton: {
    backgroundColor: '#6264A7',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#6264A7',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default AddJobScreen;

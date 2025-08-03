import React, {useCallback, useEffect, useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';

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
import ImageCropPicker from 'react-native-image-crop-picker';

const AddJobScreen = ({
  route,
}: {
  route: RouteProp<RootStackParamList, keyof RootStackParamList>;
}) => {
  const userData = (route.params as any)?.userData;
  console.log(userData, 'userdata'); // If you need userData, use: const userData = (route.params as any)?.userData;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<any[]>([]);


  const handleCamera = async () => {
  try {
    const image = await ImageCropPicker.openCamera({
      width: 100,
      height: 100,
      cropping: true,
      mediaType: 'photo',
      includeBase64: false,
    });

    if (image?.path) {
      setSelectedImage(image.path);
    }
  } catch (err: any) {
    if (err?.message !== 'User cancelled image selection') {
      console.error('Camera error:', err);
      Alert.alert('Failed to take photo.');
    }
  }
};
 const handleGallery = async () => {
  try {
    const image = await ImageCropPicker.openPicker({
      width: 100,
      height: 100,
      cropping: true,
      mediaType: 'photo',
      includeBase64: false,
    });

    if (image?.path) {
      setSelectedImage(image.path);
    }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string' && (err as any).message !== 'User cancelled image selection') {
      console.error('Image picker error:', err);
      Alert.alert('Failed to pick image.');
    }
  }
};
  useEffect(() => {
    if (userData?.user_job_types) {
      const jobIds = userData.user_job_types.map(
        (item: {job_type_id: any}) => item.job_type_id,
      );
      setSelectedJobs(jobIds);
    }
  }, [userData]);
  useEffect(() => {
    if (userData) {
      setFormData({
         Name: userData.first_name || '',
        'Last Name': userData.last_name || '',
        'Phone Number': userData.phone_number || '',
        'about': userData.about || '',
        Experience: userData?.experience || '',
        Email: userData.email || '',
        'Job Type': userData.user_job_types?.[0] || '',
      });
      setSelectedImage(userData.profile_picture || null);
    }
  }, [userData]);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fields = [
    'Name',
    'Last Name',
    'Email',
    'Phone Number',
    'about',
    'Experience',
  ];

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Experience';

const handleInputChange = (label: string, value: string) => {
  setFormData(prev => ({
    ...prev,
    [label]: value,
  }));

  setErrors(prevErrors => {
    const newErrors = { ...prevErrors };

    if (label === 'Phone Number') {
      if (/^\d+$/.test(value)) {
        delete newErrors['Phone Number']; // ✅ clear error on valid input
      }
    }

    if (label === 'Name' && value.trim() !== '') {
      delete newErrors['Name'];
    }

    return newErrors;
  });
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

  if (!formData['Name']) {
    errors['Name'] = 'Name is required.';
  }

  const phone = formData['Phone Number'];
 if (!phone) {
  errors['Phone Number'] = 'Phone number is required.';
} else if (!/^\d+$/.test(phone)) {
  errors['Phone Number'] = 'Phone number must contain only digits.';
} 
// else if (phone.length !== 15) {
//   errors['Phone Number'] = 'Phone number must be exactly 15 digits.';
// }
  setErrors(errors);
  return Object.keys(errors).length === 0;
};


  const handleSubmit = async () => {
    if (!validateForm()) return;
    const token = await AsyncStorage.getItem('authToken');
    const uri = selectedImage;
console.log(token, 'token');
    if (!uri) {
      Alert.alert('Please select an image.');
      return;
    }
    setLoading(true);

    const fileName = uri.split('/').pop() || 'profile.jpg';
    const fileType = fileName.split('.').pop();
    // const jobTypesPayload = selectedJobs?.map(id => ({job_type_id: id}));
    // const userJobTypesPayload = await prepareUserJobTypes(selectedJobs);
    // console.log('User Job Types Payload:', selectedJobs);

    const form = new FormData();
    form.append('first_name', formData['Name'] || '');
    form.append('last_name', formData['Last Name'] || '');
    form.append('phone_number', formData['Phone Number'] || '');
    form.append('about', formData['about'] || '');
    form.append('experience', formData['Experience'] || '');
    selectedJobs.forEach(jobId => {
      form.append('user_job_types', jobId);
    });
    form.append('profile_picture', {
      uri: selectedImage,
      name: fileName || `photo.jpg`,
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
        console.error('Update error:', result);
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
    {loading && (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#6264A7" />
    <Text style={{color: '#6264A7', marginTop: 10}}>
      Updating profile...
    </Text>
  </View>
)}
      <TopBar />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            {/* <Icon name="arrow-back" size={24} color="#6264A7" /> */}
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={undefined}
        keyboardVerticalOffset={0}>
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

          <CustomJobSelector
            preselectedIds={userData.user_job_types.map(
              (j: {job_type_id: any}) => j.job_type_id,
            )}
            onSelectionChange={setSelectedJobs}
          />
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
                  width: '30%',
                  height: 100,
                  marginTop: 10,
                  borderRadius: 10,
                }}
                resizeMode="contain"
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
    position: 'absolute',
    left: '20%',
    transform: [{translateX: -45}],
    fontSize: 20,
    fontWeight: '700',
    color: '#6264A7',
    marginBottom: 0,
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

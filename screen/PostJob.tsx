import React, {useCallback, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {RootStackParamList} from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import JobCategoryList from './components/DropDown';
import TopBar from './components/TopBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUserAddresses} from '../utils/addressApi';
import {Picker} from '@react-native-picker/picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import Heading from './components/CommonHeader';
import AddressDropdown from './components/AddressComponent';
import DatePicker from 'react-native-date-picker';



const AddJobScreen = ({route}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {job, updateJob} = route.params || {};
  const fields = ['Description', 'Deadline', 'Budget'];
  const [loading, setLoading] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(
    job?.deadline ? new Date(job.deadline) : new Date(),
  );
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Requirements';

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [jobTypeValue, setJobTypeValue] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null); // To store selected image
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (updateJob && job) {
      setFormData({
        Description: job.description || '',
        Deadline: job.deadline?.split('T')[0] || '', // format: YYYY-MM-DD
        Budget: job.budget?.toString() || '',
      });

      setJobTypeValue(job?.job_type?.id || '');
      setSelectedAddressId(job?.address?.id || '');
      // If images exist (currently none), map their URLs
      if (job.images?.length) {
        const imageUrls = job?.images.map(img => img); // assuming "url" exists
        setImageUris(imageUrls);
      }
    }
  }, [updateJob, job]);

  const fetchAddresses = async () => {
    // setLoading(true);

    try {
      const result = await fetchUserAddresses(); // this should return { success: boolean, data: [...] }

      if (result.success) {
        console.log(result);
        setAddresses(result?.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch addresses');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching addresses');
      console.error('Fetch Address Error:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAddresses();
  }, []);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const handleImageUpload = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.5}, response => {
      if (response.assets && response.assets[0].uri) {
        setImage(response.assets[0].uri); // Set the image URI
      }
    });
  };
  const handleInputChange = (label: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleCamera = async () => {
    const result = await launchCamera({mediaType: 'photo'});
    if (
      !result.didCancel &&
      result.assets &&
      result.assets[0] &&
      result.assets[0].uri
    ) {
      setImageUris(prev => [...prev, result.assets![0].uri!]);
    }
  };

  const handleLaunchGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    if (!result.didCancel && result.assets) {
      const uris = result.assets
        .map(asset => asset.uri)
        .filter((uri): uri is string => typeof uri === 'string');
      setImageUris(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImageUris(prev => prev.filter(uri => uri !== uriToRemove));
  };
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData['Description']?.trim()) {
      errors['Description'] = 'Description is required.';
      errors['Budget'] = 'Budget Required';
      errors['Deadline'] = 'Deadline Required';
    }

    if (!imageUris.length) {
      errors['Images'] = 'Please add at least one image.';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    submitJob();
  };

  const submitJob = async () => {
    const token = await AsyncStorage.getItem('authToken');
    setLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append('description', formData['Description']);
    formDataToSend.append('job_type_id', jobTypeValue); // ✅ match API key
    formDataToSend.append('address_id', selectedAddressId); // ✅ this must be an integer or string of the selected address
    formDataToSend.append(
      'deadline',
      deadlineDate ? deadlineDate.toISOString().split('T')[0] : '',
    );
    formDataToSend.append('budget', formData['Budget']);

    imageUris.forEach((uri, index) => {
      formDataToSend.append('images', {
        uri,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      });
    });
    const url = updateJob
      ? `https://buildio.co.nz/api/jobs/update/${job?.id}`
      : 'https://buildio.co.nz/api/jobs/create';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // No Content-Type because you're sending FormData
        },
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        navigation.navigate('JobsSection');
        setLoading(false);
        // Alert.alert('Success', 'Job created successfully!');
      } else {
        console.log('Server response:', data);
        throw new Error(data?.message || 'Failed to create job');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
      console.error('Error creating job:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setErrors({});
    }, []),
  );

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

  return (
    <>
      <DatePicker
        modal
        open={isDatePickerVisible}
        date={deadlineDate || new Date()}
        mode="date"
        onConfirm={date => {
          setDatePickerVisible(false);
          setDeadlineDate(date);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6264A7" />
          <Text style={{color: '#6264A7', marginTop: 10}}>
            {updateJob ? 'Updating Job' : 'Posting Job'}
          </Text>
        </View>
      )}
      <TopBar />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            // onPress={() => navigation.goBack('')}
          >
            {/* <Icon name="arrow-back" size={24} color="#6264A7" /> */}
          </TouchableOpacity>
        </View>
        <Heading>{updateJob ? 'Update Job' : 'Post Job'}</Heading>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1}}
        extraScrollHeight={40}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}>
        <View style={{flex: 1}}>
          <View style={styles.container}>
            <JobCategoryList value={jobTypeValue} onChange={setJobTypeValue} />
            {fields.map((label, index) => {
              const multiline = isMultiline(label);
              const isError = !!errors[label];
              const isLast = index === fields.length - 1;

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
                  )}

                  {label === 'Deadline' ? (
                    <TouchableOpacity
                      style={[styles.input, isError && styles.inputError]}
                      onPress={() => setDatePickerVisible(true)}>
                      <Text style={{color: deadlineDate ? '#000' : '#888'}}>
                        {deadlineDate
                          ? deadlineDate.toDateString()
                          : 'Select date'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      ref={ref => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.input,
                        multiline && styles.textArea,
                        isError && styles.inputError,
                      ]}
                      placeholder="Type..."
                      placeholderTextColor="#888"
                      multiline={multiline}
                      numberOfLines={multiline ? 4 : 1}
                      textAlignVertical={multiline ? 'top' : 'center'}
                      value={formData[label] || ''}
                      onChangeText={text => handleInputChange(label, text)}
                      returnKeyType={isLast ? 'done' : 'next'}
                      blurOnSubmit={multiline}
                      onSubmitEditing={() => {
                        if (!multiline && !isLast) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }}
                    />
                  )}

                  {isError && (
                    <Text style={styles.errorText}>{errors[label]}</Text>
                  )}
                </View>
              );
            })}

            {/* <View style={styles.inputCard}> */}
            {/* <Text style={styles.label}>Select Address</Text>
              <View style={styles.dropdownWrapper}>
                <Picker
                  selectedValue={selectedAddressId}
                  onValueChange={value => setSelectedAddressId(value)}
                  style={styles.picker}>
                  <Picker.Item label="Select an address" value={null} />
                  {addresses.map(addr => (
                    <Picker.Item
                      key={addr.id}
                      label={`${addr.label} (${addr.building})`}
                      value={addr.id.toString()} // or just addr.id if using number
                    />
                  ))}
                </Picker>
              </View> */}
            <AddressDropdown
              value={selectedAddressId} // current selected address id
              onChange={setSelectedAddressId} // updates state when user picks
            />
            {/* </View> */}

            <View style={styles.inputCard}>
              <Text style={styles.label}>Add image</Text>
              <View style={styles.imageRow}>
                <TouchableOpacity
                  onPress={handleCamera}
                  style={styles.imageButton}>
                  <Icon name="camera-alt" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLaunchGallery}
                  style={styles.imageButton}>
                  <Icon name="photo-library" size={22} color="white" />
                </TouchableOpacity>
              </View>
              {/* Error message for images */}
              {errors['Images'] && (
                <Text style={{color: 'red', marginTop: 5}}>
                  {errors['Images']}
                </Text>
              )}

              {imageUris?.length > 0 && (
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}>
                  {imageUris?.map((uri, index) => (
                    <View key={index} style={{marginBottom: 10}}>
                      <Image
                        source={{uri}}
                        style={{
                          width: 100, // fixed width
                          height: 100,
                          borderRadius: 10,
                        }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(uri)}
                        style={styles.removeButton}>
                        <Icon name="close" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitText}>
                {' '}
                {updateJob ? 'Update Job' : 'Post Job'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {!keyboardVisible && <BottomTabBar />}
    </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
  container: {
    paddingBottom: 140,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '32%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#6264A7',
    borderRadius: 12,
    padding: 2,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FF4D4F',
  },
  inputCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
  },

  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  imageButton: {
    backgroundColor: '#6264A7',
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
  submitButton: {
    backgroundColor: '#6264A7',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
  },
});

export default AddJobScreen;

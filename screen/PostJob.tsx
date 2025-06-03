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

const AddJobScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fields = [
    'Description',
    'Requirements',
    'Job location',
    'Job position',
    'Job Status',
    'Deadline',
    'Budget',
  ];

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Requirements';

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [jobTypeValue, setJobTypeValue] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null); // To store selected image
  const [imageUris, setImageUris] = useState<string[]>([]);

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
    if (!formData['Description'])
      errors['Description'] = 'Description is required.';
    if (!formData['Job position'])
      errors['Job position'] = 'Job position is required.';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      jobType: jobTypeValue,
    };

    Alert.alert('Sending data: ' + JSON.stringify(payload, null, 2));
    submitJob(payload);
  };

  const submitJob = async (payload: Record<string, any>) => {
    try {
      const response = await fetch('https://example.com/api/jobs', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Job posted successfully', JSON.stringify(data, null, 2));
      } else {
        throw new Error('Failed to post job');
      }
    } catch (error: any) {
      Alert.alert('Error: ' + error.message);
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
      <TopBar />
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1}}
        extraScrollHeight={60}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}>
        <View style={{flex: 1}}>
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#6264A7" />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Post a Job</Text>
          </View>

          <View style={styles.container}>
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
                  {isError && (
                    <Text style={styles.errorText}>{errors[label]}</Text>
                  )}
                </View>
              );
            })}

            <JobCategoryList value={jobTypeValue} onChange={setJobTypeValue} />

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

              {imageUris.length > 0 && (
                <View style={{marginTop: 10}}>
                  {imageUris.map((uri, index) => (
                    <View key={index} style={{marginBottom: 10}}>
                      <Image
                        source={{uri}}
                        style={{
                          width: '100%',
                          height: 200,
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
              <Text style={styles.submitText}>Post Job</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    position: 'absolute',
    left: '30%',
    transform: [{translateX: -45}],
    top: 24,
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
});

export default AddJobScreen;

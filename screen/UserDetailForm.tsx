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

const AddJobScreen = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fields = [
    'Name',
    'Email',
    'Phone Number',
    'Job Type',
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

  const handleSubmit = () => {
    if (!validateForm()) return;
    // submit logic
    console.log('Form submitted:', formData);
  };

  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
    }, []),
  );

  const removeImage = () => {
    setSelectedImage(null);
  };

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
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

          <CustomJobSelector />

          <View style={styles.inputCard}>
            <Text style={styles.label}>Add image</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity
                onPress={handleCamera}
                style={styles.imageButton}
              >
                <Icon name="camera-alt" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGallery}
                style={styles.imageButton}
              >
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
});

export default AddJobScreen;

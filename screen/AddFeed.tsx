import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Keyboard,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Icon} from 'react-native-elements';
import TopBar from './components/TopBar';
import BottomTabBar from './components/BottomNavigaionBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Heading from './components/CommonHeader';
import CustomModal from './components/CustomModal';
type RouteParams = {
  updateFeed?: boolean;
  item?: any;
};
const AddPostScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {updateFeed, item} = (route?.params as RouteParams) ?? {};

  const [postTitle, setPostTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{
    postTitle?: string;
    description?: string;
  }>({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [primaryAddress, setPrimaryAddress] = useState('');
  useEffect(() => {
    if (updateFeed && item) {
      // Pre-fill form fields
      setPostTitle(item?.title || '');
      setDescription(item?.description || '');

      // Pre-fill images (if API returns URLs)
      if (item?.images && Array.isArray(item.images)) {
        setImageUris(item.images.map((img: {url: any}) => img)); // adjust if key name is different
      }
    }
  }, [updateFeed, item]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    buttonText: 'OK',
    onClose: () => setModalVisible(false),
  });

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const handlePost = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
 const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to like posts.');
        return;
      }      const formData = new FormData();
      formData.append('title', postTitle);
      formData.append('description', description);

      imageUris.forEach((uri, index) => {
        // Only append new images (local ones, not already hosted)
        if (uri && typeof uri === 'string' && !uri.startsWith('http')) {
          const fileName = uri.split('/').pop() || `image_${index}.jpg`;
          formData.append('images', {
            uri,
            type: 'image/jpeg',
            name: fileName,
          } as any);
        }
      });

      let url = `https://buildio.co.nz/api/posts/create`;
      if (updateFeed && item?.id) {
        url = `https://buildio.co.nz/api/posts/update/${item.id}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result?.message || 'Request failed');
      }

      showModal(
        'Success',
        updateFeed
          ? 'Your post has been updated successfully!'
          : 'Your post has been created successfully!',
        'OK',
        () => {
          setModalVisible(false);
          
          navigation.navigate('MyProfile');
        },
      );
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      showModal('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadName = async () => {
      try {
        const first = await AsyncStorage.getItem('firstName');
        const last = await AsyncStorage.getItem('lastName');
        const userString = await AsyncStorage.getItem('user');

        let profilePicture = null;
        let address = null;

        if (userString) {
          const user = JSON.parse(userString); // Parse the string into an object
          profilePicture = user.profile_picture;
          console.log(user, 'user');
        }
        if (userString) {
          const user = JSON.parse(userString);
          address = user?.addresses?.[0]?.map_text;
          setPrimaryAddress(address);
        }
        setProfilePic(profilePicture);
        setFullName(`${first || ''} ${last || ''}`);
      } catch (e) {
        console.error('Error loading name:', e);
      }
    };
    loadName();
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!postTitle.trim()) newErrors.postTitle = 'Post title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    launchCamera({mediaType: 'photo'}, response => {
      if (response.assets) {
        const uris = response.assets.map(a => a.uri!).filter(Boolean);
        setImageUris(prev => [...prev, ...uris]);
      }
    });
  };

  const handleLaunchGallery = () => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 0}, response => {
      if (response.assets) {
        const uris = response.assets.map(a => a.uri!).filter(Boolean);
        setImageUris(prev => [...prev, ...uris]);
      }
    });
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const showModal = (
    title: string,
    message: string,
    buttonText = 'OK',
    onClose?: () => void,
  ) => {
    setModalConfig({
      title,
      message,
      buttonText,
      onClose: onClose || (() => setModalVisible(false)),
    });
    setModalVisible(true);
  };

  // const handlePost = async () => {
  //   if (!validate()) return;

  //   setLoading(true);

  //   try {
  //     const token = await AsyncStorage.getItem('authToken');
  //     const formData = new FormData();
  //     formData.append('title', postTitle);
  //     formData.append('description', description);

  //     imageUris.forEach((uri, index) => {
  //       const fileName = uri.split('/').pop() || `image_${index}.jpg`;
  //       formData.append('images', {
  //         uri,
  //         type: 'image/jpeg',
  //         name: fileName,
  //       } as any);
  //     });

  //     const response = await fetch(`https://buildio.co.nz/api/posts/create`, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       body: formData,
  //     });

  //     const result = await response.json();
  //     console.log('Post API Response:', result);

  //     if (!response.ok) {
  //       throw new Error(result?.message || 'Failed to create post');
  //     }

  //     // Reset form after success
  //     setPostTitle('');
  //     setDescription('');
  //     setImageUris([]);
  //     showModal('Success', 'Your post has been created successfully!', 'OK', () => {
  //       setModalVisible(false);
  //       navigation.goBack();
  //     });

  //   } catch (error: any) {
  //     console.error('❌ Post creation error:', error.message);
  //     showModal('Error', error.message || 'Something went wrong');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  return (
    <>
      <TopBar />
      <View style={styles.wrapper}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Heading>Add Post</Heading>
            </View>

            {/* Profile Info */}
            <View style={styles.profileContainer}>
              <Image
                source={{uri: profilePic || 'https://i.pravatar.cc/100'}}
                style={styles.profileImage}
              />
              <View style={styles.textContainer}>
                {/* <Text style={styles.username}>{fullName}</Text>
                <Text style={styles.location}>{primaryAddress}</Text> */}
              </View>
            </View>

            {/* Post Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Post title</Text>
              <TextInput
                style={[styles.input, errors.postTitle && styles.inputError]}
                placeholder="Write the title of your post here"
                value={postTitle}
                onChangeText={setPostTitle}
              />
              {errors.postTitle && (
                <Text style={styles.errorText}>{errors.postTitle}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="What do you want to talk about?"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>

            {/* Image Preview */}
            {imageUris.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{uri}} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}>
                      <Icon name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Icons */}
            <View style={styles.footerIconsInline}>
              <TouchableOpacity
                style={styles.footerIcon}
                onPress={handleCamera}>
                <Icon name="camera-alt" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.footerIcon}
                onPress={handleLaunchGallery}>
                <Icon name="photo-library" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Post Button */}
            <TouchableOpacity
              style={styles.postButton}
              onPress={handlePost}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* Custom Modal */}
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        buttonText={modalConfig.buttonText}
        onClose={modalConfig.onClose}
      />

      {!keyboardVisible && <BottomTabBar />}
    </>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  header: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '38%',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
  footerIconsInline: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  footerIcon: {
    backgroundColor: '#6264A7',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginVertical: 10,
    justifyContent: 'flex-start',
  },
  imagePreview: {
    width: 200, // Roughly 4 per row with margin
    height: 200,
    margin: 5,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#6264A7',
    borderRadius: 12,
    padding: 2,
  },
  postButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 45,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
});

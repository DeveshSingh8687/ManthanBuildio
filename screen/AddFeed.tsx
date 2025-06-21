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
  Dimensions,
} from 'react-native';
import {Icon} from 'react-native-elements';
import TopBar from './components/TopBar';
import BottomTabBar from './components/BottomNavigaionBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const AddPostScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [postTitle, setPostTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{
    postTitle?: string;
    description?: string;
  }>({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
const [imageUris, setImageUris] = useState<string[]>([]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!postTitle.trim()) newErrors.postTitle = 'Post title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostTitleChange = (text: string) => {
    setPostTitle(text);
    if (text.trim()) {
      setErrors(prevErrors => ({...prevErrors, postTitle: undefined}));
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (text.trim()) {
      setErrors(prevErrors => ({...prevErrors, description: undefined}));
    }
  };

  const onPost = () => {
    if (validate()) {
      setPostTitle('');
      setDescription('');
      setErrors({});
      setImageUris([] );
    }
  };

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
      const newUris = response.assets
        .map(asset => asset.uri)
        .filter(uri => uri !== undefined) as string[];

      setImageUris(prevUris => [...prevUris, ...newUris]);
    }
  });
};


const handleLaunchGallery = () => {
  launchImageLibrary(
    {
      mediaType: 'photo',
      selectionLimit: 0, // 🔥 Allows multiple image selection
    },
    response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('Gallery error:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedUris = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri !== undefined) as string[];

        setImageUris(prevUris => [...prevUris, ...selectedUris]);
      }
    },
  );
};
const removeImage = (indexToRemove: number) => {
  setImageUris(prevUris => prevUris.filter((_, index) => index !== indexToRemove));
};
  return (
    <>
      <TopBar />
      <View style={styles.wrapper}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 100 : 60}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}>
                  <Icon name="arrow-back" size={24} color="#6264A7" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Post</Text>
              </View>
            </View>

            {/* Profile Info */}
            <View style={styles.profileContainer}>
              <Image
                source={{uri: 'https://i.pravatar.cc/100'}}
                style={styles.profileImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.username}>John Smith</Text>
                <Text style={styles.location}>Auckland, New Zealand</Text>
              </View>
            </View>

            {/* Post Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Post title</Text>
              <TextInput
                style={[styles.input, errors.postTitle && styles.inputError]}
                placeholder="Write the title of your post here"
                value={postTitle}
                onChangeText={handlePostTitleChange}
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
                onChangeText={handleDescriptionChange}
                multiline
                numberOfLines={4}
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
          onPress={() => {
            const newUris = [...imageUris];
            newUris.splice(index, 1);
            setImageUris(newUris);
          }}>
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
            <TouchableOpacity style={styles.postButton} onPress={onPost}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* Conditional Bottom Tab */}
      {!keyboardVisible && <BottomTabBar />}
    </>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B4B',
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

export default AddPostScreen;

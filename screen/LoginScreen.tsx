import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import {
  getAuth,
  signInWithCredential,
  FacebookAuthProvider,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {_signInWithGoogle, socialLoginAPI} from './config/auth';
import fireStore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import CustomModal from './components/CustomModal';
import {addDeviceId} from '../utils/fcmToken';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<
    import('@react-native-firebase/auth').FirebaseAuthTypes.User | null
  >(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleAuthStateChanged(
    user: import('@react-native-firebase/auth').FirebaseAuthTypes.User | null,
  ) {
    setUser(user);
    if (initializing) setInitializing(false);
  }
  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);
  // const handleLogin = () => {

  //   fireStore()
  //     .collection('users')
  //     .where('email', '==', email)
  //     .get()
  //     .then(res => {
  //       console.log('re', res);
  //       if (!res.empty) {
  //         const userData = res.docs[0].data();
  //         const userPassword = userData.password;

  //         if (userPassword === password) {
  //           goToNext(userData.firstName, userData.email, res.docs[0].id,userData.uid);
  //         } else {
  //           Alert.alert('Error', 'Incorrect password');
  //         }
  //       } else {
  //         Alert.alert('Error', 'User not found');
  //       }
  //     })
  //     .catch(err => {
  //       console.log('Error fetching user:', err);
  //       Alert.alert('Error', 'Login failed. Please try again.');
  //     });
  // };
  const goToNext = async (name: any, email: any, userId: string, uid: any) => {
    await AsyncStorage.setItem('USERID', userId);
    await AsyncStorage.setItem('UID', uid);
    await AsyncStorage.setItem('NAME', name);
    await AsyncStorage.setItem('EMAIL', email);
    
    // Check if terms are accepted
    const isTermsAccepted = await AsyncStorage.getItem('is_terms_accepted');
    
    if (isTermsAccepted === 'true') {
      navigation.navigate('HomeScreen');
    } else {
      // Navigate to PrivacySecurityScreen if terms not accepted
      navigation.navigate('PrivacySecurity');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setModalMessage('Please enter both email and password');
      setModalVisible(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with:', {email});
      
      // Step 1: Make the fetch request
      console.log('Fetching from: https://buildio.co.nz/api/auth/sign_in');
      const response = await fetch('https://buildio.co.nz/api/auth/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log('✅ Fetch completed. Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Step 2: Parse the response
      console.log('Parsing response JSON...');
      let data;
      try {
        data = await response.json();
        console.log('✅ JSON parsed successfully:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        const textData = await response.text();
        console.error('Response text:', textData);
        throw new Error('Invalid response format from server');
      }

      // Step 3: Handle response based on status
      if (response.status === 200) {
        console.log('✅ Login successful');
        const token = data.data.token;
        const firstName = data.data.user.first_name;
        const lastName = data.data.user.last_name;
        const userId = data.data.user.id;
        const uid = data.data.user.uid || '';
        const isTermsAccepted = data.data.user.is_terms_accepted;
        
        console.log('Saving to AsyncStorage...');
        // Save auth token and user info
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('firstName', firstName || '');
        if (lastName) {
          await AsyncStorage.setItem('lastName', lastName);
        } else {
          await AsyncStorage.removeItem('lastName');
        }
        // Save terms acceptance status
        await AsyncStorage.setItem('is_terms_accepted', isTermsAccepted ? 'true' : 'false');
        await AsyncStorage.setItem('prefs:hasSeenIntro', 'true');
        console.log('✅ AsyncStorage updated');

        // Navigate based on terms acceptance
        console.log('Navigating...');
        await goToNext(
          `${firstName} ${lastName || ''}`,
          email,
          userId.toString(),
          uid.toString(),
        );
      } else if (response.status === 401) {
        console.warn('❌ 401 Unauthorized');
        setModalMessage('Invalid email or password');
        setModalVisible(true);
      } else if (response.status === 404) {
        console.warn('❌ 404 Not Found');
        setModalMessage('User not found. Please sign up first.');
        setModalVisible(true);
      } else {
        console.warn('❌ Unexpected status:', response.status);
        const errorMessage = data.message || 'Login failed. Please try again.';
        setModalMessage(errorMessage);
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('❌ Error caught:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        setModalMessage('Network error. Please check your connection and try again.');
      } else if (error.message.includes('Invalid response format')) {
        setModalMessage('Server returned invalid data. Please try again.');
      } else {
        setModalMessage(error.message || 'An error occurred. Please try again.');
      }
      setModalVisible(true);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  async function onGoogleButtonPress() {
    // const fcmToken = await AsyncStorage.getItem('fcmToken');
    // await addDeviceId(fcmToken);
    _signInWithGoogle(navigation);
  }

  async function onFacebookButtonPress() {
    // const fcmToken = await AsyncStorage.getItem('fcmToken');
    // await addDeviceId(fcmToken);
    console.log('Facebook button pressed');
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      // console.log('Login result:', result);

      if (result.isCancelled) {
        // navigation.navigate('HomeScreen');

        throw 'User cancelled the login process';
      }

      // Once signed in, get the users AccessToken
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw 'Something went wrong obtaining access token';
      }

      // Create a Firebase credential with the AccessToken
      const facebookCredential = FacebookAuthProvider.credential(
        data.accessToken,
      );
      const firebaseUserCredential = await getAuth().signInWithCredential(facebookCredential);
      const user = firebaseUserCredential.user;
      console.log('Facebook credential:', facebookCredential);

      // Call our backend API to authenticate/register user
      try {
        const apiResponse = await socialLoginAPI({
          email: user.email,
          first_name: user.displayName || '',
          social_media_provider: 'Facebook',
          provider_token: user.uid,
        });

        // Check if terms are accepted from API response
        const isTermsAccepted = apiResponse.data.user?.is_terms_accepted;
        
        if (isTermsAccepted) {
          navigation.navigate('HomeScreen');
        } else {
          // Navigate to PrivacySecurityScreen if terms not accepted
          navigation.navigate('PrivacySecurity');
        }
      } catch (apiError) {
        console.error('API call error during Facebook login:', apiError);
        Alert.alert('Error', 'Failed to complete login. Please try again.');
      }

      // Sign-in the user with the credential
      return signInWithCredential(getAuth(), facebookCredential);
    } catch (error) {
      console.error('Facebook login error:', error);
      Alert.alert('Error', error || 'Facebook login failed. Please try again.');
    }
  }

  return (
    <>
      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
        title={''}
        buttonText={'Try Again'}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={undefined}
        keyboardVerticalOffset={0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled">
            {/* Back Arrow */}
            {/* <TouchableOpacity
      style={styles.backButton}
      onPress={() => {
        navigation.goBack();
      }}>
      <Icon name="arrow-back" size={28} color="#333" />
    </TouchableOpacity> */}
            <Text style={styles.title}>Login Your Account</Text>
            {/* Email Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter Your Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {/* Password Input with Toggle */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, {opacity: isLoading ? 0.6 : 1}]} 
              onPress={handleSignIn}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            {/* Remember Me + Forgot Password */}
            <View style={styles.optionsContainer}>
              <View style={styles.checkboxContainer}>
                {/* You can use CheckBox from @react-native-community/checkbox */}
                {/* <CheckBox value={rememberMe} onValueChange={setRememberMe} /> */}
                <Text style={styles.checkboxLabel}></Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}> Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            {/* Sign up */}
            <View style={styles.signUpContainer}>
              <Text style={{color: '#999'}}>Create New Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign up</Text>
              </TouchableOpacity>
            </View>
            {/* Divider */}
            <Text style={styles.orText}>OR</Text>
            {/* Social Login Buttons */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onGoogleButtonPress}>
              <Icon
                name="google"
                type="font-awesome"
                size={20}
                color="#EA4335"
                containerStyle={styles.socialIcon}
              />
              <Text style={styles.socialText}>Sign up with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onFacebookButtonPress}>
              <Icon
                name="facebook"
                type="font-awesome"
                size={20}
                color="#3b5998"
                containerStyle={styles.socialIcon}
              />
              <Text style={styles.socialText}>Sign up with Facebook</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingHorizontal: 24,
    paddingTop: 19,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#6264A7',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  forgotText: {
    fontSize: 14,
    color: '#6264A7',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpText: {
    fontWeight: 'bold',
    color: '#6264A7',
  },
  orText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#aaa',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialText: {
    fontSize: 16,
    color: '#333',
  },
});

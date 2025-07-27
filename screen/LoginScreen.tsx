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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/Navigation';
import {
  getAuth,
  signInWithCredential,
  FacebookAuthProvider,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {_signInWithGoogle} from './config/auth';
import fireStore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import CustomModal from './components/CustomModal';

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
    navigation.navigate('HomeScreen');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setModalMessage('Please enter both email and password');
      setModalVisible(true);
      return;
    }
    try {
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

      if (response.status === 200) {
        const data = await response.json();
        const token = data.data.token;
        const firstName = data.data.user.first_name;
        const lastName = data.data.user.last_name;
        const userId = data.data.user.id; // assuming `id` is user ID
        const uid = data.data.user.uid || ''; // fallback if missing

        // Save auth token and user name separately
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('firstName', firstName || '');
        if (lastName) {
          await AsyncStorage.setItem('lastName', lastName);
        } else {
          await AsyncStorage.removeItem('lastName');
        }

        // ✅ Reuse helper to store info and navigate
        await goToNext(
          `${firstName} ${lastName || ''}`,
          email,
          userId.toString(),
          uid.toString(),
        );
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setModalMessage('Something went wrong. Please try again.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error:', error);
      // Alert.alert('Error', JSON.stringify(error));
    }
  };

  async function onGoogleButtonPress() {
    _signInWithGoogle(navigation);
  }

  async function onFacebookButtonPress() {
    console.log('Facebook button pressed');
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
    navigation.navigate('HomeScreen');

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = FacebookAuthProvider.credential(
      data.accessToken,
    );
    await getAuth().signInWithCredential(facebookCredential);
    console.log('Facebook credential:', facebookCredential);

    // Sign-in the user with the credential
    return signInWithCredential(getAuth(), facebookCredential);
  }

  return (
    <><CustomModal
      visible={modalVisible}
      message={modalMessage}
      onClose={() => setModalVisible(false)} title={''} buttonText={'Try Again'} /><KeyboardAvoidingView
        style={{ flex: 1 }}
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
              onChangeText={setEmail} />
            {/* Password Input with Toggle */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword} />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#999" />
              </TouchableOpacity>
            </View>
            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
              <Text style={styles.loginButtonText}>Login</Text>
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
              <Text style={{ color: '#999' }}>Create New Account? </Text>
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
              <FontAwesome
                name="google"
                size={20}
                color="#EA4335"
                style={styles.socialIcon} />
              <Text style={styles.socialText}>Sign up with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onFacebookButtonPress}>
              <FontAwesome
                name="facebook"
                size={20}
                color="#3b5998"
                style={styles.socialIcon} />
              <Text style={styles.socialText}>Sign up with Facebook</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView></>
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

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/Navigation';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import fireStore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { _signInWithGoogle, onFacebookButtonPress } from './config/auth';


export default function SignUpScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
    async function onGoogleButtonPress() {
      _signInWithGoogle(navigation);
    }


const registerUser = async () => {
  const { firstName, lastName, email, password } = formData;

  const nameRegex = /^[A-Za-z]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!firstName || !lastName || !email || !password) {
    Alert.alert('Validation Error', 'Please fill all fields');
    return;
  }

  if (!nameRegex.test(firstName)) {
    Alert.alert('Validation Error', 'First name must be at least 2 letters with no numbers or symbols.');
    return;
  }

  if (!nameRegex.test(lastName)) {
    Alert.alert('Validation Error', 'Last name must be at least 2 letters with no numbers or symbols.');
    return;
  }

  if (!emailRegex.test(email)) {
    Alert.alert('Validation Error', 'Please enter a valid email address.');
    return;
  }

  if (!passwordRegex.test(password)) {
    Alert.alert(
      'Validation Error',
      'Password must be at least 6 characters long and contain at least one letter and one number.'
    );
    return;
  }

  const userId = uuid.v4() as string;

    try {
    const response = await fetch('http://4.245.1.145:4000/api/auth/sign_up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('User signed up successfully:', data);
      Alert.alert('Success', 'User signed up successfully!');
      // Optionally navigate or save token
    } else {
      const errorData = await response.json();
      console.error('Sign-up failed:', errorData);
      Alert.alert('Sign Up Failed', errorData.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'Network error or server not reachable');
  }
  // try {
  //   await fireStore().collection('users').doc(userId).set({
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //     createdAt: fireStore.FieldValue.serverTimestamp(),
  //   });
  //   console.log('User added!');
  //   navigation.navigate('Login');
  // } catch (error) {
  //   console.error('Error adding user: ', error);
  //   Alert.alert('Error', 'Failed to register user. Try again later.');
  // }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Sign up</Text>

          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!passwordVisible}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <TouchableOpacity onPress={() => setPasswordVisible((prev) => !prev)}>
              <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={registerUser}>
            <Text style={styles.loginButtonText}>SignUp</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
                    <Text style={{color: '#999'}}>Create New Account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.signUpText}>Login</Text>
                    </TouchableOpacity>
                  </View>
                    <TouchableOpacity
                              style={styles.socialButton}
                              onPress={onGoogleButtonPress}>
                              <FontAwesome
                                name="google"
                                size={20}
                                color="#EA4335"
                                style={styles.socialIcon}
                              />
                              <Text style={styles.socialText}>Sign up with Google</Text>
                            </TouchableOpacity>
                                  <TouchableOpacity
                                        style={styles.socialButton}
                                        onPress={() => onFacebookButtonPress(navigation)}>
                                        <FontAwesome
                                          name="facebook"
                                          size={20}
                                          color="#3b5998"
                                          style={styles.socialIcon}
                                        />
                                        <Text style={styles.socialText}>Sign up with Facebook</Text>
                                      </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 30,
    paddingHorizontal: 15,
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
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
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

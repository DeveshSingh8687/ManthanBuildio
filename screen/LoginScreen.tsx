import React, { useState } from 'react';
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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation'




export default function LoginScreen() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    if (!email || !password) {
      // setSnackMessage('Please enter both email and password');
      // setSnackVisible(true);
      Alert.alert('enter email', );
      return;
    }

    if (email === mockEmail && password === mockPassword) {
      Alert.alert('Success', 'Login successful!');
      navigation.navigate('HomeScreen'); // No more type errors
    } else {
      Alert.alert('false');
    }
    // setSnackVisible(true);
  };



  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >      {/* Back Arrow */}
     <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
          <Icon name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>

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
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Remember Me + Forgot Password */}
      <View style={styles.optionsContainer}>
        <View style={styles.checkboxContainer}>
          {/* You can use CheckBox from @react-native-community/checkbox */}
          {/* <CheckBox value={rememberMe} onValueChange={setRememberMe} /> */}
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </View>
         <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
             <Text style={styles.forgotText}> Forgot Password?</Text>
         </TouchableOpacity>
      </View>

      {/* Sign up */}
      <View style={styles.signUpContainer}>
        <Text style={{ color: '#999' }}>Create New Account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobDetailS')}>
          <Text style={styles.signUpText}>Sign ria</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Text style={styles.orText}>OR</Text>

      {/* Social Login Buttons */}
      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="google" size={20} color="#EA4335" style={styles.socialIcon} />
        <Text style={styles.socialText}>Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="facebook" size={20} color="#3b5998" style={styles.socialIcon} />
        <Text style={styles.socialText}>Sign up with Facebook</Text>
      </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    
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

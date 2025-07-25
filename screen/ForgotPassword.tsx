import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/core';
import { RootStackParamList } from '../navigation/Navigation';

const ForgetPassword = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://buildio.co.nz/api/auth/forgot_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok && result.status) {
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Failed', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error sending reset password request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Forget Password</Text>

          <TextInput
            placeholder="Enter Your Email"
            placeholderTextColor="#b0b0b0"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.infoText}>
            To reset your password, you need your email that can be authenticated
          </Text>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.resetButtonText}>
              {loading ? 'Sending...' : 'Reset password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Back to login</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e1e5d',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    marginTop: 70,
  },
  infoText: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 55,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  resetButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 160,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    backgroundColor: '#9e9e9e',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
});

import React, {useState} from 'react';
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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NavigationProp, useNavigation} from '@react-navigation/core';
export type RootStackParamList = {
  ForgetPassword: undefined;
  Login: undefined;
  OtpVerification: {email: string}; // ✅ Add this
  // Add other routes if needed
};

const ForgetPassword = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        'https://buildio.co.nz/api/auth/forgot_password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email: email.trim()}),
        },
      );

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok && result.status) {
        navigation.navigate('OtpVerification', {email: email.trim()});
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
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          {!otpModalVisible && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
          )}

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
            To reset your password, you need your email that can be
            authenticated
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={loading}>
            <Text style={styles.resetButtonText}>
              {loading ? 'Sending...' : 'Send Otp'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Back to login</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* OTP Modal */}
      {/* <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter OTP</Text>

            <TextInput
              placeholder="OTP"
              placeholderTextColor="#999"
              style={styles.modalInput}
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOtpModalVisible(false)}
              style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </KeyboardAvoidingView>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 70, // Adjusted to move content ~50px upward
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
    marginTop: 30,
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
    width: '100%',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 120,
    marginTop: 10,
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

  // OTP Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e1e5d',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 10,
  },
  closeModalText: {
    color: '#6264A7',
    fontWeight: '600',
  },
});

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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';
import CustomModal from '../components/CustomModal';

export default function ResetPassword() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handlePasswordReset = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('New and confirm passwords do not match');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch('https://buildio.co.nz/api/users/update_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const result = await response.json();
      console.log('Reset Password Response:', result);

      if (response.ok && result.status) {
        setSuccessModalVisible(true);
      } else {
        Alert.alert(result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('An error occurred while updating password');
    }
  };

  return (
    <>
      <TopBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                {/* <Icon name="arrow-back" size={24} color="#6264A7" /> */}
              </TouchableOpacity>
              <Text style={styles.heading}>Reset Password</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Old Password"
              placeholderTextColor="#999"
              secureTextEntry={!passwordVisible}
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry={!passwordVisible}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handlePasswordReset}>
              <Text style={styles.loginButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <BottomTabBar />

      <CustomModal
        visible={successModalVisible}
        title="Success"
        message="Password updated successfully!"
        buttonText="Go Back"
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.goBack();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  heading: {
 marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '32%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 5,
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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';

import { StackNavigationProp } from '@react-navigation/stack';

type ManageAddressScreenProps = {
  navigation: StackNavigationProp<any>;
};

const ManageAddressScreen = ({ navigation }: ManageAddressScreenProps) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const handleUseCurrentLocation = () => {
    setLoadingLocation(true);

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoadingLocation(false);
      },
      error => {
        let message = 'Unable to get location.';
        if (error.code === 1) {
          message = 'Please enable location permissions in settings.';
        } else if (error.code === 2) {
          message = 'Location unavailable. Please turn on GPS.';
        } else if (error.code === 3) {
          message = 'Location request timed out.';
        }
        Alert.alert('Error', message);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Auth Error', 'User not authenticated.');
      return;
    }

    try {
      const response = await fetch('http://4.245.1.145:4000/api/users/add_address', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressForm),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Address added successfully');
        setShowAddressModal(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to add address');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Unable to connect to server.');
    }
  };

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Address</Text>
        </View>

        <TouchableOpacity style={styles.addRow} onPress={() => setShowAddressModal(true)}>
          <Icon name="add-circle-outline" size={20} color="#6264A7" />
          <Text style={styles.addText}>Add another address</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
      </SafeAreaView>

      <Modal visible={showAddressModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Icon name="expand-more" size={24} color="#6264A7" style={styles.modalCloseIcon} />
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 400 }}>
              <TextInput
                placeholder="Address Line 1"
                value={addressForm.address_line1}
                onChangeText={text => handleInputChange('address_line1', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="Address Line 2"
                value={addressForm.address_line2}
                onChangeText={text => handleInputChange('address_line2', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="City"
                value={addressForm.city}
                onChangeText={text => handleInputChange('city', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="State"
                value={addressForm.state}
                onChangeText={text => handleInputChange('state', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="Postal Code"
                value={addressForm.postal_code}
                onChangeText={text => handleInputChange('postal_code', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="Country"
                value={addressForm.country}
                onChangeText={text => handleInputChange('country', text)}
                style={styles.input}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>

            {loadingLocation && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#6264A7" />
                <Text style={{ color: '#6264A7', marginTop: 10 }}>Fetching location...</Text>
              </View>
            )}

            <TouchableOpacity style={styles.locationRow} onPress={handleUseCurrentLocation}>
              <Icon name="my-location" size={20} color="#6264A7" />
              <Text style={styles.locationText}>Use current location</Text>
            </TouchableOpacity>

            {location && (
              <View style={{ height: 200, marginTop: 15 }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation>
                  <Marker coordinate={location} />
                </MapView>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <BottomTabBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  backButton: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: '600', color: '#333' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addText: { marginLeft: 10, color: '#6264A7', fontSize: 16 },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  modalCloseIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  locationText: {
    marginLeft: 8,
    color: '#6264A7',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default ManageAddressScreen;

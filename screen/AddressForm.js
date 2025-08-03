import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, {Marker} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute, useNavigation} from '@react-navigation/native';
import Navigation from '../navigation/Navigation';
import TopBar from './components/TopBar';
import BottomTabBar from './components/BottomNavigaionBar';
import CustomModal from './components/CustomModal';

const AddressForm = () => {
  const route = useRoute();
  const {mode, address} = route.params || {};

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({title: '', message: ''});

  const [addressForm, setAddressForm] = useState({
    label: '',
    apartment: '',
    building: '',
    notes: '',
    latitude: null,
    longitude: null,
  });

  const handleUseCurrentLocation = () => {
    setLoadingLocation(true);
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});

        setAddressForm(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

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
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleInputChange = (field, value) => {
    setAddressForm(prev => ({...prev, [field]: value}));
  };
  React.useEffect(() => {
    if (address) {
      setAddressForm({
        label: address.label || '',
        apartment: address.apartment || '',
        building: address.building || '',
        notes: address.notes || '',
        latitude: parseFloat(address.lat) || null,
        longitude: parseFloat(address.long) || null,
      });

      setLocation({
        latitude: parseFloat(address.lat),
        longitude: parseFloat(address.long),
      });
    }
  }, [address]);
  const handleSaveAddress = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Auth Error', 'User not authenticated.');
      return;
    }
    setLoading(true);
    const payload = {
      ...addressForm,
      label: typeof addressForm.label === 'string' ? addressForm.label : '',
      lat: location?.latitude ? String(location.latitude) : '',
      long: location?.longitude ? String(location.longitude) : '',
    };

    const url =
      mode === 'update'
        ? `https://buildio.co.nz/api/addresses/update_address/${address.id}`
        : 'https://buildio.co.nz/api/addresses/add_address';

    const method = 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setLoading(false);
        setModalContent({
          title: 'Success',
          message: mode === 'update' ? 'Address updated' : 'Address added',
        });
        setModalVisible(true);
        navigation.navigate('ManageAddressScreen');
      } else {
        setModalContent({
          title: 'Error',
          message: result.message || 'Failed to save address',
        });
        setModalVisible(true);
        setLoading(false);
      }
    } catch (error) {
      setModalContent({
        title: 'Network Error',
        message: 'Unable to connect to server.',
      });
      setModalVisible(true);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />
      <KeyboardAvoidingView
        style={{flex: 1}}
        extraScrollHeight={40}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingHorizontal: 10}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}>
          {loadingLocation && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6264A7" />
              <Text style={{color: '#6264A7', marginTop: 10}}>
                Fetching location...
              </Text>
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6264A7" />
              <Text style={{color: '#6264A7', marginTop: 10}}>
                Saving address...
              </Text>
            </View>
          )}

          <View style={styles.formWrapper}>
            <Text style={styles.headerText}>
              {mode === 'update' ? 'Update Address' : 'Add New Address'}
            </Text>

            <TextInput
              placeholder="Label (e.g., Home, Work)"
              value={addressForm.label}
              onChangeText={text => handleInputChange('label', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Apartment, suite, etc."
              value={addressForm.apartment}
              onChangeText={text => handleInputChange('apartment', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Building Name"
              value={addressForm.building}
              onChangeText={text => handleInputChange('building', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Notes (optional)"
              value={addressForm.notes}
              onChangeText={text => handleInputChange('notes', text)}
              style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
              multiline
              numberOfLines={4}
            />

            <View style={{zIndex: 10}}>
              <GooglePlacesAutocomplete
                placeholder="Search for address"
                onPress={(data, details = null) => {
                  const address =
                    details?.formatted_address || data.description;
                  handleInputChange('address_line1', address);
                }}
                onFail={() =>
                  Alert.alert('Error', 'Failed to fetch address details.')
                }
                predefinedPlaces={[]}
                query={{
                  key: 'AIzaSyDxGuLadB9uVwv8uecnQh6B5GCddKeglys',
                  language: 'en',
                }}
                textInputProps={{
                  onFocus: () => {
                    console.log('GooglePlacesAutocomplete input focused');
                  }
                }}
                fetchDetails
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 10,
                  },
                }}
                enablePoweredByContainer={true}
              />
            </View>
            <TouchableOpacity
              style={styles.locationRow}
              onPress={handleUseCurrentLocation}>
              <Icon
                name="my-location"
                size={20}
                color="#6264A7"
                style={{marginBottom: 20}}
              />
              <Text style={styles.locationText}>Use current location</Text>
            </TouchableOpacity>
            {location && (
              <View style={styles.mapContainer}>
                <MapView
                  style={{flex: 1}}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation
                  scrollEnabled={false}
                  zoomEnabled={false}>
                  <Marker coordinate={location} />
                </MapView>
              </View>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>
                {mode === 'update' ? 'Update Address' : 'Save Address'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTabBar />
      <CustomModal
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="OK"
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formWrapper: {
    paddingTop: 20, // adds space below TopBar
    paddingBottom: 100, // ensures content is visible above BottomTabBar
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20, // space above BottomTabBar
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    marginLeft: 8,
    color: '#6264A7',
    fontSize: 16,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6264A7',
    marginBottom: 30,
    left: '2%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default AddressForm;

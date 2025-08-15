import React, {useState, useEffect, useRef} from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const AddressForm = () => {
  const route = useRoute();
  const {mode, address} = route.params || {};
  const scrollViewRef = useRef(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({title: '', message: ''});
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [addressForm, setAddressForm] = useState({
    map_Text: '',
    label: '',
    apartment: '',
    building: '',
    notes: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

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
          map_Text: address || '',
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

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const handleInputChange = (field, value) => {
    setAddressForm(prev => ({...prev, [field]: value}));
  };
  React.useEffect(() => {
    if (address) {
      setAddressForm({
        map_Text: address.map_Text,
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
      map_Text: typeof addressForm.map_Text === 'string' ? addressForm.map_Text : '',
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
  //  <GooglePlacesAutocomplete
  //     placeholder='Search'
  //     onPress={(data, details = null) => {
  //       // 'details' is provided when fetchDetails = true
  //       console.log(data, details);
  //     }}
  //     query={{
  //       key: 'AIzaSyA8g2VOaq9H39KmULPYywF9WDDIXAuGBrw',
  //       language: 'en',
  //     }}
  //     currentLocation={true}
  //     currentLocationLabel='Current location'
  //   />
  const apiKey = 'AIzaSyA8g2VOaq9H39KmULPYywF9WDDIXAuGBrw';
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TopBar />
        <Text style={styles.headerText}>
          {mode === 'update' ? 'Update Address' : 'Add New Address'}
        </Text>
        <KeyboardAwareScrollView
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
              <GooglePlacesAutocomplete
                placeholder="Where to?"
                fetchDetails={true}
                debounce={200}
                enablePoweredByContainer={true}
                nearbyPlacesAPI="GooglePlacesSearch"
                minLength={2}
                timeout={10000}
                keyboardShouldPersistTaps="handled"
                listViewDisplayed="auto"
                keepResultsAfterBlur={false}
                currentLocation={false}
                currentLocationLabel="Current location"
                enableHighAccuracyLocation={true}
                onFail={() => console.warn('Google Places Autocomplete failed')}
                onNotFound={() => console.log('No results found')}
                onTimeout={() => console.warn('Google Places request timeout')}
                onPress={(data, details = null) => {
                  const address =
                    details?.formatted_address || data.description;

                  const latitude = details?.geometry?.location?.lat;
                  const longitude = details?.geometry?.location?.lng;

                  if (latitude && longitude) {
                    const coords = {latitude, longitude};

                    setLocation(coords);

                    setAddressForm(prev => ({
                      ...prev,
                      map_Text: address,   // Optional: You could use this or keep it separate
                      latitude,
                      longitude,
                    }));
                  }

                  handleInputChange('address_line1', address); // Optional if you want to store address line
                }}
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                styles={{
                  textInputContainer: {
                    zIndex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    // marginHorizontal: 20,
                    position: 'relative',
                    shadowColor: '#d4d4d4',
                  },
                  textInput: {
                    height: 48,
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    marginBottom: 12,
                    backgroundColor: '#fff',
                  },
                  listView: {
                    backgroundColor: 'white',
                    position: 'relative',
                    top: 0,
                    width: '100%',
                    zIndex: 99,
                    borderRadius: 10,
                    shadowColor: '#d4d4d4',
                  },
                }}
                query={{
                  key: apiKey,
                  language: 'en',
                  types: 'geocode',
                }}
                // onPress={(data, details = null) => {
                //   console.log('Selected data:', data);
                //   console.log('Details:', details);

                //   if (!details?.geometry?.location) {
                //     console.warn('Missing geometry details!');
                //     return;
                //   }

                //   handlePress({
                //     latitude: details.geometry.location.lat,
                //     longitude: details.geometry.location.lng,
                //     address: data.description,
                //   });
                // }}
                GooglePlacesSearchQuery={{
                  rankby: 'distance',
                  radius: 1000, // <-- REQUIRED if using 'distance'
                }}
                // renderLeftButton={() => (
                //     <View className="justify-center items-center w-6 h-6">
                //         <Image source={icon || icons.search} className="w-6 h-6" resizeMode="contain" />
                //     </View>
                // )}

                textInputProps={{
                  placeholderTextColor: 'gray',
                  onFocus: () => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: 300,
                        animated: true,
                      });
                    }, 100);
                  },
                }}
              />

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
                    region={{
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
              <TextInput
                placeholder="Your Current Address"
                value={addressForm.map_Text}
                onChangeText={text => handleInputChange('map_Text', text)}
                style={styles.input}
              />
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
                placeholder="Notes"
                value={addressForm.notes}
                onChangeText={text => handleInputChange('notes', text)}
                style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}>
                <Text style={styles.saveButtonText}>
                  {mode === 'update' ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        {!keyboardVisible && <BottomTabBar />}
        <CustomModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="OK"
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formWrapper: {
    // paddingTop: 20, // adds space below TopBar
    paddingBottom: 100, // ensures content is visible above BottomTabBar
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
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

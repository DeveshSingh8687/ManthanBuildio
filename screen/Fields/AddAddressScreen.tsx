import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomTabBar from '../components/BottomNavigaionBar';


// Import Geolocation from community package
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

const ManageAddressScreen: React.FC<Props> = ({navigation}) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleUseCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        Alert.alert(
          'Location fetched',
          `Latitude: ${latitude}\nLongitude: ${longitude}`,
        );
      },
      error => {
        Alert.alert('Error', error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const rows = [
    {label: 'Manage address', onPress: () => setShowAddressModal(true)},
  ];

  const renderRow = (label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.addRow} onPress={onPress} key={label}>
      <Ionicons name="add-circle-outline" size={20} color="#6264A7" />
      <Text style={styles.addText}>Add another address</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6264A7" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage address</Text>
        </View>
        {rows.map(row => renderRow(row.label, row.onPress))}

        <View style={styles.divider} />
      </SafeAreaView>

      {/* Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddressModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close Icon */}
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Icon
                name="chevron-down"
                size={24}
                color="#6264A7"
                style={styles.modalCloseIcon}
              />
            </TouchableOpacity>

            {/* Search bar placeholder */}
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={16}
                color="#7D7D93"
                style={{marginRight: 8}}
              />
              <Text style={styles.searchPlaceholder}>Search address</Text>
            </View>

            {/* Use current location row */}
            <TouchableOpacity
              style={styles.locationRow}
              onPress={handleUseCurrentLocation}>
              <Ionicons name="location-outline" size={20} color="#6264A7" />
              <Text style={styles.locationText}>Use current location</Text>
            </TouchableOpacity>
            {location && (
              <View style={{height: 300, marginTop: 20}}>
                <MapView
                  style={{flex: 1}}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsUserLocation={true}>
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                  />
                </MapView>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.poweredBy}>
              powered by <Text style={{color: '#4285F4'}}>G</Text>
              <Text style={{color: '#EA4335'}}>o</Text>
              <Text style={{color: '#FBBC05'}}>o</Text>
              <Text style={{color: '#34A853'}}>g</Text>
              <Text style={{color: '#EA4335'}}>l</Text>
              <Text style={{color: '#4285F4'}}>e</Text>
            </Text>
          </View>
        </View>
      </Modal>
      <BottomTabBar />
    </>
  );
};

export default ManageAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2A37',
    marginLeft: 20,
  },
  addRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 36,
  },
  addText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6264A7',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalCloseIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#E3E5F3',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  searchPlaceholder: {
    color: '#7D7D93',
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 20,
    paddingHorizontal: 36,
  },
  locationText: {
    fontSize: 16,
    color: '#6264A7',
    marginLeft: 8,
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});

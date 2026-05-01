import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomTabBar from '../components/BottomNavigaionBar';
import TopBar from '../components/TopBar';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/CustomModal'; // Make sure the path is correct
import {useFocusEffect} from '@react-navigation/native';

const ManageAddressScreen = ({navigation}) => {
  const [addresses, setAddresses] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchAddresses = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('Token not found');

    const response = await fetch(
      'https://buildio.co.nz/api/users/my_addresses',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();

    if (response.ok && result?.data) {
      // Directly set addresses without enrichment
      setAddresses(result.data);
    } else {
      Alert.alert('Error', result?.message || 'Failed to fetch addresses');
    }
  } catch (err) {
    console.error('Address fetch error:', err);
    Alert.alert('Error', 'Something went wrong while fetching addresses');
  } finally {
    setLoading(false);
  }
};
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  const confirmDeleteAddress = async () => {
    if (!selectedAddressId) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        alert('User not authenticated.');
        return;
      }

      const response = await fetch(
        `https://buildio.co.nz/api/addresses/delete_address/${selectedAddressId}`,
        {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      const result = await response.json();
      console.log(result,'result')

      if (response.ok) {
        setAddresses(prev =>
          prev.filter(addr => addr.id !== selectedAddressId),
        );
      } else {
        alert(result.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Network error while deleting address.');
    } finally {
      setDeleteModalVisible(false);
      setSelectedAddressId(null);
    }
  };
  if (loading)
    {return <ActivityIndicator style={{flex: 1}} size="large" color="#6264A7" />;}

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            {/* <Icon name="arrow-back" size={24} color="#6264A7" /> */}
          </TouchableOpacity>
          <Text style={styles.title}>Manage Address</Text>
        </View>

        <TouchableOpacity
          style={styles.addRow}
          onPress={() => navigation.navigate('AddressPicker')}>
          <Icon name="add-circle-outline" size={20} color="#6264A7" />
          <Text style={styles.addText}>Add another address</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={[styles.addressList, { paddingBottom: 120 }]}>
          {Array.isArray(addresses) &&
            addresses.map((addr, index) => (
              <View key={index} style={styles.addressCard}>
                <View style={{flex: 1}}>
                  <Text style={styles.addressLabel}>
                    {addr.label || 'Unnamed Address'}
                  </Text>
                  <Text style={styles.addressText}>
                    {addr.map_text}
                  </Text>
                  <Text style={styles.addressText}>
                    {addr.apartment} {addr.building}
                  </Text>
                  <Text style={styles.addressText}>
                    {addr.notes || 'No notes provided'}
                  </Text>
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AddressPicker', {
                        mode: 'update',
                        address: addr,
                      })
                    }>
                    <Icon name="edit" size={20} color="#6264A7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAddressId(addr.id);
                      setDeleteModalVisible(true);
                    }}
                    style={{marginLeft: 12}}>
                    <Icon name="delete" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </ScrollView>
      </SafeAreaView>

      <CustomModal
        visible={deleteModalVisible}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        buttonText="Cancel"
        confirmText="Delete"
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedAddressId(null);
        }}
        onConfirm={confirmDeleteAddress}
      />

      <BottomTabBar />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff',paddingBottom:0},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16},
  // backButton: {marginRight: 12},
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6264A7',
    marginBottom: 10,
    left: '2%',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    // backgroundColor: '#f7f7f7',
  },
  addText: {marginLeft: 8, color: '#6264A7', fontSize: 16},
  addressList: {padding: 16},
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  addressLabel: {fontWeight: 'bold', fontSize: 16, marginBottom: 4},
  addressText: {color: '#555'},
  buttonGroup: {flexDirection: 'row', alignItems: 'center', marginLeft: 10},
});

export default ManageAddressScreen;

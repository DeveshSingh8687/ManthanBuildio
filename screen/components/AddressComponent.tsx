import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { fetchUserAddresses } from '../../utils/addressApi';
 // adjust path as needed

const AddressDropdown = ({ value, onChange }: { value: any; onChange: (val: any) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const result = await fetchUserAddresses();
      if (result.success) {
        setAddresses(result?.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch addresses');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while fetching addresses');
      console.error('Fetch Address Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (addresses.length === 0) return;
    const matched = addresses.find(addr => addr.id === value);
    if (matched) {
      setSelectedItemName(`${matched.label} (${matched.building})`);
    } else {
      setSelectedItemName(null);
    }
  }, [value, addresses]);

  const filteredAddresses = addresses.filter(addr =>
    `${addr.label} ${addr.building}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (addr: any) => {
    setSelectedItemName(`${addr.label} (${addr.building})`);
    setModalVisible(false);
    onChange?.(addr.id); // only send the ID
  };

  return (
    <View style={styles.inputCard}>
      <Text style={styles.label}>Select Address</Text>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: selectedItemName ? '#000' : '#aaa' }}>
          {selectedItemName || 'Select an address'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#6264A7" />
          ) : (
            <FlatList
              data={filteredAddresses}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <Text style={styles.item}>
                    • {item.label} ({item.building})
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AddressDropdown;

const styles = StyleSheet.create({
  inputCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  dropdownButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  modalContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  item: {
    marginLeft: 12,
    fontSize: 13,
    paddingVertical: 8,
    color: '#444',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#6264A7',
    alignItems: 'center',
    borderRadius: 8,
  },
});

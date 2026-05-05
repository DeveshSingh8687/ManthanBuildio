import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {fetchJobTypes} from '../../utils/fetchJobs'; // adjust path as needed

const JobCategoryList = ({value, onChange}: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [jobCategories, setJobCategories] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadJobTypes = async () => {
      setLoading(true);
      const result = await fetchJobTypes();
      if (result.success) {
        setJobCategories(result.data);
      } else {
        console.warn(result.error);
      }
      setLoading(false);
    };

    loadJobTypes();
  }, []);

  // Separate effect to update selectedItemName whenever value or jobCategories change
  useEffect(() => {
    if (jobCategories.length === 0) return;

    const flatList = jobCategories.flatMap(cat => cat.subcategories);
    const matched = flatList.find(sub => sub.id === value);
    if (matched) {
      setSelectedItemName(matched.name);
    } else {
      setSelectedItemName(null);
    }
  }, [value, jobCategories]);

  const filteredCategories = jobCategories
    .map((category: any) => ({
      ...category,
      subcategories: category.subcategories.filter((sub: {name: string}) =>
        sub.name.toLowerCase().includes(searchText.toLowerCase()),
      ),
    }))
    .filter(cat => cat.subcategories.length > 0);

  const handleSelect = (subItem: {
    name: React.SetStateAction<null>;
    id: any;
  }) => {
    setSelectedItemName(subItem.name);
    setModalVisible(false);
    onChange?.(subItem.id); // 🔁 Only return the ID
  };

  return (
    <View style={styles.inputCard}>
      <Text style={styles.label}>Job Category</Text>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}>
        <Text style={{color: selectedItemName ? '#000' : '#aaa'}}>
          {selectedItemName || 'Select a job category'}
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
              data={filteredCategories}
              keyExtractor={item => item.category}
              renderItem={({item}) => (
                <View style={{marginBottom: 12}}>
                  <Text style={styles.categoryTitle}>{item.category}</Text>
                  {item.subcategories.map((subItem: {id: any; name: any}) => (
                    <TouchableOpacity
                      key={subItem.id}
                      onPress={() => handleSelect(subItem)}>
                      <Text style={styles.item}>• {subItem.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={{color: '#fff'}}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

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
  categoryTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
  },
  item: {
    marginLeft: 12,
    fontSize: 13,
    paddingVertical: 4,
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

export default JobCategoryList;

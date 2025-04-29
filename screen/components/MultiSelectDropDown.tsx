import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const jobCategories = [
  {
    title: 'Building & Construction',
    items: ['New Builds', 'Renovations', 'Extensions', 'Retaining Walls', 'Decking', 'Pergolas', 'Foundations'],
  },
  {
    title: 'Plumbing',
    items: ['General Plumbing', 'Drainlaying', 'Gasfitting', 'Hot Water Cylinder', 'Bathroom Renovation', 'Stormwater Management'],
  },
  {
    title: 'Electrical',
    items: ['General Electrical', 'Lighting Installation', 'Power Points', 'Switchboard Upgrade', 'EV Charger Installation', 'Solar Panel Installation'],
  },
];

const CustomJobSelector = () => {
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // NEW

  const handleItemToggle = (item: string) => {
    if (jobTypes.includes(item)) {
      setJobTypes(jobTypes.filter(i => i !== item));
    } else {
      setJobTypes([...jobTypes, item]);
    }
  };

  const filteredCategories = jobCategories.map(category => ({
    ...category,
    items: category.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())), // NEW
  })).filter(category => category.items.length > 0); // Remove empty sections

  return (
    <View style={styles.container}>
      {/* Dropdown Button */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownButtonText}>
          {jobTypes.length > 0 ? `${jobTypes.length} Job(s) Selected` : 'Select Jobs'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      {/* Selected Jobs as Chips */}
      <View style={styles.selectedItemsContainer}>
        {jobTypes.length > 0 ? (
          jobTypes.map((item, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSelectionText}>No jobs selected yet.</Text>
        )}
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Search Input */}
            <TextInput
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput} // NEW
            />

            <ScrollView>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, idx) => (
                  <View key={idx}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    {category.items.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.itemContainer}
                        onPress={() => handleItemToggle(item)}
                      >
                        <Text style={styles.itemText}>• {item}</Text>
                        {jobTypes.includes(item) && (
                          <Ionicons name="checkmark-circle" size={20} color="#6264A7" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noResultsText}>No jobs found.</Text> // NEW
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery(''); // Clear search on Done
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    width: '100%',

  },
  chip: {
    backgroundColor: '#6264A7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#fff',
  },
  noSelectionText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    width: '100%',

  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    height: '100%', // made taller
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontSize: 14, // smaller
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 6,
  },
  itemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8, // give some space after bullet
  },
  noResultsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#6264A7', // updated to more purple
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});


export default CustomJobSelector;

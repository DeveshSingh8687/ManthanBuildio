import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Types
type JobItem = { id: number; name: string };
type JobCategory = { title: string; items: JobItem[] };

interface Props {
  onSelectionChange: (selectedJobIds: number[]) => void;
}

const CustomJobSelector = ({ onSelectionChange }: Props) => {
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<JobItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        const response = await fetch('https://buildio.co.nz/api/common/job_types_list');
        const json = await response.json();
        const categories: JobCategory[] = json.data.services.map((cat: any) => ({
          title: cat.category,
          items: cat.subcategories.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
          })),
        }));
        setJobCategories(categories);
      } catch (err) {
        console.error('Failed to fetch job types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTypes();
  }, []);

  const handleItemToggle = (item: JobItem) => {
    const isSelected = selectedJobs.some(job => job.id === item.id);
    const updated = isSelected
      ? selectedJobs.filter(job => job.id !== item.id)
      : [...selectedJobs, item];

    setSelectedJobs(updated);
    onSelectionChange(updated.map(job => job.id));
  };

  const filteredCategories = jobCategories
    .map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(category => category.items.length > 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownButtonText}>
          {selectedJobs.length > 0
            ? `${selectedJobs.length} Job(s) Selected`
            : 'Select Jobs'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      <View style={styles.selectedItemsContainer}>
        {selectedJobs.length > 0 ? (
          selectedJobs.map((item, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{item.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSelectionText}>No jobs selected yet.</Text>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />

            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
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
                          <Text style={styles.itemText}>• {item.name}</Text>
                          {selectedJobs.some(job => job.id === item.id) && (
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>No jobs found.</Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
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

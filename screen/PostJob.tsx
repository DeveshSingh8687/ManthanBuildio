import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddJobScreen = () => {
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [jobTypeValue, setJobTypeValue] = useState(null);
  const [jobTypeItems, setJobTypeItems] = useState([
    { label: 'Full-time', value: 'full_time' },
    { label: 'Part-time', value: 'part_time' },
    { label: 'Internship', value: 'internship' },
    { label: 'Freelance', value: 'freelance' },
  ]);

  const fields = [
    'Description',
    'Requirements',
    'Job location',
    'Job position',
    'Job Status',
    'Experience',
    'Deadline',
    'Budget',
  ];

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1 }}>
  {/* Job Type Dropdown - zIndex must be highest */}
  <View style={{ zIndex: 1000 }}>
    <View style={styles.inputCard}>
      <Text style={styles.label}>Job type</Text>
      <DropDownPicker
        open={jobTypeOpen}
        value={jobTypeValue}
        items={jobTypeItems}
        setOpen={setJobTypeOpen}
        setValue={setJobTypeValue}
        setItems={setJobTypeItems}
        searchable
        placeholder="Select job type"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />
    </View>
  </View>
  
        <KeyboardAwareScrollView
    contentContainerStyle={styles.container}
    extraScrollHeight={100}
    enableOnAndroid
    keyboardShouldPersistTaps="handled"
  >
          {/* Header */}
          <View style={styles.header}>
      <TouchableOpacity>
        <Text style={styles.icon}>×</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add a job</Text>
      <TouchableOpacity>
        <Text style={styles.nextButton}>Next</Text>
      </TouchableOpacity>
    </View>
  
          {/* Input Fields */}
          {fields.map((label, index) => (
      <View key={index} style={styles.inputCard}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder="type..."
          placeholderTextColor="#888"
        />
      </View>
    ))}
  
          {/* Image Upload Section */}
          <View style={styles.inputCard}>
      <Text style={styles.label}>Add image</Text>
      <View style={styles.imageRow}>
        <TouchableOpacity style={styles.imageButton}>
          <Icon name="camera-alt" size={22} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton}>
          <Icon name="photo-library" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAwareScrollView>
</View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  
  nextButton: {
    fontSize: 16,
    color: '#7F56D9',
  },
 
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
    marginBottom: 8,
    color: '#333',
  },

  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    fontSize: 16,
  },
  dropdown: {
    borderColor: '#ccc',
    minHeight: 45,
    zIndex: 1000,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    zIndex: 1000,
  },

  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  imageButton: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
  },
  icon: {
    fontSize: 22,
    color: '#1A1A1A',
  },
});

export default AddJobScreen;

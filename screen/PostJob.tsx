import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddJobScreen = () => {
  const [formData, setFormData] = useState({
    description: '',
    requirements: '',
    jobLocation: '',
    jobPosition: '',
    jobType: '',
    jobStatus: '',
    experience: '',
    deadline: '',
    budget: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleNext = () => {
    // Handle form submission or navigation
    console.log('Form data submitted:', formData);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add a job</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type..."
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
          />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="pencil" size={20} color="#3f3f3f" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Requirements</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type..."
            value={formData.requirements}
            onChangeText={(text) => handleInputChange('requirements', text)}
          />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="pencil" size={20} color="#3f3f3f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Repeat similar blocks for other fields */}
      {(['jobLocation', 'jobPosition', 'jobType', 'jobStatus', 'experience', 'deadline', 'budget'] as Array<keyof typeof formData>).map((field) => (
        <View style={styles.inputContainer} key={field}>
          <Text style={styles.label}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type..."
              value={formData[field]}
              onChangeText={(text) => handleInputChange(field, text)}
            />
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="pencil" size={20} color="#3f3f3f" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Add image</Text>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="camera" size={20} color="#3f3f3f" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#3f3f3f',
  },
  iconButton: {
    padding: 8,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddJobScreen;

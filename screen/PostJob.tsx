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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import JobCategoryList from './components/DropDown';

const AddJobScreen = () => {
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [jobTypeValue, setJobTypeValue] = useState(null);
  const [jobTypeItems, setJobTypeItems] = useState([
    { label: 'Full-time', value: 'full_time' },
    { label: 'Part-time', value: 'part_time' },
    { label: 'Internship', value: 'internship' },
    { label: 'Freelance', value: 'freelance' },
  ]);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  

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

  const isMultiline = (label: string) =>
    label === 'Description' || label === 'Requirements';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.flex}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.container}
            extraScrollHeight={100}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.leftSection}>
                <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                  <Icon name="arrow-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.cancelText}>Cancel</Text>
              </View>

              <Text style={styles.title}>Add a job</Text>

              <View style={styles.rightSection}>
                <TouchableOpacity>
                  <Text style={styles.nextButton}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Fields */}
            {fields.map((label, index) => {
              const multiline = isMultiline(label);
              return (
                <View key={index} style={styles.inputCard}>
                 <View style={styles.inputHeader}>
  <Text style={styles.label}>{label}</Text>
  <TouchableOpacity>
    <Icon name="edit" size={18} color="#7F56D9" />
  </TouchableOpacity>
</View>
{(label === 'Description' || label === 'Requirements') && <View style={styles.separator} />}  {/* Separator */}


                  <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder="type..."
                    placeholderTextColor="#888"
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                  />

                </View>
              );
            })}
             <JobCategoryList/>
            {/* Image Upload Section */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>Add image</Text>
              <View style={styles.imageRow}>
                {['camera-alt', 'photo-library'].map((icon, idx) => (
                  <TouchableOpacity key={idx} style={styles.imageButton}>
                    <Icon name={icon} size={22} color="white" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingBottom: 100,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 24,
    marginTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 50,
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  rightSection: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -45 }],
    top: 24,
  },
  nextButton: {
    fontSize: 12,
    color: '#7F56D9',
    marginTop: 40,
  },
  cancelText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
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
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  input: {
    paddingVertical: 6,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  backButton: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 4,
    marginBottom: 8,
  },
});

export default AddJobScreen;

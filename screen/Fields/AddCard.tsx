// Imports
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  // CheckBox,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';

type Props = {
  navigation: {
    goBack: () => void;
  };
};
const ManagePaymentMethodsScreen = ({navigation}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});
  const validateInputs = () => {
    const newErrors: typeof errors = {};

    // Card Number
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry
    if (!expiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = 'Expiry must be in MM/YY format';
    } else {
      const [monthStr, yearStr] = expiry.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(`20${yearStr}`, 10);
      const now = new Date();
      const expiryDate = new Date(year, month - 1);
      if (expiryDate < new Date(now.getFullYear(), now.getMonth())) {
        newErrors.expiry = 'Card is expired';
      }
    }

    // CVV
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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
          <Text style={styles.title}>Manage payment methods</Text>
        </View>

        {/* Cards row */}
        <TouchableOpacity style={styles.row}>
          <Ionicons name="add" size={20} color="#1A1B4B" />
          <Text style={[styles.rowText, {flex: 1, marginLeft: 20}]}>Cards</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Add a card row */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setModalVisible(true)}>
          <Ionicons name="card-outline" size={20} color="#6264A7" />
          <Text style={[styles.rowText, {flex: 1, marginLeft: 20}]}>
            Add a card
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#6264A7" />
        </TouchableOpacity>

        {/* Bottom Sheet Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              {/* Header Icon */}
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon
                  name="chevron-down"
                  size={24}
                  color="#6264A7"
                  style={styles.modalCloseIcon}
                />
              </TouchableOpacity>

              <Text style={styles.sheetTitle}>Add new card</Text>

              {/* Card Number */}
              <View style={styles.inputRow}>
                <Ionicons name="card" size={20} color="#B0B0B0" />
                <TextInput
                  placeholder="Card Number"
                  placeholderTextColor="#AAA"
                  style={styles.input}
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
                {errors.cardNumber && (
                  <Text style={styles.errorText}>{errors.cardNumber}</Text>
                )}
              </View>

              {/* Expiry and CVV */}
              <View style={styles.inlineInputs}>
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor="#AAA"
                  style={styles.inputHalf}
                  keyboardType="numeric"
                  value={expiry}
                  onChangeText={setExpiry}
                />
                {errors.expiry && (
                  <Text style={styles.errorText}>{errors.expiry}</Text>
                )}
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor="#AAA"
                  style={styles.inputHalf}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
                {errors.cvv && (
                  <Text style={styles.errorText}>{errors.cvv}</Text>
                )}
              </View>

              {/* Checkbox */}
              <View style={styles.checkboxContainer}>
                {/* <CheckBox value={saveCard} onValueChange={setSaveCard} /> */}
                <Text style={styles.checkboxLabel}>Save the card details</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (validateInputs()) {
                    setModalVisible(false);
                    // Optionally, clear form inputs
                    setCardNumber('');
                    setExpiry('');
                    setCvv('');
                    setErrors({});
                  }
                }}>
                <Text style={styles.saveButtonText}>Save & proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <BottomTabBar />
    </>
  );
};

export default ManagePaymentMethodsScreen;

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
  errorText: {
  color: 'red',
  fontSize: 12,
  marginTop: 4,
  marginLeft: 4,
},
  modalCloseIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B4B',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 36,
  },
  rowText: {
    fontSize: 16,
    color: '#6264A7',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    paddingBottom: 40,
    height: '80%',
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#6264A7',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 45,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  inlineInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 45,
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#444',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6264A7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

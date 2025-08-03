import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Modal,
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

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

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

    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(text);
    if (errors.cardNumber) {
      setErrors(prev => ({...prev, cardNumber: undefined}));
    }
  };

  const handleExpiryChange = (text: string) => {
    setExpiry(text);
    if (errors.expiry) {
      setErrors(prev => ({...prev, expiry: undefined}));
    }
  };

  const handleCvvChange = (text: string) => {
    setCvv(text);
    if (errors.cvv) {
      setErrors(prev => ({...prev, cvv: undefined}));
    }
  };

  return (
    <>
      <TopBar />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            {/* <Ionicons name="arrow-back" size={24} color="#6264A7" /> */}
          </TouchableOpacity>
          <Text style={styles.title}>Manage payment methods</Text>
        </View>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="add" size={20} color="#1A1B4B" />
          <Text style={[styles.rowText, {flex: 1, marginLeft: 20}]}>Cards</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.row}
          onPress={() => setModalVisible(true)}>
          <Ionicons name="card-outline" size={20} color="#6264A7" />
          <Text style={[styles.rowText, {flex: 1, marginLeft: 20}]}>
            Add a card
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#6264A7" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon
                  name="chevron-down"
                  size={24}
                  color="#6264A7"
                  style={styles.modalCloseIcon}
                />
              </TouchableOpacity>

              <Text style={styles.sheetTitle}>Add new card</Text>

              <View>
                <View style={styles.inputRow}>
                  <Ionicons name="card" size={20} color="#B0B0B0" />
                  <TextInput
                    placeholder="Card Number"
                    placeholderTextColor="#AAA"
                    style={styles.input}
                    keyboardType="numeric"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                  />
                </View>
                {errors.cardNumber && (
                  <Text style={styles.errorText}>{errors.cardNumber}</Text>
                )}
              </View>

              <View style={styles.inlineInputs}>
                <View style={{flex: 1}}>
                  <TextInput
                    placeholder="MM/YY"
                    placeholderTextColor="#AAA"
                    style={styles.inputHalf}
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={handleExpiryChange}
                  />
                  {errors.expiry && (
                    <Text style={styles.errorText}>{errors.expiry}</Text>
                  )}
                </View>

                <View style={{flex: 1}}>
                  <TextInput
                    placeholder="CVV"
                    placeholderTextColor="#AAA"
                    style={styles.inputHalf}
                    secureTextEntry
                    value={cvv}
                    onChangeText={handleCvvChange}
                  />
                  {errors.cvv && (
                    <Text style={styles.errorText}>{errors.cvv}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (validateInputs()) {
                    setModalVisible(false);
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
  title: {
   marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '28%',
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginBottom: 20,
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
  modalCloseIcon: {
    alignSelf: 'center',
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
    marginTop: 16,
  },
  inputHalf: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 45,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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

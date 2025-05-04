import React, { useCallback } from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NavPopup} from './Modal';
import { useFocusEffect } from '@react-navigation/native';

const TopBar = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
useFocusEffect(
    useCallback(() => {
  
        setModalVisible(false);
      
      // On focus, close the modal
    }, [])
  );
  return (
    // <SafeAreaView >
      <>
      <View style={styles.headerLogo}>
        <Image
          source={require('../../assets/asset_logo.png')}
          style={styles.logo} />
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setModalVisible(true)}>
          <Icon name="person-outline" size={24} />
        </TouchableOpacity>
      </View><NavPopup visible={modalVisible} onClose={() => setModalVisible(false)} /></>
        
  );
};
const styles = StyleSheet.create({
  // safeArea: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  // },
  container: {
    flex: 1,
  },
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  profileButton: {
    marginRight: 10,
    padding: 10,
    borderRadius: 8,
  },
});
export default TopBar;

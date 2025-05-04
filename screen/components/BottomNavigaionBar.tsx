import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/Navigation';

const BottomTabBar = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 40 }]}>
      <TouchableOpacity style={styles.navItem}>
        <Icon name="home-outline" size={24} color="#6264A7" />
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Icon name="pricetags-outline" size={24} color="#555" />
        <Text style={styles.navLabel}>Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Icon name="chatbubble-outline" size={24} color="#555" />
        <Text style={styles.navLabel}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem}>
        <Icon name="notifications-outline" size={24} color="#888" />
        <Text style={styles.navLabel}>Notify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 90,
    zIndex: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6264A7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#888',
  },
});

export default BottomTabBar;
export { BottomTabBar };
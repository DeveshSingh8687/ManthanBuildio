import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {NavigationProp, useNavigation, useNavigationState} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../../navigation/Navigation';
import {handleSecurePress} from '../config/auth';

// ✅ Map screen names to tab names — single source of truth
const SCREEN_TO_TAB: Record<string, string> = {
  HomeScreen: 'Home',
  Feed: 'Home',
  NewsScreen: 'Home',
  AddPostScreen: 'Add',
  JobListComponent: 'Booking',
  JobsSection: 'Booking',
  ChatListScreen: 'Chat',
};

const BottomTabBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // ✅ This is the key fix — reads ACTUAL current route from nav state
  // updates automatically on every navigation change, no useState needed
  const currentRouteName = useNavigationState(state => {
    if (!state) return '';
    return state.routes[state.index]?.name ?? '';
  });

  const activeTab = SCREEN_TO_TAB[currentRouteName] ?? '';

  const handleTabPress = (
    tabName: string,
    screenName: keyof RootStackParamList,
  ) => {
    // ✅ Don't re-navigate if already on this tab
    if (activeTab === tabName) return;
    handleSecurePress(screenName, navigation);
  };

  return (
    <View style={[styles.bottomNav, {paddingBottom: insets.bottom || 40}]}>
      {/* Home */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('Home', 'HomeScreen')}>
        <Icon
          name={activeTab === 'Home' ? 'home' : 'home-outline'}
          size={24}
          color={activeTab === 'Home' ? '#6264A7' : '#888'}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'Home' && styles.activeNavLabel,
          ]}>
          Home
        </Text>
        {activeTab === 'Home' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* FAB - Add Post */}
      <TouchableOpacity
        style={[styles.fab, activeTab === 'Add' && styles.activeFab]}
        onPress={() => handleTabPress('Add', 'AddPostScreen')}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Booking */}
      {/* <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('Booking', 'JobListComponent')}>
        <Icon
          name={activeTab === 'Booking' ? 'pricetags' : 'pricetags-outline'}
          size={24}
          color={activeTab === 'Booking' ? '#6264A7' : '#888'}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'Booking' && styles.activeNavLabel,
          ]}>
          Booking
        </Text>
        {activeTab === 'Booking' && <View style={styles.activeDot} />}
      </TouchableOpacity> */}

       <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('Chat', 'ChatListScreen')}>
        <Icon
          name={activeTab === 'Chat' ? 'chatbubble' : 'chatbubble-outline'}
          size={24}
          color={activeTab === 'Chat' ? '#6264A7' : '#888'}
        />
        <Text
          style={[
            styles.navLabel,
            activeTab === 'Chat' && styles.activeNavLabel,
          ]}>
          Chat
        </Text>
        {activeTab === 'Chat' && <View style={styles.activeDot} />}
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeFab: {
    backgroundColor: '#4A4C85',
    transform: [{scale: 1.05}],
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#888',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#6264A7',
    fontWeight: '600',
  },
  // ✅ Active indicator dot under icon
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6264A7',
    marginTop: 3,
  },
});

export default BottomTabBar;
export {BottomTabBar};
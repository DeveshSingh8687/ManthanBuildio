import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TopTabsProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function TopTabs({ tabs, activeTab, onTabPress }: TopTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, activeTab === tab && styles.activeTab]}
          onPress={() => onTabPress(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6264A7',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
});

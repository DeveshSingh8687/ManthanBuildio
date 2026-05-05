// Heading.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Heading = ({ children, style }:any) => {
  return <Text style={[styles.heading, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6264A7',
    // marginTop: 10, // uncomment if needed globally
  },
});

export default Heading;

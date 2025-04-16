import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigation';

const { height } = Dimensions.get('window');

type LaunchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Launch'>;

export default function LaunchScreen() {
  const navigation = useNavigation<LaunchScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Welcome'); // or navigate()
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
    

<Image
  source={require('../assets/launch_logo.png')} // Make sure this path is correct
  style={styles.logo}
/>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});



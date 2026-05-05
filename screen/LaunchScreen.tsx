import React, {useEffect, useRef} from 'react';
import {Animated, View, Image, Dimensions, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height} = Dimensions.get('window');

type LaunchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Launch'
>;

export default function LaunchScreen() {
  const navigation = useNavigation<LaunchScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // First check if user is already logged in (has authToken)
        const authToken = await AsyncStorage.getItem('authToken');

        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          if (authToken) {
            // User is logged in, check terms acceptance
            AsyncStorage.getItem('is_terms_accepted').then((termsAccepted) => {
              if (termsAccepted === 'true') {
                // Terms accepted, go to home
                navigation.replace('HomeScreen');
              } else {
                // Terms not accepted, need to accept first
                navigation.replace('PrivacySecurity');
              }
            });
          } else {
            // User is not logged in, check if they've seen intro
            AsyncStorage.getItem('prefs:hasSeenIntro').then((hasSeenIntro) => {
              if (hasSeenIntro === 'true') {
                // They've seen intro, take them to login
                navigation.replace('Login');
              } else {
                // First time user, show welcome/intro screens
                navigation.replace('Welcome');
              }
            });
          }
        });
      } catch (error) {
        console.log('Error checking user login status:', error);
        navigation.replace('Welcome'); // fallback to Welcome
      }
    };

    // Delay before checking login
    const timer = setTimeout(checkAndRedirect, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <Image source={require('../assets/asset_logo.png')} style={styles.logo} />
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

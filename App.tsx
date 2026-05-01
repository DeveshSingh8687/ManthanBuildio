import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Navigation, { navigationRef } from './navigation/Navigation';
import 'react-native-get-random-values';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { addDeviceId } from './utils/fcmToken';
import { StatusBar } from 'react-native';

async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Notification permission denied');
        return false;
      }
    }

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      if (
        authStatus !== messaging.AuthorizationStatus.AUTHORIZED &&
        authStatus !== messaging.AuthorizationStatus.PROVISIONAL
      ) {
        Alert.alert('Notification permission denied');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
}

export default function App() {
  // Request notification permission and get FCM token
  useEffect(() => {
    async function init() {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const fcmToken = await messaging().getToken();
        console.log(fcmToken)
        addDeviceId(fcmToken)
      }
    }
    init();
    
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const jobId = url.match(/job[/-](\d+)/)?.[1];
      if (jobId && navigationRef.current) {
        navigationRef.current.navigate('JobDetailsScreen', { jobId });
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  return (
  <PaperProvider>
    <StatusBar
      hidden={false}
      barStyle="dark-content"
      backgroundColor="#ffffff"
      translucent={false}
    />
    <Navigation />
  </PaperProvider>
  );
}

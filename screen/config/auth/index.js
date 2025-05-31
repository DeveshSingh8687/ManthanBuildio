import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const _signInWithGoogle = async () => {
  try {
    GoogleSignin.configure({
      offlineAccess: false,
      webClientId: '1008533442966-5p587gaghdl2jd5a5f9tps74jo9ojhue.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('Google Play Services available');

    const userInfo = await GoogleSignin.signIn();
    console.log('User Info:', userInfo);

    const { idToken } = userInfo;
    if (!idToken) throw new Error('No ID token received');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const firebaseUserCredential = await auth().signInWithCredential(googleCredential);

    console.log('Firebase User:', firebaseUserCredential.user);

    const navigation = global.navigation;
    navigation.navigate('HomeScreen');

    return userInfo;
  } catch (error) {
    console.error('Error signing in with Google:', error.code, error.message);
    return null;
  }
};

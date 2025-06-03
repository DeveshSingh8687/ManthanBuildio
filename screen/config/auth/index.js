import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export const _signInWithGoogle = async (navigation) => {
  try {
    // 1. Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '1008533442966-fi407kv4vf3n272nj9di3nem6k3tia29.apps.googleusercontent.com',
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });

    // 2. Log out from Facebook if logged in
    const fbAccessToken = await AccessToken.getCurrentAccessToken();
    if (fbAccessToken) {
      await LoginManager.logOut();
      console.log('Logged out from Facebook');
    }

    // 3. Sign out from Firebase and Google to force fresh sign-in
    // await auth().signOut();
    // await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem('USERID');
    await AsyncStorage.removeItem('EMAIL');


    // 4. Ensure Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // 5. Trigger Gmail account picker
    const userInfo = await GoogleSignin.signIn();
    console.log('Google Sign-In User Info:', userInfo);
    const { idToken } = userInfo.data;
    if (!idToken) throw new Error('No ID token received');
    await AsyncStorage.setItem('USERID', userInfo.data.user.id);
    await AsyncStorage.setItem('EMAIL', userInfo.data.user.email);


    // 6. Sign in with Firebase
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
    const user = firebaseUserCredential.user;
    console.log('Logged in as:', user.email);

    // 7. Store new user ID
    await AsyncStorage.setItem('userId', idToken);

    // 8. Navigate to Home
    navigation.navigate('HomeScreen');

    return user;
  } catch (error) {
    console.log('Google Sign-In Error:', error?.code, error?.message);
    return null;
  }
};
export const logout = async () => {
  console.log('Logging out...');
  try {
    // 1. Firebase Logout
    await auth().signOut();
    console.log('Logged out from Firebase');

    // 2. Google Sign-Out
    const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
    if (isSignedInWithGoogle) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      console.log('Logged out from Google');
    }

    // 3. Facebook Sign-Out (if token exists)
    const fbAccessToken = await AccessToken.getCurrentAccessToken();
    if (fbAccessToken) {
      await LoginManager.logOut();
      console.log('Logged out from Facebook');
    }

    // 4. Clear AsyncStorage user ID
    await AsyncStorage.removeItem('userId');
    console.log('User ID cleared from storage');

    return true;
  } catch (error) {
    console.error('Logout Error:', error?.message || error);
    return false;
  }
};
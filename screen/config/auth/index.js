import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
// const saveUserToFirestore = async () => {
//   const user = auth().currentUser;
//   console.log('Current User:', user?.displayName);
//   if (user?.email) {
//     console.log('No email found for the user, skipping Firestore save.');
// try {
//   console.log('No email found for the user, skipping Firestore save.');
//     await fireStore().collection('users').doc(user?.uid).set({
//       uid: user?.uid,
//       name: user?.displayName || '',
//       createdAt: fireStore.FieldValue.serverTimestamp(),
//       email: user?.email || '',
//     });
//       await AsyncStorage.setItem('USERID', user.uid);
//     console.log('User added!,user.uid:', user.uid);
//     navigation.navigate('Login');
//   } catch (error) {
//     console.error('Error adding user: ', error);

//   }
// };
//   };

// const doc = await userRef.get();
// if (!doc.exists) {
//   await userRef.set({
//     uid: user.uid,
//     name: user?.displayName || '',
//   });
// }
export const socialLoginAPI = async ({
  email,
  first_name,
  social_media_provider,
  provider_token,
}) => {
  try {
    const response = await fetch(
      'https://buildio.co.nz/api/auth/social_login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name,
          social_media_provider,
          provider_token,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Social login API error:', data);
      throw new Error(data.message || 'Login failed');
    }

    console.log('Social login API success:', data);
    const token = data.data.token;
    const firstName = data.data.user?.first_name;
    const lastName = data.data.user?.last_name;
    console.log(token, firstName, lastName);
    await AsyncStorage.setItem('authToken', token);
    // await AsyncStorage.setItem('firstName', firstName);
    // await AsyncStorage.setItem('lastName', lastName);
    return data;
  } catch (error) {
    console.error('Network/API error:', error.message || error);
    throw error;
  }
};

export const _signInWithGoogle = async navigation => {
  try {
    // 1. Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '1008533442966-fi407kv4vf3n272nj9di3nem6k3tia29.apps.googleusercontent.com',
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
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // 5. Trigger Gmail account picker
    const userInfo = await GoogleSignin.signIn();
    // console.log('Google Sign-In User Info:', userInfo);
    const {idToken} = userInfo.data;
    if (!idToken) throw new Error('No ID token received');
    await AsyncStorage.setItem('EMAIL', userInfo.data.user.email);

    // 6. Sign in with Firebase
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const firebaseUserCredential = await auth().signInWithCredential(
      googleCredential,
    );
    const user = firebaseUserCredential.user;
    // console.log('Logged in as:', userInfo);

    const apiResponse = await socialLoginAPI({
      email: userInfo.data.user.email,
      first_name: userInfo.data.user.givenName,
      social_media_provider: 'Google',
      provider_token: userInfo.data.user.id,
    });

    // --- Add this line to save user info to Firestore ---
    // await saveUserToFirestore();

    // 7. Store new user ID
    // await AsyncStorage.setItem('USERID', idToken);

    // 8. Navigate to Home
    navigation.navigate('HomeScreen');

    return user;
  } catch (error) {
    console.log('Google Sign-In Error:', error?.code, error?.message);
    return null;
  }
};
export async function onFacebookButtonPress(navigation) {
  console.log('Facebook button pressed');
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);
  console.log('Login result:', result);

  if (result.isCancelled) {
    // navigation.navigate('HomeScreen');

    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccessToken
  const data = await AccessToken.getCurrentAccessToken();
  navigation.navigate('HomeScreen');

  if (!data) {
    throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
  await getAuth().signInWithCredential(facebookCredential);
  console.log('Facebook credential:', facebookCredential);

  // Sign-in the user with the credential
  return signInWithCredential(getAuth(), facebookCredential);
}

export const logout = async () => {
  console.log('Logging out...');
  try {
    // ✅ Google Sign-Out (if used)
    try {
      await GoogleSignin.hasPlayServices();
      const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
      if (isSignedInWithGoogle) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        console.log('Logged out from Google');
      } else {
        console.log('Not signed in with Google');
      }
    } catch (googleError) {
      console.log(
        'Google sign out error/skipped:',
        googleError?.message || googleError,
      );
    }

    // ✅ Facebook Sign-Out (if used)
    try {
      const fbAccessToken = await AccessToken.getCurrentAccessToken();
      if (fbAccessToken) {
        await LoginManager.logOut();
        console.log('Logged out from Facebook');
      }
    } catch (fbError) {
      console.log(
        'Facebook sign out error/skipped:',
        fbError?.message || fbError,
      );
    }

    // ✅ Firebase Sign-Out (always call this)
    try {
      await auth().signOut();
      console.log('Logged out from Firebase');
    } catch (firebaseError) {
      console.log(
        'Firebase sign out error:',
        firebaseError?.message || firebaseError,
      );
    }

    // ✅ Clear AsyncStorage
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
    } catch (storageError) {
      console.log(
        'AsyncStorage clear error:',
        storageError?.message || storageError,
      );
    }

    return true;
  } catch (error) {
    console.error('General Logout Error:', error?.message || error);
    return false;
  }
};

export const handleSecurePress = async (screen, navigation) => {
    const authToken = await AsyncStorage.getItem('authToken');
   if (authToken && authToken.trim() !== '') {
  navigation.navigate(screen);
} else {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
}
  };

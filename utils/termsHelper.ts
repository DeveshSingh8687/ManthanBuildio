import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to navigate based on terms acceptance status
 * @param navigation - Navigation object
 * @param defaultScreen - Screen to navigate to if terms are accepted (default: 'HomeScreen')
 */
export const navigateByTermsAcceptance = async (
  navigation: any,
  defaultScreen: string = 'HomeScreen',
) => {
  try {
    const isTermsAccepted = await AsyncStorage.getItem('is_terms_accepted');

    if (isTermsAccepted === 'true') {
      navigation.navigate(defaultScreen);
    } else {
      // Navigate to PrivacySecurityScreen if terms not accepted
      navigation.navigate('PrivacySecurity');
    }
  } catch (error) {
    console.error('Error in navigateByTermsAcceptance:', error);
    // Default to privacy screen if there's an error
    navigation.navigate('PrivacySecurity');
  }
};

/**
 * Check if user has accepted terms
 * @returns {Promise<boolean>} - true if terms accepted, false otherwise
 */
export const isTermsAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('is_terms_accepted');
    return value === 'true';
  } catch (error) {
    console.error('Error checking terms acceptance:', error);
    return false;
  }
};

/**
 * Mark terms as accepted
 * @returns {Promise<void>}
 */
export const markTermsAsAccepted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('is_terms_accepted', 'true');
  } catch (error) {
    console.error('Error marking terms as accepted:', error);
  }
};

/**
 * Reset terms acceptance status (used for logout)
 * @returns {Promise<void>}
 */
export const resetTermsAcceptance = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('is_terms_accepted');
  } catch (error) {
    console.error('Error resetting terms acceptance:', error);
  }
};

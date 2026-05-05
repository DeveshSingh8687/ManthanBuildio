import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {CheckBox} from 'react-native-elements'; // Make sure this package is installed
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';
import Heading from '../components/CommonHeader';

const aboutData = {
  title: 'Privacy & Security',
  footerText: 'BUILDIO\nInnovating the way you build',
};

const bulletPoints = [
  'Lorem ipsum dolor sit amet consectetur.',
  'Nibh lobortis id pellentesque blandit.',
  'Sit praesent ornare eget pretium suspendisse.',
  'Pulvinar gravida velit aliquet nulla arcu.',
  'Proin sit laoreet eu dapibus curabitur elit.',
  'Integer non tempus malesuada nibh id lectus ut.',
];
const privacySections = [
  {
    title: '1. Introduction',
    content: [
      'These Terms and Conditions ("Terms") govern your use of the Buildio platform ("Platform"), operated by Buildio Limited, a company registered in New Zealand.',
      'By accessing or using the Platform, you agree to be bound by these Terms.',
    ],
  },
  {
    title: '2. Nature of the Platform',
    content: [
      'Buildio is an online information marketplace.',
      'Users may post construction-related tasks.',
      'Users may respond to and accept tasks.',
      'Users may publish work-related updates or logs.',
      'Buildio Limited does not provide construction services.',
      'Buildio Limited is not a contractor, subcontractor, or consultant.',
      'Buildio Limited is not a party to any agreement between users.',
      'Buildio Limited does not supervise or manage any works.',
      'All agreements are made solely between users.',
    ],
  },
  {
    title: '3. User Eligibility',
    content: [
      'You must be at least 18 years old.',
      'You must have legal capacity to enter into binding agreements.',
      'You must ensure any work you undertake complies with New Zealand law.',
    ],
  },
  {
    title: '4. User Responsibilities',
    content: [
      'Users are solely responsible for verifying qualifications, licensing, and insurance.',
      'Users must conduct their own due diligence.',
      'Users should enter into written contracts where appropriate.',
      'Users manage payments independently.',
      'Users must comply with the Building Act 2004 and all applicable regulations.',
      'Buildio Limited does not verify licensing or credentials.',
    ],
  },
  {
    title: '5. No Warranty',
    content: [
      'The Platform is provided "as is" and "as available."',
      'Buildio Limited makes no representations or warranties regarding quality of work.',
      'Buildio Limited makes no representations or warranties regarding completion timelines.',
      'Buildio Limited makes no representations or warranties regarding professional qualifications.',
      'Buildio Limited makes no representations or warranties regarding suitability of users.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    content: [
      'To the maximum extent permitted by New Zealand law, Buildio Limited shall not be liable for construction defects.',
      'Buildio Limited shall not be liable for delays.',
      'Buildio Limited shall not be liable for financial losses.',
      'Buildio Limited shall not be liable for disputes between users.',
      'Buildio Limited shall not be liable for personal injury or property damage.',
      'Buildio Limited shall not be liable for any indirect or consequential loss.',
    ],
  },
  {
    title: '7. Disputes Between Users',
    content: [
      'Any dispute arising between users must be resolved directly between those users.',
      'Buildio Limited is not responsible for mediating or resolving disputes.',
    ],
  },
  {
    title: '8. Account Suspension',
    content: [
      'Buildio Limited reserves the right to suspend or terminate accounts if users breach these Terms.',
      'Buildio Limited reserves the right to suspend or terminate accounts if users misuse the Platform.',
      'Buildio Limited reserves the right to suspend or terminate accounts if content is unlawful or inappropriate.',
    ],
  },
  {
    title: '9. Intellectual Property',
    content: [
      'All trademarks, logos, and platform content are owned by Buildio Limited.',
      'Users may not reproduce or distribute platform content without permission.',
    ],
  },
  {
    title: '10. Privacy Policy',
    content: [
      'Buildio Limited is committed to protecting user privacy in accordance with the Privacy Act 2020 (New Zealand).',
    ],
  },
  {
    title: '10.1 Information We Collect',
    content: [
      'Name',
      'Email address',
      'Phone number',
      'User profile information',
      'Content posted on the Platform',
    ],
  },
  {
    title: '10.2 How We Use Information',
    content: [
      'To operate the Platform',
      'To communicate with users',
      'To improve services',
    ],
  },
  {
    title: '10.3 Data Sharing',
    content: [
      'Buildio Limited does not sell personal data.',
      'Information may be shared if required by law.',
      'Information may be shared to protect platform integrity.',
    ],
  },
  {
    title: '10.4 Data Security',
    content: ['We take reasonable steps to protect user data.'],
  },
  {
    title: '10.5 Your Rights',
    content: [
      'Under the New Zealand Privacy Act 2020, users may request access to their data.',
      'Users may request correction of inaccurate data.',
    ],
  },
  {
    title: '10.6 Contact',
    content: ['For privacy-related inquiries:', 'info@buildio.co.nz'],
  },
  {
    title: '11. Amendments',
    content: [
      'Buildio Limited may update these Terms at any time.',
      'Continued use of the Platform constitutes acceptance of updated Terms.',
    ],
  },
  {
    title: '12. Governing Law',
    content: [
      'These Terms are governed by the laws of New Zealand.',
      'Any disputes shall be subject to the jurisdiction of New Zealand courts.',
    ],
  },
];

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (routeName: string) => void;
  };
};

const PrivacySecurity = ({navigation}: Props) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTermsAlreadyAccepted, setIsTermsAlreadyAccepted] = useState(false);
  const [isCheckingTerms, setIsCheckingTerms] = useState(true);

  useEffect(() => {
    // Check if terms are already accepted
    const checkTermsAcceptance = async () => {
      try {
        const termsAccepted = await AsyncStorage.getItem('is_terms_accepted');
        if (termsAccepted === 'true') {
          setIsTermsAlreadyAccepted(true);
        }
      } catch (error) {
        console.error('Error checking terms acceptance:', error);
      } finally {
        setIsCheckingTerms(false);
      }
    };

    checkTermsAcceptance();
  }, []);

  const handleAcceptTerms = async () => {
    try {
      setLoading(true);

      // Get the auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem('authToken');

      if (!authToken) {
        Alert.alert(
          'Error',
          'Authorization token not found. Please sign in again.',
        );
        return;
      }

      // Make API call to accept terms
      const response = await fetch(
        'https://buildio.co.nz/api/users/accept-terms',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Failed to accept terms and conditions',
        );
        return;
      }

      // Save the terms accepted flag to AsyncStorage
      await AsyncStorage.setItem('is_terms_accepted', 'true');

      // Navigate to home screen directly
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error accepting terms:', error);
      Alert.alert(
        'Error',
        'An error occurred while accepting terms. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isTermsAlreadyAccepted && <TopBar />}{' '}
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {/* <Ionicons
            name="arrow-back"
            size={24}
            color="#6264A7"
            style={styles.backButton}
          /> */}
          </TouchableOpacity>
          {/* <Text style={styles.headerText}>{aboutData.title}</Text> */}
          <Heading>{aboutData.title}</Heading>
        </View>

        {/* Main Content */}
        <View style={styles.body}>
          <ScrollView contentContainerStyle={styles.bulletContainer}>
            {privacySections.map((section, index) => (
              <View key={index} style={{marginBottom: 20}}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                {section.content.map((item, idx) => (
                  <Text key={idx} style={styles.checkboxText}>
                    • {item}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Bottom Section - Show only if terms not already accepted */}
          {!isTermsAlreadyAccepted && (
            <View style={styles.bottomSection}>
              <CheckBox
                title="I accept the Terms and Conditions"
                checked={accepted}
                onPress={() => setAccepted(!accepted)}
                containerStyle={styles.checkboxContainer}
                textStyle={styles.checkboxText}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {opacity: accepted && !loading ? 1 : 0.5},
                ]}
                disabled={!accepted || loading}
                onPress={handleAcceptTerms}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Show message if terms are already accepted */}
          {/* {isTermsAlreadyAccepted && (
            <View style={styles.bottomSection}>
              <View style={styles.acceptedMessageContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color="#6264A7"
                  style={{marginBottom: 12}}
                />
                <Text style={styles.acceptedText}>
                  Terms and Conditions Accepted
                </Text>
                <Text style={styles.acceptedSubText}>
                  You have already accepted the terms. You can now proceed to
                  the home screen.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => navigation.navigate('HomeScreen')}>
                <Text style={styles.submitText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          )} */}

          <View style={styles.footer}>
            {/* <Image
                source={require('../../assets/asset_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              /> */}
            <Text style={styles.logoText}>{aboutData.footerText}</Text>
          </View>
        </View>
      </SafeAreaView>
      {isTermsAlreadyAccepted && <BottomTabBar />}
    </>
  );
};

export default PrivacySecurity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    left: '32%',
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  pointContainer: {
    marginBottom: 8,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  checkboxText: {
    fontSize: 14,
    color: '#1A1B4B',
    textAlign: 'justify',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#6264A7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 80,
  },
  logoText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#1A1B4B',
    marginTop: 6,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bulletContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1B4B',
    marginBottom: 8,
  },
  acceptedMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  acceptedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6264A7',
    marginBottom: 8,
    textAlign: 'center',
  },
  acceptedSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

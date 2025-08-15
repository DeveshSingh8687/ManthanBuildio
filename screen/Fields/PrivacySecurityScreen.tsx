import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CheckBox } from 'react-native-elements'; // Make sure this package is installed
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

type Props = {
  navigation: {
    goBack: () => void;
  };
};

const PrivacySecurity = ({ navigation }: Props) => {
  const [accepted, setAccepted] = useState(false);

return (
  <>
    <TopBar />
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
          {bulletPoints.map((point, index) => (
            <View key={index} style={styles.pointContainer}>
              <Text style={styles.checkboxText}>• {point}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <CheckBox
            title="I accept the Terms and Conditions"
            checked={accepted}
            onPress={() => setAccepted(!accepted)}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />

          <TouchableOpacity
            style={[styles.submitButton, { opacity: accepted ? 1 : 0.5 }]}
            disabled={!accepted}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Image
              source={require('../../assets/asset_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>{aboutData.footerText}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
    <BottomTabBar />
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
});

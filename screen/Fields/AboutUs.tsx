import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
import BottomTabBar from '../components/BottomNavigaionBar';
import Heading from '../components/CommonHeader';
const aboutData = {
  title: "About Us",
  content: "Buildio is an innovative online information marketplace designed specifically for the construction industry. Our platform connects individuals and businesses who need construction-related services with skilled professionals ready to deliver quality work. Users can post tasks, respond to opportunities, share updates, and manage work-related activities efficiently within a transparent and collaborative environment. Buildio simplifies communication and creates opportunities by bringing the construction community together in one trusted digital space. We are committed to making project coordination easier, improving visibility, and empowering users to build smarter and more efficiently.",
  footerText: "BUILDIO\nInnovating the way you build"
}

const content = [
  "Buildio is an online information marketplace.",
  "Users may post construction-related tasks.",
  "Users may respond to and accept tasks.",
  "Users may publish work-related updates or logs.",
  "Buildio Limited does not provide construction services.",
  "Buildio Limited is not a contractor, subcontractor, or consultant.",
  "Buildio Limited is not a party to any agreement between users.",
  "Buildio Limited does not supervise or manage any works.",
  "All agreements are made solely between users."
];
  type Props = {
    navigation: {
      goBack: () => void;
    };
  };
const AboutUsScreen = ({ navigation }:Props) => {
  return (
    <><TopBar /><SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  {/* <Ionicons name="arrow-back" size={24} color="#6264A7" style={styles.backButton} /> */}
              </TouchableOpacity>
              <Heading>{aboutData.title}</Heading>
          </View>

          {/* Scrollable Content */}
          <ScrollView style={styles.content}>
              <Text style={styles.bodyText}>{aboutData.content}</Text>
          </ScrollView>

          {/* Footer Logo */}
          <View style={styles.footer}>
              <Image
                  source={require('../../assets/asset_logo.png')} // Replace with your actual image
                  style={styles.logo}
                  resizeMode="contain" />
          </View>
      </SafeAreaView>
            <BottomTabBar />
      </>
  );
};

export default AboutUsScreen;

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
    left: '35%',
  },
  content: {
    marginTop: 30,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#1A1B4B',
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 90,
    
  },
  logo: {
    width: 100,
    height: 80,
  },
  logoText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#1A1B4B',
  },
});

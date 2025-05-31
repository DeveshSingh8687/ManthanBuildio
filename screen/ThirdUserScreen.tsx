import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/Navigation';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';

const jobData = {
  Name: 'Elisha Conwell',
  imageUrl: 'https://i.pravatar.cc/100',
  description:
    'Seeking a highly skilled carpenter with expertise in custom cabinetry. Experience with design, fabrication, and installation is essential.',
  requirements: [
    'Read and interpret blueprints, schematics, and technical drawings.',
    'Accurately measure, cut, and assemble cabinet components.',
    'Install cabinets with precision and attention to detail.',
    'Finish cabinets with a high level of quality (e.g., staining, painting, varnishing).',
    'Operate various woodworking machinery and hand tools safely and efficiently.',
  ],
  location: 'Auckland, New Zealand',
  coords: { latitude: -36.8485, longitude: 174.7633 },
  info: {
    'Email': 'john.doe@example.com',
    'Phone Number': '+64 21 123 4567',
    'Job Type': ['Full-Time', 'Remote', 'Contract'],
    'About': 'Experienced carpenter with a focus on cabinetry and fine woodworking.',
    'Experience': '5 Years',
  },
};

const UserScreen = () => {
  const [region] = React.useState({
    latitude: jobData.coords.latitude,
    longitude: jobData.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <><TopBar/><ScrollView style={styles.container}>
          {/* Top Header */}
{/* 
          <View style={styles.headerLogo}>
              <Image
                  source={require('../assets/asset_logo.png')}
                  style={styles.logo} />
              <TouchableOpacity style={styles.profileButton}>
                  <Icon name="person-outline" size={24} />
              </TouchableOpacity>
          </View> */}

          {/* <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>User Profile</Text>
          </View> */}

          {/* Title Card */}
          <View style={styles.titleCardWrapper}>
              <View style={styles.profileImageWrapper}>
                  <Image source={{ uri: jobData.imageUrl }} style={styles.profileImage} />
              </View>
              <View style={styles.titleCard}>
                  <Text style={styles.titleText}>{jobData.Name}</Text>
              </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.sectionText}>{jobData.description}</Text>
              <TouchableOpacity>
                  <Text style={styles.readMore}>Read more</Text>
              </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionText}>{jobData.location}</Text>
              <MapView style={styles.map} initialRegion={region}>
                  <Marker coordinate={region} />
              </MapView>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations</Text>
              {Object.entries(jobData.info).map(([label, value], index) => (
                  <View key={index} style={styles.infoBlock}>
                      <Text style={styles.infoLabel}>{label}</Text>
                      {label === 'Job Type' && Array.isArray(value) ? (
                          <View style={styles.chipContainer}>
                              {value.map((type, i) => (
                                  <View key={i} style={styles.chip}>
                                      <Text style={styles.chipText}>{type}</Text>
                                  </View>
                              ))}
                          </View>
                      ) : (
                          <Text style={styles.infoValue}>{value}</Text>
                      )}
                      <View style={styles.infoDivider} />
                  </View>
              ))}
          <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyText}>Chat</Text>
          </TouchableOpacity>
          </View>

          {/* Apply Button */}

      </ScrollView>
      <BottomTabBar/>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },

 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginBottom: 28,
    marginTop: 18,
  },
  backArrow: {
    fontSize: 24,
    color: '#25396F',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 15,
  },

  titleCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  profileImageWrapper: {
    position: 'absolute',
    top: -45,
    zIndex: 2,
    elevation: 2,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  titleCard: {
    backgroundColor: '#ccc',
    alignItems: 'center',
    width: '100%',
    height: 80,
    justifyContent: 'center',
    zIndex: 1,
    borderRadius: 10,
    paddingTop: 30,
  },
  titleText: { fontWeight: 'bold', fontSize: 16 },

  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: 'bold', color: '#25396F', marginBottom: 5 },
  sectionText: { color: '#333' },
  readMore: { color: '#25396F', fontWeight: 'bold', marginTop: 5 },

  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    ...Platform.select({
      ios: { overflow: 'hidden' },
      android: {},
    }),
  },

  infoBlock: { marginBottom: 12 },
  infoLabel: { fontWeight: '600', fontSize: 13, color: '#25396F' },
  infoValue: { fontSize: 13, color: '#444', marginTop: 2 },
  infoDivider: { height: 1, backgroundColor: '#eee', marginTop: 8 },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  chip: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  applyBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 120
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginTop:10,  alignSelf: 'flex-end', padding: 10},
  profileButton:{marginRight: 10, padding: 10, borderRadius: 8},
  heading: {
    // marginTop:10,
    marginLeft: 10,          // add left space after back button
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default UserScreen;

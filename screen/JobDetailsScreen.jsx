import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';


const jobData = {
  title: 'Carpenter (Cabinetry Specialist)',
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
    'Job position': 'Carpenter (Cabinetry Specialist)',
    'Job Type': 'Contract',
    'Job Status': 'Active',
    Experience: '3 Years',
    Deadline: 'Project completion by [05-06-25]',
    Budget: '$40 - $50 per hour',
  },
};

const JobDetailsScreen = ({ navigation }) => {
  const [region, setRegion] = React.useState({
    latitude: jobData.coords.latitude,
    longitude: jobData.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <ScrollView style={styles.container}>
      
      {/* Top Header */}
      <View style={styles.header}>
         <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Detail</Text>
      </View>

      {/* Title Card */}
      <View style={styles.titleCardWrapper}>
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: jobData.imageUrl }} style={styles.profileImage} />
        </View>
        <View style={styles.titleCard}>
          <Text style={styles.titleText}>{jobData.title}</Text>
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
        {/* Uncomment below to show real map */}
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} />
        </MapView>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        {Object.entries(jobData.info).map(([label, value], index) => (
          <View key={index} style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
            <View style={styles.infoDivider} />
          </View>
        ))}
      </View>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyBtn}>
        <Text style={styles.applyText}>Apply now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  backButton: {
    marginBottom:40,
    marginTop: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#25396F',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 15
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

  applyBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default JobDetailsScreen;

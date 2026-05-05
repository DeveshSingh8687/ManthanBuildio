// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Platform,
//   useState,
//   useCallback
// } from 'react-native';
// import MapView, {Marker} from 'react-native-maps';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import BottomTabBar from './components/BottomNavigaionBar';
// import TopBar from './components/TopBar';
// import {
//   NavigationProp,
//   useNavigation,
//   useRoute,
// } from '@react-navigation/native';
// import CustomModal from './components/CustomModal';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {handleApply} from '../utils/fetchJobs';

// const JobDetailsScreen = ({route, navigation}) => {
//   const BASE_URL = 'https://buildio.co.nz/api';

//   const {job, updateJob} = route.params;
//   console.log(job);
//   // const navigation = useNavigation();
//   const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
//   const [resultModalVisible, setResultModalVisible] = React.useState(false);
//   const [modalMessage, setModalMessage] = React.useState('');
//   const [modalTitle, setModalTitle] = React.useState('');
//   const [showFullDescription, setShowFullDescription] = React.useState(false);
//   const [loading, setLoading] = useState(false);
//   const [modal, setModal] = useState({ visible: false, title: '', message: '' });
//   const [applyLoadingId, setApplyLoadingId] = useState(null); // track per-item
//   const [expandedIds, setExpandedIds] = useState({}); // track per-item

//   const descriptionText = job?.description || '';
//   const isLongDescription = descriptionText.length > 100;
//   const displayedText = showFullDescription
//     ? descriptionText
//     : descriptionText.slice(0, 100) + (isLongDescription ? '...' : '');

//   const region = {
//     latitude: parseFloat(job?.address?.lat || '0'),
//     longitude: parseFloat(job?.address?.long || '0'),
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   };

//   const handleDelete = async () => {
//     try {
//       setDeleteModalVisible(false); // close confirmation modal

//       console.log('🗑️ Deleting job:', job.job_id || job.id);

//       const token = await AsyncStorage.getItem('authToken');
//       const response = await fetch(
//         `${BASE_URL}/jobs/delete/${job.job_id || job.id}`,
//         {
//           method: 'GET', // backend expects GET for deletion
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       console.log('📡 Delete response status:', response.status);

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to delete job');
//       }

//       // Success handling
//       setModalTitle('Success');
//       setModalMessage('Job deleted successfully');
//       setResultModalVisible(true);

//       // Navigate away after a short delay
//       setTimeout(() => {
//         setResultModalVisible(false);
//         navigation.navigate('JobsSection');
//       }, 2000);
//     } catch (error) {
//       console.error('❌ Delete Job Error:', error.message);
//       setModalTitle('Error');
//       setModalMessage(
//         error.message || 'Something went wrong. Please try again.',
//       );
//       setResultModalVisible(true);
//     }
//   };
//   const handleApplyClick = async () => {
//     try {
//       const data = await handleApply(job.job_id || job.id);
//       setModalTitle('Success');
//       setModalMessage(data.message || 'Applied successfully!');
//       setResultModalVisible(true);
//         job.apply_status = true;

//       // ✅ Redirect after short delay
//       //  setTimeout(() => {
//       //   setResultModalVisible(false);
//       //   navigation.navigate('JobsSection'); // Or wherever you want to redirect
//       // }, 1500);
//     } catch (error) {
//       setModalTitle('Error');
//       setModalMessage(error.message || 'Something went wrong while applying.');
//       setResultModalVisible(true);
//     }
//   };
//   const handleDeletePostClick = async () => {
//     try {
//       setDeleteModalVisible(false); // Close confirmation modal

//       const data = await deleteJob(job.job_id || job.id);

//       setModalTitle('Success');
//       setModalMessage(data.message || 'Post deleted successfully.');
//       setResultModalVisible(true);

//       setTimeout(() => {
//         setResultModalVisible(false);
//         navigation.navigate('JobsSection'); // Or wherever you want to redirect
//       }, 1500);
//     } catch (error) {
//       setModalTitle('Error');
//       setModalMessage(error.message || 'Something went wrong while deleting.');
//       setResultModalVisible(true);
//     }
//   };
//   const handleNavigation = () => {
//     navigation.navigate('JobDetailS', {
//       job: job,
//       updateJob: updateJob,
//     });
//   };

//     const showModal = useCallback((title, message) =>
//       setModal({ visible: true, title, message }), []);
//     const closeModal = () => setModal(prev => ({ ...prev, visible: false }));
// const handleCancelJob = useCallback(async (item) => {
//   try {
//     setApplyLoadingId(item.id);
//     const token = await AsyncStorage.getItem('authToken');
//     if (!token) {
//       showModal('Error', 'Authorization token not found. Please sign in again.');
//       return;
//     }

//     const response = await fetch(
//       `https://buildio.co.nz/api/jobs/cancel/${item.id}`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     const data = await response.json();

//     if (response.ok) {
//       showModal('Success', data.message || 'Job cancelled successfully.');
//       // Mirror JobDetailsScreen: update local apply_status to null
//       setJobs(prevJobs =>
//         prevJobs.map(job =>
//           job.id === item.id ? { ...job, apply_status: null } : job
//         )
//       );
//     } else {
//       showModal('Error', data.message || 'Failed to cancel the job. Please try again.');
//     }
//   } catch (error) {
//     console.error('Error cancelling job:', error);
//     showModal('Error', 'Something went wrong. Please try again.');
//   } finally {
//     setApplyLoadingId(null);
//   }
// }, [showModal]);
// const handleClick = useCallback(async (item) => {
//   const isCancelMode =
//     item.apply_status === 'applied' || item.apply_status === 'pending';

//   if (isCancelMode) {
//     await handleCancelJob(item);
//     return; // local state already updated inside handleCancelJob
//   }

//   // Mirror JobDetailsScreen's handleApplyClick
//   try {
//     setApplyLoadingId(item.id);
//     const data = await handleApply(item.job_id || item.id);

//     if (data?.status === true) {
//       showModal('Success', data.message || 'Applied successfully!');
//       // Mirror JobDetailsScreen: set apply_status to 'applied'
//       setJobs(prevJobs =>
//         prevJobs.map(job =>
//           job.id === item.id ? { ...job, apply_status: 'applied' } : job
//         )
//       );
//     } else {
//       showModal('Info', data?.message || 'You have already applied to this job.');
//     }
//   } catch (error) {
//     showModal('Error', error.message || 'Something went wrong. Please try again.');
//   } finally {
//     setApplyLoadingId(null);
//   }
// }, [handleCancelJob, showModal]);
//   return (
//     <>
//       <TopBar />
//       <ScrollView style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}></View>

//         {/* Title Card */}
//         <View style={styles.titleCardWrapper}>
//           <View style={styles.profileImageWrapper}>
//             <Image
//               source={{
//                 uri: job?.user?.profile_picture || 'https://i.pravatar.cc/100',
//               }}
//               style={styles.profileImage}
//             />
//           </View>

//           <View style={styles.titleCard}>
//             <Text style={styles.titleText}>
//               {job?.user?.first_name} {job?.user?.last_name} (
//               {job?.job_type?.job || 'Job Title'})
//             </Text>
//           </View>
//         </View>

//         {/* Description */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Job Description</Text>
//           <Text style={styles.sectionText}>{displayedText}</Text>

//           {isLongDescription && !showFullDescription && (
//             <TouchableOpacity onPress={() => setShowFullDescription(true)}>
//               <Text style={styles.readMore}>Read more</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Location */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Location</Text>
//           <Text style={styles.sectionText}>
//             {job?.address?.label}, {job?.address?.building},{' '}
//             {job?.address?.apartment}
//           </Text>
//           <MapView style={styles.map} initialRegion={region}>
//             <Marker coordinate={region} />
//           </MapView>
//         </View>

//         {/* Info Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Informations</Text>

//           <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>Status</Text>
//             <Text style={styles.infoValue}>{job?.status}</Text>
//             <View style={styles.infoDivider} />
//           </View>

//           <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>Budget</Text>
//             <Text style={styles.infoValue}>${job?.budget}</Text>
//             <View style={styles.infoDivider} />
//           </View>

//             <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>Deadline</Text>
//             <Text style={styles.infoValue}>{new Date(job?.deadline).toLocaleDateString()}</Text>
//             <View style={styles.infoDivider} />
//           </View>

//           <View style={styles.infoBlock}>
//             <Text style={styles.infoLabel}>Created At</Text>
//             <Text style={styles.infoValue}>
//               {new Date(job?.createdAt).toLocaleDateString()}
//             </Text>
//             <View style={styles.infoDivider} />
//           </View>
//         </View>

//         {/* Images if any */}
//         {job?.images?.length > 0 && (
//           <ScrollView horizontal style={{marginVertical: 10}}>
//             {job.images.map((img, index) => (
//               <Image
//                 key={index}
//                 source={{uri: img}}
//                 style={{
//                   width: 200,
//                   height: 120,
//                   marginRight: 10,
//                   borderRadius: 8,
//                 }}
//               />
//             ))}
//           </ScrollView>
//         )}

//         {/* Apply Button */}
//         <View
//           style={{
//             flexDirection: updateJob ? 'row' : 'column',
//             // alignItems: 'center',
//           }}>
//           <TouchableOpacity
//             style={[
//               styles.applyBtn,

//               // Update → primary color
//               updateJob && {backgroundColor: '#6264A7'},

//               // Applied → gray
//               !updateJob && job?.apply_status && {backgroundColor: '#ccc'},

//               // Apply (only if updateJob === false and not my job) → primary color
//               updateJob === false &&
//                 job?.is_my_job === false &&
//                 !job?.apply_status && {
//                   backgroundColor: '#6264A7',
//                 },

//               // Make Update button share space with delete button
//               updateJob && {flex: 1},
//             ]}
//             onPress={() => {
//               if (updateJob) {
//                 navigation.navigate('JobDetailS', {
//                   job: job,
//                   updateJob: updateJob,
//                 });
//               } else if (
//                 !updateJob &&
//                 job?.is_my_job === false &&
//                 !job?.apply_status
//               ) {
//                 handleApplyClick();
//               }
//             }}>
//             <Text style={styles.applyText}>
//               {updateJob
//                 ? 'Update'
//                 : job?.apply_status
//                 ? job?.apply_status
//                 : updateJob === false && job.is_my_job === false
//                 ? 'Apply'
//                 : ''}
//             </Text>
//           </TouchableOpacity>

//           {updateJob && (
//             <TouchableOpacity
//               style={[
//                 styles.delButton,
//                 {backgroundColor: 'red', marginLeft: 10, flex: 1},
//               ]}
//               disabled={!updateJob && job?.apply_status}
//               onPress={() => setDeleteModalVisible(true)}>
//               <Text style={styles.applyText}>Delete</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Confirmation modal before delete */}
//         <CustomModal
//           visible={deleteModalVisible}
//           title="Confirm Delete"
//           message="Are you sure you want to delete this job?"
//           buttonText="Cancel"
//           confirmText="Delete"
//           onClose={() => setDeleteModalVisible(false)}
//           onConfirm={handleDelete}
//         />

//         {/* Result modal after delete attempt */}
//         <CustomModal
//           visible={resultModalVisible}
//           title={modalTitle}
//           message={modalMessage}
//           buttonText="OK"
//           onClose={() => setResultModalVisible(false)}
//         />
//       </ScrollView>
//       <BottomTabBar />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#fff', padding: 16},

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   backButton: {
//     marginBottom: 28,
//     marginTop: 18,
//   },
//   backArrow: {
//     fontSize: 24,
//     color: '#25396F',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginLeft: 10,
//     marginBottom: 15,
//   },

//   titleCardWrapper: {
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 20,
//     marginBottom: 20,
//     position: 'relative',
//   },
//   profileImageWrapper: {
//     position: 'absolute',
//     top: -45,
//     zIndex: 2,
//     elevation: 2,
//   },
//   profileImage: {
//     width: 90,
//     height: 90,
//     borderRadius: 12,
//     borderWidth: 3,
//     borderColor: '#fff',
//   },
//   titleCard: {
//     backgroundColor: '#ccc',
//     alignItems: 'center',
//     width: '100%',
//     height: 80,
//     justifyContent: 'center',
//     zIndex: 1,
//     borderRadius: 10,
//     paddingTop: 30,
//   },
//   titleText: {fontWeight: 'bold', fontSize: 16},

//   section: {marginBottom: 20},
//   sectionTitle: {fontWeight: 'bold', color: '#25396F', marginBottom: 5},
//   sectionText: {color: '#333'},
//   readMore: {color: '#25396F', fontWeight: 'bold', marginTop: 5},

//   map: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginTop: 8,
//     ...Platform.select({
//       ios: {overflow: 'hidden'},
//       android: {},
//     }),
//   },

//   infoBlock: {marginBottom: 12},
//   infoLabel: {fontWeight: '600', fontSize: 13, color: '#25396F'},
//   infoValue: {fontSize: 13, color: '#444', marginTop: 2},
//   infoDivider: {height: 1, backgroundColor: '#eee', marginTop: 8},

//   chipContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//     marginTop: 5,
//   },
//   chip: {
//     backgroundColor: '#E0E0E0',
//     borderRadius: 20,
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     marginRight: 6,
//     marginBottom: 6,
//   },
//   chipText: {
//     fontSize: 12,
//     color: '#333',
//     fontWeight: '500',
//   },

//   applyBtn: {
//     backgroundColor: '#6264A7',
//     borderRadius: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginVertical: 20,
//     marginBottom: 120,
//   },
//   delButton: {
//     backgroundColor: 'red',
//     borderRadius: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginVertical: 20,
//     marginBottom: 120,
//   },
//   applyText: {color: '#fff', fontWeight: 'bold', fontSize: 16},

//   headerLogo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     resizeMode: 'contain',
//     marginTop: 10,
//     alignSelf: 'flex-end',
//     padding: 10,
//   },
//   profileButton: {marginRight: 10, padding: 10, borderRadius: 8},
//   heading: {
//     marginLeft: 10,
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default JobDetailsScreen;

import React, {useState, useCallback} from 'react'; // ✅ fixed import
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator, // ✅ added for loading state
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import BottomTabBar from './components/BottomNavigaionBar';
import TopBar from './components/TopBar';
import CustomModal from './components/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApply} from '../utils/fetchJobs';

const BASE_URL = 'https://buildio.co.nz/api';

const JobDetailsScreen = ({route, navigation}) => {
  const {job: initialJob, updateJob, pickJob, fromPage} = route.params;

  // ✅ job in state so local updates reflect in UI
  const [job, setJob] = useState(initialJob);
  const [applyLoading, setApplyLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const showResult = useCallback((title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setResultModalVisible(true);
  }, []);

  const descriptionText = job?.description || '';
  const isLongDescription = descriptionText.length > 100;
  const displayedText = showFullDescription
    ? descriptionText
    : descriptionText.slice(0, 100) + (isLongDescription ? '...' : '');

  const region = {
    latitude: parseFloat(job?.address?.lat || '0'),
    longitude: parseFloat(job?.address?.long || '0'),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    try {
      setDeleteModalVisible(false);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${BASE_URL}/jobs/delete/${job.job_id || job.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete job');
      }

      showResult('Success', 'Job deleted successfully');
      setTimeout(() => {
        setResultModalVisible(false);
        navigation.navigate('JobsSection');
      }, 2000);
    } catch (error) {
      showResult(
        'Error',
        error.message || 'Something went wrong. Please try again.',
      );
    }
  }, [job, navigation, showResult]);

  // ─── Apply ─────────────────────────────────────────────────────────────────
  const handleApplyClick = useCallback(async () => {
    try {
      setApplyLoading(true);
      const data = await handleApply(job.job_id || job.id);

      if (data?.status === true) {
        // ✅ update button label locally
        setJob(prev => ({...prev, apply_status: 'applied'}));
        showResult('Success', data.message || 'Applied successfully!');
      } else {
        showResult(
          'Info',
          data?.message || 'You have already applied to this job.',
        );
      }
    } catch (error) {
      showResult(
        'Error',
        error.message || 'Something went wrong while applying.',
      );
    } finally {
      setApplyLoading(false);
    }
  }, [job, showResult]);

  // ─── Cancel ────────────────────────────────────────────────────────────────
  const handleCancelApply = useCallback(async () => {
    try {
      setApplyLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        showResult(
          'Error',
          'Authorization token not found. Please sign in again.',
        );
        return;
      }

      const response = await fetch(
        `${BASE_URL}/jobs/cancel/${job.job_id || job.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      const data = await response.json();

      if (response.ok) {
        // ✅ update button label locally
        setJob(prev => ({...prev, apply_status: null}));
        showResult(
          'Success',
          data.message || 'Application cancelled successfully.',
        );
      } else {
        showResult(
          'Error',
          data.message || 'Failed to cancel. Please try again.',
        );
      }
    } catch (error) {
      showResult('Error', 'Something went wrong. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  }, [job, showResult]);

  // ─── Unified button logic ──────────────────────────────────────────────────
  const isCancelMode =
   fromPage === 'JobList' && (job?.apply_status === 'applied' || job?.apply_status === 'pending');

  const getButtonLabel = () => {
    if (updateJob) {
      return 'Update';
    }
    if (isCancelMode && fromPage === 'JobList') {
      return 'Cancel';
    } // shows 'applied' or 'pending'
    if (!job?.is_my_job && fromPage === 'JobList') {
      return 'Apply';
    }
    if (fromPage === 'PickJob') {
      return 'job.apply_status' || 'Applied';
    }
    return job.apply_status;
  };

  const getButtonStyle = () => {
    if (updateJob) {
      return {backgroundColor: '#6264A7'};
    }
    if (isCancelMode) {
      return {backgroundColor: '#ccc'};
    } // applied → gray (matches original)
    if (!job?.is_my_job && fromPage === 'JobList') {
      return {backgroundColor: '#6264A7'};
    } // apply → purple
    return {backgroundColor: '#ccc'};
  };

  // ✅ Only this onPress logic changed — everything else untouched
  const handleActionPress = useCallback(() => {
    if (updateJob) {
      navigation.navigate('JobDetailS', {job, updateJob});
    } else if (isCancelMode) {
      handleCancelApply(); // cancel api hit
    } else if (fromPage === 'JobList') {
      handleApplyClick(); // apply api hit
    }
  }, [
    updateJob,
    isCancelMode,
    fromPage,
    navigation,
    job,
    handleCancelApply,
    handleApplyClick,
  ]);

  return (
    <>
      <TopBar />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header} />

        {/* Title Card */}
        <View style={styles.titleCardWrapper}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={{
                uri: job?.user?.profile_picture || 'https://i.pravatar.cc/100',
              }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.titleCard}>
            <Text style={styles.titleText}>
              {job?.user?.first_name} {job?.user?.last_name} (
              {job?.job_type?.job || 'Job Title'})
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.sectionText}>{displayedText}</Text>
          {isLongDescription && !showFullDescription && (
            <TouchableOpacity onPress={() => setShowFullDescription(true)}>
              <Text style={styles.readMore}>Read more</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>
            {job?.address?.map_text}
          </Text>
          <MapView style={styles.map} initialRegion={region}>
            <Marker coordinate={region} />
          </MapView>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{job?.status}</Text>
            <View style={styles.infoDivider} />
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>${job?.budget}</Text>
            <View style={styles.infoDivider} />
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={styles.infoValue}>
              {new Date(job?.deadline).toLocaleDateString()}
            </Text>
            <View style={styles.infoDivider} />
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Created At</Text>
            <Text style={styles.infoValue}>
              {new Date(job?.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.infoDivider} />
          </View>
        </View>

        {/* Images */}
        {job?.images?.length > 0 && (
          <ScrollView horizontal style={{marginVertical: 10}}>
            {job.images.map((img, index) => (
              <Image
                key={index}
                source={{uri: img}}
                style={styles.jobImage}
              />
            ))}
          </ScrollView>
        )}

        {/* ✅ Action Buttons — only onPress and label/style logic changed */}
        <View style={{flexDirection: updateJob ? 'row' : 'column'}}>
          <TouchableOpacity
            style={[styles.applyBtn, getButtonStyle(), updateJob && {flex: 1}]}
            onPress={handleActionPress}
            disabled={applyLoading}>
            {applyLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyText}>{getButtonLabel()}</Text>
            )}
          </TouchableOpacity>

          {updateJob && (
            <TouchableOpacity
              style={[
                styles.delButton,
                {backgroundColor: 'red', marginLeft: 10, flex: 1},
              ]}
              onPress={() => setDeleteModalVisible(true)}>
              <Text style={styles.applyText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Confirm Delete Modal */}
        <CustomModal
          visible={deleteModalVisible}
          title="Confirm Delete"
          message="Are you sure you want to delete this job?"
          buttonText="Cancel"
          confirmText="Delete"
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDelete}
        />

        {/* Result Modal */}
        <CustomModal
          visible={resultModalVisible}
          title={modalTitle}
          message={modalMessage}
          buttonText="OK"
          onClose={() => setResultModalVisible(false)}
        />
      </ScrollView>
      <BottomTabBar />
    </>
  );
};

// ✅ styles completely unchanged
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  backButton: {marginBottom: 28, marginTop: 18},
  backArrow: {fontSize: 24, color: '#25396F'},
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
  titleText: {fontWeight: 'bold', fontSize: 16},
  section: {marginBottom: 20},
  sectionTitle: {fontWeight: 'bold', color: '#25396F', marginBottom: 5},
  sectionText: {color: '#333'},
  readMore: {color: '#25396F', fontWeight: 'bold', marginTop: 5},
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    ...Platform.select({ios: {overflow: 'hidden'}, android: {}}),
  },
  infoBlock: {marginBottom: 12},
  infoLabel: {fontWeight: '600', fontSize: 13, color: '#25396F'},
  infoValue: {fontSize: 13, color: '#444', marginTop: 2},
  infoDivider: {height: 1, backgroundColor: '#eee', marginTop: 8},
  chipContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 5},
  chip: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {fontSize: 12, color: '#333', fontWeight: '500'},
  applyBtn: {
    backgroundColor: '#6264A7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 120,
  },
  delButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 120,
  },
  applyText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  headerLogo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 10,
    alignSelf: 'flex-end',
    padding: 10,
  },
  profileButton: {marginRight: 10, padding: 10, borderRadius: 8},
  heading: {marginLeft: 10, fontSize: 18, fontWeight: 'bold'},
  jobImage: {
    width: 200,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
  },
});

export default JobDetailsScreen;

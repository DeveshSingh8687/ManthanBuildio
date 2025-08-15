import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {height} = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

export default function WelcomeScreen3() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = async () => {
    navigation.navigate('HomeScreen');
    await AsyncStorage.setItem('prefs:hasSeenIntro', 'true');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Buildio</Text>
      <Text style={styles.subheading}>
        Find Work or Post Projects in the Construction Industry
      </Text>
      <Image
        source={require('../assets/walkthrough3.png')}
        style={styles.image}
      />

      <Pressable
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={({pressed}) => [
          styles.button,
          {
            backgroundColor: pressed || isPressed ? '#6264A7' : '#E0E0E0',
          },
        ]}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2F4A',
    textAlign: 'center',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: '65%',
    marginTop: 100,
  },
  buttonText: {
    color: '#707070',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

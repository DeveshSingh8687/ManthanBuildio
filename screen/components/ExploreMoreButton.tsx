import React from 'react';
import {
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';

interface ExploreMoreButtonProps {
  onPress: () => void;
}

const ExploreMoreButton: React.FC<ExploreMoreButtonProps> = ({ onPress }) => {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1581090700227-1e8e5fcd2392?auto=format&fit=crop&w=800&q=60',
      }}
      style={styles.exploreCard}
      imageStyle={styles.imageBackground}
    >
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Know More</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default ExploreMoreButton;

const styles = StyleSheet.create({
  exploreCard: {
    // height: 100,
    borderRadius: 12,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageBackground: {
    borderRadius: 12,
  },
  button: {
    backgroundColor: '#3F51B5',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
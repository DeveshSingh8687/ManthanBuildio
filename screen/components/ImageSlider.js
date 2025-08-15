import React, {useState, useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  Dimensions,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = 250;

const ImageSlider = ({images}) => {
  const [imageDimensions, setImageDimensions] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadImages = async () => {
      const promises = images.map(img => {
        const uri = typeof img === 'string' ? img : img?.url;

        return new Promise(resolve => {
          Image.getSize(
            uri,
            (width, height) => resolve({uri, width, height}),
            () => resolve({uri, width: screenWidth, height: screenHeight}), // fallback
          );
        });
      });

      const dimensions = await Promise.all(promises);
      setImageDimensions(dimensions);
    };

    loadImages();
  }, [images]);

  if (!images || images.length === 0) {
    return <Text style={styles.noImageText}>No images found</Text>;
  }

  if (imageDimensions.length === 0) {
    return (
      <ActivityIndicator size="large" color="#999" style={{marginTop: 20}} />
    );
  }

  return (
    <View>
      {/* Image Slider */}
      <Animated.ScrollView
        horizontal
        pagingEnabled // ensures it snaps to the next image
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false}, // must be false for width/height animations
        )}
        scrollEventThrottle={16}>
        {imageDimensions.map((img, index) => {
          const isPortrait = img.height > img.width;

          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const imageStyle = isPortrait
            ? {
                width: screenWidth / 2,
                height: screenHeight,
                borderRadius: 0,
              }
            : {
                width: screenWidth + 5,
                height: screenHeight,
                borderRadius: 0,
              };

          const wrapperStyle = {
            justifyContent: 'center',
            alignItems: isPortrait ? 'flex-start' : 'center',
            paddingLeft: isPortrait ? 70 : 0,
            marginRight: 0,
            width: screenWidth-50,
          };

          return (
            <View key={index} style={wrapperStyle}>
              <Animated.Image
                source={{uri: img.uri}}
                style={[imageStyle, {transform: [{scale}]}]}
                resizeMode="cover"
              />
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Dot Indicators */}
   {imageDimensions.length > 1 && (
  <View style={styles.dotContainer}>
    {imageDimensions.map((_, i) => {
      const dotWidth = scrollX.interpolate({
        inputRange: [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
        outputRange: [8, 16, 8],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={i}
          style={[styles.dot, { width: dotWidth }]}
        />
      );
    })}
  </View>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    marginTop: 10,
  },
  noImageText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
});

export default ImageSlider;

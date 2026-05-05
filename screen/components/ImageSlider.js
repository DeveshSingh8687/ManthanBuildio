import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Animated,
  Image,
  Dimensions,
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;
const screenHeight = 250;
// const FastImageComponent = FastImage as any; // if using TypeScript


// ✅ Cache to avoid re-fetching dimensions for same URIs
const dimensionCache = new Map();

const ImageSlider = React.memo(({images}) => {
  const [imageDimensions, setImageDimensions] = useState([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // ✅ Preload images using FastImage
  useEffect(() => {
    if (!images?.length) return;

    const uris = images.map(img => ({
      uri: typeof img === 'string' ? img : img?.url,
      priority: FastImage.priority.high,
    }));

    FastImage.preload(uris);
  }, [images]);

  useEffect(() => {
    if (!images?.length) return;

    const loadImages = async () => {
      const promises = images.map(img => {
        const uri = typeof img === 'string' ? img : img?.url;

        // ✅ Return cached dimensions immediately
        if (dimensionCache.has(uri)) {
          return Promise.resolve(dimensionCache.get(uri));
        }

        return new Promise(resolve => {
          // ✅ Set placeholder immediately so UI doesn't block
          const fallback = {uri, width: screenWidth, height: screenHeight};

          Image.getSize(
            uri,
            (width, height) => {
              const result = {uri, width, height};
              dimensionCache.set(uri, result); // ✅ Cache it
              resolve(result);
            },
            () => {
              dimensionCache.set(uri, fallback);
              resolve(fallback);
            },
          );
        });
      });

      // ✅ Show images as they load instead of waiting for all
      promises.forEach(async (promise, index) => {
        const dim = await promise;
        setImageDimensions(prev => {
          const updated = [...prev];
          updated[index] = dim;
          return updated;
        });
      });
    };

    loadImages();
  }, [images]);

  // ✅ Memoized render to avoid re-renders
  const renderItem = useCallback(
    ({item: img, index}) => {
      if (!img) {
        // ✅ Placeholder while this image loads
        return (
          <View style={[styles.placeholder, {width: screenWidth - 50}]}>
            <View style={styles.shimmer} />
          </View>
        );
      }

      const isPortrait = img.height > img.width;

      const inputRange = [
        (index - 1) * (screenWidth - 50),
        index * (screenWidth - 50),
        (index + 1) * (screenWidth - 50),
      ];

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: 'clamp',
      });

      return (
        <View
          style={{
            width: screenWidth - 50,
            justifyContent: 'center',
            alignItems: isPortrait ? 'flex-start' : 'center',
            paddingLeft: isPortrait ? 70 : 0,
          }}>
          <Animated.View style={{transform: [{scale}]}}>
            {/* ✅ FastImage: persistent cache, faster decode */}
            <FastImage
              source={{
                uri: img.uri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={{
                width: isPortrait ? screenWidth / 2 : screenWidth + 5,
                height: screenHeight,
                borderRadius: 0,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </Animated.View>
        </View>
      );
    },
    [scrollX],
  );

  if (!images || images.length === 0) {
    return <Text style={styles.noImageText}>No images found</Text>;
  }

  // ✅ Fill array with nulls so FlatList renders placeholders immediately
  const data =
    imageDimensions.length > 0
      ? images.map((_, i) => imageDimensions[i] || null)
      : images.map(() => null);

  return (
    <View>
      {/* ✅ FlatList instead of ScrollView — only renders visible images */}
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled={false}
        snapToInterval={screenWidth - 50}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: screenWidth - 50,
          offset: (screenWidth - 50) * index,
          index,
        })}
        initialNumToRender={1}        // ✅ Only render first image initially
        maxToRenderPerBatch={2}       // ✅ Render 2 at a time
        windowSize={3}                // ✅ Keep 3 images in memory
        removeClippedSubviews={true}  // ✅ Unmount off-screen images
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
      />

      {/* Dot Indicators */}
      {images.length > 1 && (
        <View style={styles.dotContainer}>
          {images.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * (screenWidth - 50),
                i * (screenWidth - 50),
                (i + 1) * (screenWidth - 50),
              ],
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View key={i} style={[styles.dot, {width: dotWidth}]} />
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  noImageText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  placeholder: {
    height: screenHeight,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  shimmer: {
    flex: 1,
    backgroundColor: '#ececec',
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
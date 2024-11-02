import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { ProgressBar } from 'react-native-paper';

const moodIcons = {
  1: { image: require('../pic/emo_awful.png'), name: 'Awful', color: '#fe6667' },
  2: { image: require('../pic/emo_bad.png'), name: 'Bad', color: '#ffa648' },
  3: { image: require('../pic/emo_meh.png'), name: 'Meh', color: '#71b5e6' },
  4: { image: require('../pic/emo_good.png'), name: 'Good', color: '#a4d653' },
  5: { image: require('../pic/emo_great.png'), name: 'Great', color: '#41c7a4' },
};

const MoodStatistics = ({ moodData }) => {
  const moodCounts = Object.values(moodData).reduce((acc, { mood }) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const totalMoods = Object.keys(moodCounts).reduce((sum, key) => sum + moodCounts[key], 0);

  const sortedMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <View style={styles.container}>
      {sortedMoods.map(([mood, count]) => (
        <View key={mood} style={styles.moodRow}>
          <ShakingImage source={moodIcons[mood].image} />
          <Text style={styles.moodText}>{moodIcons[mood].name}</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={count / totalMoods}
              color={moodIcons[mood].color}
              style={styles.progressBar}
            />
          </View>
          <Text style={styles.percentageText}>{((count / totalMoods) * 100).toFixed(1)}%</Text>
        </View>
      ))}
    </View>
  );
};

const ShakingImage = ({ source }) => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [shakeAnimation]);

  const shakeStyle = {
    transform: [
      {
        translateX: shakeAnimation.interpolate({
          inputRange: [-1, 1],
          outputRange: [-5, 5],
        }),
      },
    ],
  };

  return <Animated.Image source={source} style={[styles.moodImage, shakeStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 5,
    elevation: 3,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  moodImage: {
    marginTop: 1,
    width: 40,
    height: 40,
    marginRight: 5,
  },
  moodText: {
    marginTop: 1,
    flex: 1,
    fontSize: 16,
    color: '#0B0428',
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 3,
    marginRight: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  percentageText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    color: '#666',
  },
});

export default MoodStatistics;

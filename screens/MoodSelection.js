import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const MoodSelection = ({ onSave, selectedDate }) => {
  const navigation = useNavigation();
  const [selectedMood, setSelectedMood] = useState(null);
  const [comment, setComment] = useState('');

  const moods = [
    { value: 1, image: require('../pic/emo_awful.png'), label: 'Awful' },
    { value: 2, image: require('../pic/emo_bad.png'), label: 'Bad' },
    { value: 3, image: require('../pic/emo_meh.png'), label: 'Meh' },
    { value: 4, image: require('../pic/emo_good.png'), label: 'Good' },
    { value: 5, image: require('../pic/emo_great.png'), label: 'Great' },
  ];

  const saveMoodData = async () => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const moodData = {
        mood: selectedMood,
        comment,
        timestamp: new Date(),
      };

      try {
        await setDoc(doc(db, 'users', uid, 'moods', selectedDate), moodData);
        onSave(selectedMood, comment);
      } catch (error) {
        console.error('Error saving mood data: ', error);
      }
    } else {
      console.error('No user is signed in');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>How are you?</Text>

      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <AnimatedMoodIcon
            key={mood.value}
            mood={mood}
            isSelected={selectedMood === mood.value}
            onSelect={() => setSelectedMood(mood.value)}
          />
        ))}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Add a comment..."
        placeholderTextColor="#888"
        multiline
        onChangeText={setComment}
        value={comment}
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          { opacity: selectedMood !== null ? 1 : 0.5 },
        ]}
        onPress={saveMoodData}
        disabled={selectedMood === null}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const AnimatedMoodIcon = ({ mood, isSelected, onSelect }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animation]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <TouchableOpacity
      style={[styles.moodIcon, isSelected && styles.selectedMood]}
      onPress={onSelect}
    >
      <Animated.Image source={mood.image} style={[styles.moodImage, { transform: [{ scale }] }]} />
      <Text style={styles.moodLabel}>{mood.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 30,
    color: '#333',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0B0428',
    fontWeight: 'bold',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  moodIcon: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMood: {
    borderColor: '#8965d4',
  },
  moodImage: {
    width: 60,
    height: 60,
  },
  moodLabel: {
    marginTop: 5,
    textAlign: 'center',
    color: '#333',
  },
  commentInput: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#0B0428',
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MoodSelection;

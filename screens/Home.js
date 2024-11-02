import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ImageBackground, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import MoodSelection from './MoodSelection';
import MoodStatistics from './MoodStatistics';
import { auth, db } from '../config/firebase';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [moodData, setMoodData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewingMood, setIsViewingMood] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const moveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserMoods = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const moodRef = collection(db, 'users', uid, 'moods');
        const q = query(moodRef);
        const querySnapshot = await getDocs(q);
        let moods = {};
        querySnapshot.forEach((doc) => {
          moods[doc.id.split('T')[0]] = doc.data();
        });
        setMoodData(moods);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(fetchUserMoods);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnimation, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(moveAnimation, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    };

    startAnimation();
  }, [moveAnimation]);

  const handleMonthChange = useCallback((month) => {
    setCurrentMonth(month.dateString.slice(0, 7));
  }, []);

  const filteredMoodData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(moodData).filter(([date]) => date.startsWith(currentMonth))
    );
  }, [moodData, currentMonth]);

  const handleDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
    if (moodData[day.dateString]) {
      setIsViewingMood(true);
    } else {
      setIsModalVisible(true);
    }
  }, [moodData]);

  const handleSaveMood = async (mood, comment) => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const moodEntry = { mood, comment };
      const newMoodData = { ...moodData, [selectedDate]: moodEntry };

      try {
        await setDoc(doc(db, 'users', uid, 'moods', selectedDate), moodEntry);
        setMoodData(newMoodData);
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error saving mood data: ', error);
      }
    }
  };

  const handleCloseViewMood = useCallback(() => {
    setIsViewingMood(false);
  }, []);

  const getMoodDetails = (mood) => {
    const moodDetails = {
      1: { image: require('../pic/emo_awful.png'), label: 'Awful' },
      2: { image: require('../pic/emo_bad.png'), label: 'Bad' },
      3: { image: require('../pic/emo_meh.png'), label: 'Meh' },
      4: { image: require('../pic/emo_good.png'), label: 'Good' },
      5: { image: require('../pic/emo_great.png'), label: 'Great' },
    };
    return moodDetails[mood] || {};
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <ImageBackground source={require('../pic/B16.gif')} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <Animated.Image
          source={require('../pic/logo1.png')}
          style={[
            styles.logo,
            {
              transform: [
                {
                  translateY: moveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10], // Adjust the movement distance as needed
                  }),
                },
              ],
            },
          ]}
        />
        <Calendar
          style={styles.calendarStyle}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={{
            ...Object.keys(moodData).reduce((acc, date) => {
              acc[date] = {
                customStyles: {
                  container: {
                    backgroundColor: 'transparent',
                  },
                  text: {
                    color: 'white',
                  },
                },
              };
              return acc;
            }, {}),
            [today]: {
              customStyles: {
                container: {
                  borderWidth: 2,
                  borderColor: 'red',
                  borderRadius: 5,
                },
                text: {
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
            },
          }}
          dayComponent={({ date, state }) => (
            <TouchableOpacity onPress={() => handleDayPress(date)}>
              <View style={[styles.dayContainer, date.dateString === today && styles.todayContainer]}>
                <Text style={[styles.dayText, state === 'disabled' && styles.disabledText]}>
                  {date.day}
                </Text>
                {moodData[date.dateString] && (
                  <Image source={getMoodDetails(moodData[date.dateString].mood).image} style={styles.moodIcon} />
                )}
              </View>
            </TouchableOpacity>
          )}
          markingType={'custom'}
          theme={{
            calendarBackground: '#0B0428',
            textSectionTitleColor: '#ffffff',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            dayTextColor: '#ffffff',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#ffffff',
            arrowColor: 'white',
          }}
        />

        {Object.keys(filteredMoodData).length > 0 ? (
          <MoodStatistics moodData={filteredMoodData} />
        ) : (
          <Text style={styles.noDataText}>No mood data for this month.</Text>
        )}

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <MoodSelection onSave={handleSaveMood} selectedDate={selectedDate} />
        </Modal>

        <Modal
          visible={isViewingMood}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseViewMood}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mood on {selectedDate}</Text>
              {moodData[selectedDate] && (
                <>
                  <Image
                    source={getMoodDetails(moodData[selectedDate].mood).image}
                    style={styles.largeMoodIcon}
                  />
                  <Text style={styles.moodLabel}>{getMoodDetails(moodData[selectedDate].mood).label}</Text>
                  <Text style={styles.modalComment}>{moodData[selectedDate].comment}</Text>
                </>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseViewMood}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  calendarStyle: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#343a40',
    fontWeight: 'bold',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: 'grey',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: 'white',
  },
  disabledText: {
    color: 'gray',
  },
  moodIcon: {
    width: 20,
    height: 20,
    marginTop: 5,
  },
  largeMoodIcon: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  moodLabel: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  noDataText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalComment: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    backgroundColor: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#8965d4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  logo: {
    width: 400,
    height: 60,
    alignSelf: 'center',
    marginBottom: 30,
  }
});

export default HomeScreen;

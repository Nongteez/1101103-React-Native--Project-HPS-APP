import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, Animated } from 'react-native';
import { sendPasswordResetEmail } from '@firebase/auth';
import { auth } from '../config/firebase';
import * as Font from 'expo-font';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position off-screen (300 can be adjusted)

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'Prompt-Regular': require('../assets/fonts/Prompt-Regular.ttf'),
        'Prompt-Bold': require('../assets/fonts/Prompt-Bold.ttf'),
      });
      setFontLoaded(true);
    };

    loadFont();

    // Start the animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert("Forgot Password", "Please enter your email");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Forgot Password", email);
        Alert.alert("Forgot Password", "Password reset email has been sent to your email address");
      })
      .catch((error) => {
        console.error("Forgot Password Error:", error.message);
        Alert.alert("Forgot Password Error", error.message);
      });
  };

  if (!fontLoaded) {
    return null; // หรือแสดง loading indicator
  }

  return (
    <ImageBackground source={require('../assets/B16.gif')} style={styles.background}>
      <View style={styles.container}>
        <Animated.View style={[styles.innerContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>FORGOT PASSWORD</Text>
          <Text style={styles.subtitle}>Enter your email address to reset your password{'\n'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor="#888"
          />

          <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Prompt-Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Prompt-Regular',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#9932CC',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Prompt-Regular',
  },
  link: {
    marginBottom: 20,
  },
  linkText: {
    color: '#9932CC',
    fontSize: 16,
    fontFamily: 'Prompt-Regular',
  },
});

export default ForgotPasswordScreen;

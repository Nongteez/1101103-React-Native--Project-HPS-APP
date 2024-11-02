import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, Animated } from 'react-native';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../config/firebase';
import * as Font from 'expo-font';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current; // Initial position off-screen (300 can be adjusted)

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        'Prompt-Regular': require('../fonts/Prompt-Regular.ttf'),
        'Prompt-Bold': require('../fonts/Prompt-Bold.ttf'),
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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Login error", "Please enter email and password");
      return;
    }
  
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("Login Success");
  
        // Conditional navigation based on the presence of "doc" in the email
        if (email.toLowerCase().includes("admin")) {
          navigation.navigate("AdminTabs");
        } else {
          navigation.navigate("MainTabs");
        }
      })
      .catch((err) => Alert.alert("Login error", err.message));
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  if (!fontLoaded) {
    return null; // หรือแสดง loading indicator
  }

  return (
    <ImageBackground source={require('../pic/B16.gif')} style={styles.background}>
      <View style={styles.container}>
        <Animated.View style={[styles.innerContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Image source={require('../pic/logo.png')} style={styles.logo} />
          <Text style={styles.title}>LOGIN</Text>
          <Text style={styles.subtitle}>Please enter your email and password{'\n'}</Text>
      
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor="#888"
          />

          <View style={[styles.input, styles.passwordContainer]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={secureTextEntry}
              onChangeText={setPassword}
              value={password}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={toggleSecureEntry}>
              <Text style={styles.toggleText}>{secureTextEntry ? 'Show' : 'Hide'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkButton}> Sign Up</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.linkButton}> Forgot Password</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
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
  toggleText: {
    color: '#9932CC',
    marginRight: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#888',
  },
  linkButton: {
    color: '#9932CC',
    fontSize: 14,
    marginLeft: 5,
  },
});

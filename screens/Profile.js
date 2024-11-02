import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { StripeProvider } from '@stripe/stripe-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
//npx react-native-asset
//npm install react-native-vector-icons

const ProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState('https://img.icons8.com/ios-filled/100/000000/user-male-circle.png');
  const [name, setName] = useState('');
  const [newName, setNewName] = useState('');
  const auth = getAuth();
  const storage = getStorage();
  const db = getFirestore();
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setName(user.displayName || 'Anonymous');
        setImage(user.photoURL || 'https://img.icons8.com/ios-filled/100/000000/user-male-circle.png');

        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
            setImage(userData.profilePicture);
          }
        } else {
          setProfilePicture(user.photoURL || '');
        }
      } else {
        navigation.navigate('Login');
      }
    });

    return unsubscribe;
  }, [auth, db, navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      handleImagePicked(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      handleImagePicked(result.assets[0].uri);
    }
  };

  const handleImagePicked = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const userId = auth.currentUser.uid;
      const imageName = `${userId}_${new Date().getTime()}`;

      const storageRef = ref(storage, `profilePictures/${userId}/${imageName}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const profilePictureUrl = await getDownloadURL(snapshot.ref);

      await setDoc(doc(db, 'users', userId), { profilePicture: profilePictureUrl }, { merge: true });

      await updateProfile(auth.currentUser, { photoURL: profilePictureUrl });

      setProfilePicture(profilePictureUrl);
      setImage(profilePictureUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleUpdateUsername = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: newName });

      await setDoc(doc(db, 'users', auth.currentUser.uid), { username: newName }, { merge: true });

      setName(newName);
      setNewName('');
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate('Login');
    }).catch((error) => {
      console.error("Error signing out:", error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    });
  };

  return (
    <StripeProvider publishableKey="your-stripe-publishable-key">
        <View style={styles.container}>
          <Image source={{ uri: image }} style={styles.icon} />
          <Text style={styles.text}>{name}</Text>
          <TextInput 
            style={styles.input}
            placeholder="New Username"
            value={newName}
            onChangeText={setNewName}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
            <Ionicons name="pencil" size={24} color="white" />
            <Text style={styles.buttonText}>Update Username</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Ionicons name="image" size={24} color="white" />
            <Text style={styles.buttonText}>Upload Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="white" />
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 25,
    marginTop: 60,
    bottom: 100,
    backgroundColor: 'red',
    
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    backgroundColor: '#dcd9f4',
  },
  text: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
    fontFamily: 'Prompt-Regular',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#dcd9f4',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Prompt-Regular',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 50,
    backgroundColor: '#3C0FB2',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: 40,
    backgroundColor: '#0B0428', //#0B0428
    justifyContent: 'center',
    borderRadius: 5,
    fontFamily: 'Prompt-Bold',

  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Prompt-Regular',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: -20,
    padding: 10,
    backgroundColor: '#0B0428',
    alignItems: 'center',
    borderRadius: 100,
    width: '80%',
    height: '40',
  },
});

export default ProfileScreen;

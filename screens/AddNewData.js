import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Button, Keyboard, Image, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { firebase, storage } from '../config/firebase'; // Adjust according to your configuration file
import * as ImagePicker from 'expo-image-picker';

const EditmovieScreen = ({ navigation, image, userId }) => {
  const movieCollection = firebase.firestore().collection('movie');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // State for the user being edited
  const [newName, setNewName] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [MovieAndAnimetionPictures, setMovieAndAnimetionPictures] = useState(image || ''); // Initialize as an empty string
  const [imageUrl, setImageUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = movieCollection.onSnapshot(
      (querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const { name, Author, description, image } = doc.data();
          usersList.push({
            id: doc.id,
            name,
            Author,
            description,
            image
          });
        });
        setUsers(usersList);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const startEditing = (user) => {
    setEditingUser(user.id);
    setNewName(user.name);
    setNewAuthor(user.Author);
    setNewDescription(user.description);
    setMovieAndAnimetionPictures(user.image);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setNewName('');
    setNewAuthor('');
    setNewDescription('');
    setMovieAndAnimetionPictures('');
  };

  const saveEdit = async (MovieAndAnimetionPicturesUrl) => {
    if (editingUser) {
      try {
        await movieCollection.doc(editingUser).update({
          name: newName,
          Author: newAuthor,
          description: newDescription,
          image: MovieAndAnimetionPicturesUrl || MovieAndAnimetionPictures,
        });
        console.log('Document successfully updated!');
        cancelEditing();
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    }
  };

  const addField = async (MovieAndAnimetionPicturesUrl) => {
    if (newName && newAuthor && newDescription && MovieAndAnimetionPicturesUrl) {
      const data = {
        name: newName,
        Author: newAuthor,
        description: newDescription,
        image: MovieAndAnimetionPicturesUrl,
        userId: `m${users.length + 1 < 10 ? '0' + (users.length + 1) : users.length + 1}`,
      };
      try {
        await movieCollection.add(data);
        cancelEditing();
      } catch (error) {
        alert(error);
      }
    } else {
      alert('Please fill out all fields.');
    }
  };

  useEffect(() => {
    setMovieAndAnimetionPictures(image);
  }, [image]);

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

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();

        const imageName = `${userId}_${new Date().getTime()}`;

        const ref = firebase.storage().ref().child(`MovieAndAnimetionPictures/${imageName}`);
        const snapshot = await ref.put(blob);
        const MovieAndAnimetionPicturesUrl = await snapshot.ref.getDownloadURL();

        setMovieAndAnimetionPictures(MovieAndAnimetionPicturesUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleImageUrlChange = async () => {
    if (imageUrl) {
      setMovieAndAnimetionPictures(imageUrl);
      if (editingUser) {
        try {
          await firebase.firestore().collection('movie').doc(editingUser).update({ image: imageUrl });
          setImageUrl('');
        } catch (error) {
          console.error("Error updating image URL:", error);
          alert('Failed to update image URL. Please try again.');
        }
      }
    }
  };

  const handleConfirm = async () => {
    if (editingUser) {
      await saveEdit(MovieAndAnimetionPictures);
    } else {
      await addField(MovieAndAnimetionPictures);
    }
    setModalVisible(false);
  };

  const deleteUser = async (id) => {
    try {
      await movieCollection.doc(id).delete();
      console.log('Document successfully deleted!');
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.section1}>
        <Text style={[styles.text, { textAlign: 'center' }]}>MOVIE & ANIMATION</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {users.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.profileImage} />
            {editingUser === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Movie Name"
                />
                <TextInput
                  style={styles.input}
                  value={newAuthor}
                  onChangeText={setNewAuthor}
                  placeholder="Author"
                />
                <TextInput
                  style={styles.input}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Description"
                />
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                  <Text style={styles.buttonText}>Edit Image</Text>
                </TouchableOpacity>
                <Button title="Save" onPress={handleConfirm} />
                <Button title="Cancel" onPress={cancelEditing} />
              </>
            ) : (
              <>
                <Text>Movie Name: {item.name}</Text>
                <Text>Author: {item.Author}</Text>
                <Text>Description: {item.description}</Text>
                <TouchableOpacity style={styles.button} onPress={() => startEditing(item)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <Button title="Delete" onPress={() => deleteUser(item.id)} color="#665A9E" />
              </>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <Image source={{ uri: MovieAndAnimetionPictures }} style={styles.modalImage} />
          <Button title="Upload from Gallery" onPress={pickImage} />
          <Text style={styles.modalText}>or</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
          <Button title="Use URL" onPress={handleImageUrlChange} />
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Movie Name"
          />
          <TextInput
            style={styles.input}
            value={newAuthor}
            onChangeText={setNewAuthor}
            placeholder="Author"
          />
          <TextInput
            style={styles.input}
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Description"
          />
          <Button title="Confirm" onPress={handleConfirm} />
        </View>
      </Modal>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
    </View>
  );
};

styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  section1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8678c1',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8678c1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    position: 'absolute',
    top: 650,
    left: 270,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 4,
  },
  backButtonText: {
    marginLeft: 5,
    color: 'white',
    
  },
  scrollViewContainer: {
    paddingBottom: 100,
  },
  itemContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#8678c1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
  },
  formContainer: {
    marginVertical: 20,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 20,
  },
});

export default EditmovieScreen;

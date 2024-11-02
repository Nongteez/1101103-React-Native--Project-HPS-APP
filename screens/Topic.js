import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image, Animated } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TopicScreen = () => {
  const [topics, setTopics] = useState([]);
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [editText, setEditText] = useState('');
  const scrollViewRef = useRef();
  const moveAnimation = useRef(new Animated.Value(0)).current;
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName || generateRandomUsername();
        setUser({
          uid: user.uid,
          displayName,
        });
      } else {
        setUser(null);
      }
    });

    const q = query(collection(db, 'topics'), orderBy('createdAt', 'asc'));
    const unsubscribeTopics = onSnapshot(q, (querySnapshot) => {
      const topics = querySnapshot.docs.map((doc) => {
        const firebaseData = doc.data();
        const data = {
          id: doc.id,
          likes: [],
          comments: [],
          ...firebaseData,
          user: {
            id: firebaseData.user.id,
            name: firebaseData.user.name,
          },
        };
        return data;
      });

      setTopics(topics);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTopics();
    };
  }, []);

  const generateRandomUsername = () => {
    const adjectives = ["Cool", "Super", "Happy", "Funky", "Brave"];
    const nouns = ["Tiger", "Eagle", "Lion", "Panther", "Wolf"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}`;
  };

  const handleImagePick = async (source) => {
    let result;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (source === 'gallery') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need gallery permissions to make this work!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (inputText.trim() === '' && !image) {
      return;
    }

    if (!user) {
      alert('You must be logged in to post a topic');
      return;
    }

    let imageUrl = null;
    const imageName = `${user.uid}_${new Date().getTime()}`;

    if (image) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();

        const storageRef = ref(getStorage(), `TopicPictures/${imageName}`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error('Error uploading image: ', error);
        alert('Failed to upload image');
        return;
      }
    }

    const newTopic = {
      text: inputText,
      imageUrl,
      createdAt: new Date().getTime(),
      user: {
        id: user.uid,
        name: user.displayName,
      },
      likes: [],
      comments: [],
    };

    try {
      await addDoc(collection(db, 'topics'), newTopic);
      setInputText('');
      setImage(null);
      setModalVisible(false);
      scrollViewRef.current.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error posting topic: ', error);
    }
  };

  const handleLike = async (topicId) => {
    if (!user) {
      alert('You must be logged in to like a topic');
      return;
    }

    const topicRef = doc(db, 'topics', topicId);
    const topic = topics.find((t) => t.id === topicId);
    const userId = user.uid;

    const likes = topic.likes.includes(userId)
      ? topic.likes.filter((id) => id !== userId)
      : [...topic.likes, userId];

    try {
      await updateDoc(topicRef, { likes });
    } catch (error) {
      console.error('Error liking topic: ', error);
    }
  };

  const handleComment = async (topicId, commentText) => {
    if (!user) {
      alert('You must be logged in to comment');
      return;
    }

    const topicRef = doc(db, 'topics', topicId);
    const topic = topics.find((t) => t.id === topicId);
    const newComment = {
      text: commentText,
      user: {
        id: user.uid,
        name: user.displayName,
      },
      createdAt: new Date().getTime(),
    };

    try {
      await updateDoc(topicRef, { comments: [...topic.comments, newComment] });
    } catch (error) {
      console.error('Error commenting on topic: ', error);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) {
      return;
    }

    const topicRef = doc(db, 'topics', editTopic.id);

    try {
      await updateDoc(topicRef, { text: editText });
      setEditModalVisible(false);
      setEditTopic(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing topic: ', error);
    }
  };

  const handleDelete = async (topicId) => {
    if (!user) {
      alert('You must be logged in to delete a topic');
      return;
    }

    const topicRef = doc(db, 'topics', topicId);

    Alert.alert(
      'Delete Topic',
      'Are you sure you want to delete this topic?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(topicRef);
            } catch (error) {
              console.error('Error deleting topic: ', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteComment = async (topicId, commentIndex) => {
    if (!user) {
      alert('You must be logged in to delete a comment');
      return;
    }

    const topicRef = doc(db, 'topics', topicId);
    const topic = topics.find((t) => t.id === topicId);
    const updatedComments = topic.comments.filter((_, index) => index !== commentIndex);

    try {
      await updateDoc(topicRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../pic/topic1.png')}
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
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.topicsContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff"  />
        ) : (
          topics.map((topic) => (
            <View key={topic.id} style={styles.topicCard}>
            
              <Text style={styles.topicUser}> {topic.user.name}</Text>
              {topic.imageUrl && <Image source={{ uri: topic.imageUrl }} style={styles.topicImage} />}
              
              <View style={styles.topicFooter}>
                <TouchableOpacity onPress={() => handleLike(topic.id)} style={styles.iconButton}>
                  <Ionicons name={topic.likes.includes(user?.uid) ? 'heart' : 'heart-outline'} size={24} color="#EA6B6E" />
                  <Text style={styles.iconText}>{topic.likes.length}</Text>
                </TouchableOpacity>
                
                {user && user.uid === topic.user.id && (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditTopic(topic);
                        setEditText(topic.text);
                        setEditModalVisible(true);
                      }}
                      style={styles.iconButton}
                    >
                      <Ionicons name="pencil-outline" size={24} color="#786bbc"  style={styles.pen}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(topic.id)} style={styles.iconButton}>
                      <Ionicons name="trash-outline" size={24} color="#ccc" />
                    </TouchableOpacity>
                  </>
                )}
                
              </View>
              <Text style={styles.topicText}>{topic.text}</Text>
              <View style={styles.commentsContainer}>
                {topic.comments.map((comment, index) => (
                  <View key={index} style={styles.comment}>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentUser}>- {comment.user.name}</Text>
                      {user && user.uid === comment.user.id && (
                        <TouchableOpacity onPress={() => handleDeleteComment(topic.id, index)} style={styles.iconButton}>
                          <Ionicons name="trash-outline" size={16} color="#ccc" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={(event) => {
                  handleComment(topic.id, event.nativeEvent.text);
                  setCommentText('');
                }}
              />
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-outline" size={36} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Topic</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your topic..."
              value={inputText}
              onChangeText={setInputText}
            />
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
            <View style={styles.imagePickerButtons}>
              <TouchableOpacity style={styles.imagePickerButton} onPress={() => handleImagePick('camera')}>
                <Text style={styles.imagePickerButtonText}>Take a photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePickerButton} onPress={() => handleImagePick('gallery')}>
                <Text style={styles.imagePickerButtonText}>Pick from gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={handlePost}>
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Topic</Text>
            <TextInput
              style={styles.input}
              placeholder="Edit your topic..."
              value={editText}
              onChangeText={setEditText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dcd9f4',
  },
  topicsContainer: {
    padding: 20,
  },
  topicCard: {
    backgroundColor: '#eeeef4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000', // สีของเงา
    shadowOffset: { width: 0, height: 2 }, // การเลื่อนของเงา
    shadowOpacity: 0.8, // ความทึบของเงา
    shadowRadius: 2, // รัศมีของเงา
    elevation: 5, // การยกระดับของเงา (สำหรับ Android)
  },
  topicText: {
    fontSize: 15,
    marginBottom: 10,
    top: 4,
    left: 5,
    color:'#5A5959'
  },
  topicImage: {
    width: 353,
    height: 200,
    borderRadius: 0,
    marginBottom: 15,
    top: 0,
    left: -15,
  },
  pen: {
    left: 95,
    
  },

  topicUser: {
    fontSize: 14,
    color: '#2B234C',
    marginBottom: 10,
    top: 0,
    
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    
    
  },
  iconText: {
    marginLeft: 5,
  },
  commentsContainer: {
    marginTop: 10,
  },
  comment: {
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    
  },
  
  commentText: {
    fontSize: 14,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    fontSize: 12,
    color: '#666',
  },
  commentInput: {
    marginTop: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#786bbc',
    borderRadius: 50,
    padding: 15,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  imagePickerButtonText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logo: {
    width: 400,
    height: 120,
    alignSelf: 'center',
    marginBottom: 0,
    top: 15,
    
  },
});

export default TopicScreen;

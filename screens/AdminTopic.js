// screens/TopicScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const AdminTopicScreen = () => {
  const [topics, setTopics] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [editText, setEditText] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const q = query(collection(db, 'topics'), orderBy('createdAt', 'asc'));
    const unsubscribeTopics = onSnapshot(q, (querySnapshot) => {
      const topics = querySnapshot.docs.map(doc => {
        const firebaseData = doc.data();

        const data = {
          id: doc.id,
          likes: [],
          comments: [],
          ...firebaseData
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

  const handlePost = async () => {
    if (inputText.trim() === '') {
      return;
    }

    if (!user) {
      alert('You must be logged in to post a topic');
      return;
    }

    const newTopic = {
      text: inputText,
      createdAt: new Date().getTime(),
      user: {
        id: user.uid,
        name: user.displayName || 'Anonymous',
      },
      likes: [],
      comments: []
    };

    try {
      await addDoc(collection(db, 'topics'), newTopic);
      setInputText('');
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
    const topic = topics.find(t => t.id === topicId);
    const userId = user.uid;

    const likes = topic.likes.includes(userId)
      ? topic.likes.filter(id => id !== userId)
      : [...topic.likes, userId];

    try {
      await updateDoc(topicRef, { likes });
    } catch (error) {
      console.error('Error liking topic: ', error);
    }
  };

  const handleComment = async (topicId, commentText) => {
    setInputText('');
    if (!user) {
      alert('You must be logged in to comment');
      return;
    }
  
    const topicRef = doc(db, 'topics', topicId);
    const topic = topics.find(t => t.id === topicId);
    const newComment = {
      text: commentText,
      user: {
        id: user.uid,
        name: user.displayName || 'Anonymous',
      },
      createdAt: new Date().getTime()
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

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.topicsContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            topics.map((topic) => (
                <View key={topic.id} style={styles.topicCard}>
                  <Text style={styles.topicText}>{topic.text}</Text>
                  <View style={styles.topicFooter}>
                    <View style={styles.iconContainer}>
                      <TouchableOpacity onPress={() => handleLike(topic.id)} style={styles.iconButton}>
                        <Ionicons name={topic.likes.includes(user?.uid) ? "heart" : "heart-outline"} size={24} color="#e74c3c" />
                        <Text style={styles.iconText}>{topic.likes.length}</Text>
                      </TouchableOpacity>
                      {/* ตรวจสอบว่ามีผู้ใช้เข้าสู่ระบบหรือไม่ ถ้ามีให้แสดงปุ่มลบ */}
                      {user && (
                        <>
                          <TouchableOpacity 
                            onPress={() => {
                              setEditTopic(topic);
                              setEditText(topic.text);
                              setEditModalVisible(true);
                            }} 
                            style={styles.iconButton}
                          >
                            <Ionicons name="pencil-outline" size={24} color="#f39c12" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(topic.id)} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                    <View style={styles.commentsContainer}>
                      {topic.comments.map((comment, index) => (
                        <View key={index} style={styles.comment}>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentUser}>- {comment.user.name}</Text>
                        </View>
                      ))}
                    </View>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      onSubmitEditing={(event) => handleComment(topic.id, event.nativeEvent.text)}
                    />
                  </View>
                </View>
              )))}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create a New Topic</Text>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Write your topic here..."
              multiline
            />
            <TouchableOpacity style={styles.modalPostButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Topic</Text>
            <TextInput
              style={styles.input}
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit your topic..."
              multiline
            />
            <TouchableOpacity style={styles.modalPostButton} onPress={handleEdit}>
              <Text style={styles.postButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setEditModalVisible(!editModalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topicsContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  topicCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  topicText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  topicFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    marginLeft: 5,
    color: '#333',
  },
  commentsContainer: {
    marginTop: 10,
  },
  comment: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentUser: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
    textAlign: 'right',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2ecc71',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  modalPostButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  modalCloseButton: {
    backgroundColor: '#e74c3c',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    
  },
});

export default AdminTopicScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { firebase } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';

const BookScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const bookCollection = firebase.firestore().collection('book');

  useEffect(() => {
    const unsubscribe = bookCollection.onSnapshot(
      (querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const { name, Author, description, image } = doc.data(); // Add 'image' to retrieve image URL from Firestore
          usersList.push({
            id: doc.id,
            name,
            Author,
            description,
            image,
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
  const showAlert = (description) => {
    Alert.alert(
      "คำอธิบายเพิ่มเติม",
      description,
      [{ text: "ตกลง", style: 'cancel', textStyle: styles.alertButton }],
      { cancelable: false,
        style: 'default',
        titleStyle: { color: 'red' }, // เปลี่ยนสีของหัวข้อ
        messageStyle: { color: 'blue' } // เปลี่ยนสีของข้อความเนื้อหา
      }
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
                colors={['#8678c1', '#7164b6']}
                style={styles.section1}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <Text style={[styles.text, { textAlign: 'center' }]}>BOOK</Text>
                <Text style={[styles.text2, { textAlign: 'center' }]}>หนังสือ</Text>
            </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {users.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
          <View style={styles.scrollViewContainer2}></View>  
            {/* Display the image */}
            <Image source={{ uri: item.image }} style={styles.profileImage} />
            <View style={styles.textContainer}>
              <Text style={styles.textMovie}>Name: {item.name}</Text>
              <Text style={styles.textMovie2}>Author: {item.Author}</Text>
              <Text style={styles.textMovie3}>Description: {item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => showAlert(item.description)}>
              <Text style={styles.textMovie4}>เพิ่มเติม</Text>
              </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#e6e6ee" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#dcd9f4',
      shadowColor: '#000', // สีของเงา
      shadowOffset: { width: 0, height: 2 }, // การเลื่อนของเงา
      shadowOpacity: 1, // ความทึบของเงา
      shadowRadius: 2, // รัศมีของเงา
      elevation: 5, // การยกระดับของเงา (สำหรับ Android)
    }, 
    section1: {
      height: '19%',
          backgroundColor: '#f4ebdc',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderBottomRightRadius: 60,
          borderBottomLeftRadius: 60,
          shadowColor: '#000', // สีของเงา
          shadowOffset: { width: 0, height: 2 }, // การเลื่อนของเงา
          shadowOpacity: 1, // ความทึบของเงา
          shadowRadius: 2, // รัศมีของเงา
          elevation: 5, // การยกระดับของเงา (สำหรับ Android)
    },
    text2: {
      fontSize: 25, // ปรับขนาดตัวอักษร
      color: 'white',
      fontWeight: 'bold',
      lineHeight: 30, // ปรับระยะห่างระหว่างบรรทัด
      marginTop: 0, // เว้นระยะห่างด้านบน
      textShadowColor: 'rgba(0, 0, 0, 0.75)', // สีของเงา
      textShadowOffset: { width: -1, height: 1 }, // ตำแหน่งของเงา
      textShadowRadius: 10, // รัศมีของเงา
  },
  text: {
      fontSize: 20, // ปรับขนาดตัวอักษร
      color: 'white',
      fontWeight: 'bold',
      lineHeight: 30, // ปรับระยะห่างระหว่างบรรทัด
      marginTop: 50, // เว้นระยะห่างด้านบน
      marginBottom: 0, // เว้นระยะห่างด้านล่าง
      textShadowColor: 'rgba(0, 0, 0, 0.75)', // สีของเงา
      textShadowOffset: { width: -1, height: 1 }, // ตำแหน่งของเงา
      textShadowRadius: 10, // รัศมีของเงา
      
  },
    scrollViewContainer: {
      flexGrow: 1,
      backgroundColor: '#dcd9f4',
      alignItems: 'center',
      paddingTop: 20,
      
    },
    scrollViewContainer2: {
      height: 70,
      width: '107%',
      backgroundColor: '#eeeef4',
      paddingTop: 20,
      top: 20,
      borderTopLeftRadius: 20,
          borderTopRightRadius: 10,
           borderBottomRightRadius: 10,
             borderBottomLeftRadius: 10,
               
    },
    itemContainer: {
      height: 220,
      width: '82%',
      backgroundColor: '#dcd9f4',
      borderTopLeftRadius: 20,
          borderTopRightRadius: 5,
           borderBottomRightRadius: 5,
             borderBottomLeftRadius: 5,
      padding: 10,
      marginVertical: 20,
      top: -10,
      marginTop: -10,
     
      
      
    },
    backButton: {
      flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#8678c1',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 30,
          position: 'absolute',
          top: 720,
          left: 250,
          shadowColor: '#000', // สีของเงา
          shadowOffset: { width: 0, height: 1 }, // การเลื่อนของเงา
          shadowOpacity: 0.8, // ความทึบของเงา
          shadowRadius: 1, // รัศมีของเงา
          elevation: 4, // การยกระดับของเงา (สำหรับ Android)
    },
    backButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#e6e6ee',
      marginLeft: 10,
    },
    profileImage: {
      width: 120,
      height: 200,
      marginRight: 10,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
      borderBottomLeftRadius: 5,
      left: -20,
      top: -55,
      shadowColor: '#000', // Shadow color
      shadowOffset: { width: 0, height: 1 }, // Shadow offset
      shadowOpacity: 0.8, // Shadow opacity
      shadowRadius: 1, // Shadow radius
      elevation: 5, // Elevation for Android shadow
         
    },
    textMovie: {
      width: '60%',
      fontSize: 17, // ปรับขนาดตัวอักษร
      color: '#5B4F92',
      fontWeight: 'bold',
      lineHeight: 20, // ปรับระยะห่างระหว่างบรรทัด
      marginTop: 10, // เว้นระยะห่างด้านบน
      marginBottom: 0, // เว้นระยะห่างด้านล่าง
      top: -250,
      left: 110,
  },
  textMovie2: {
    width: '80%',
    fontSize: 12, // ปรับขนาดตัวอักษร
    color: '#8678c1',
    fontWeight: 'bold',
    lineHeight: 13, // ปรับระยะห่างระหว่างบรรทัด
    marginTop: 0, // เว้นระยะห่างด้านบน
    marginBottom: 0, // เว้นระยะห่างด้านล่าง
    top: -250,
      left: 110,
  },
  textMovie3: {
    height: 50,
    width: '60%',
    fontSize: 9, // ปรับขนาดตัวอักษร
    color: '#5B4F92',
    fontWeight: 'bold',
    lineHeight: 13, // ปรับระยะห่างระหว่างบรรทัด
    marginTop: 40, // เว้นระยะห่างด้านบน
    marginBottom: 0, // เว้นระยะห่างด้านล่าง
    top: -250,
      left: 110,
  },
  textMovie4: {
    height: 50,
    width: '60%',
    fontSize: 9, // ปรับขนาดตัวอักษร
    color: '#5B4F92',
    fontWeight: 'bold',
    lineHeight: 13, // ปรับระยะห่างระหว่างบรรทัด
    marginTop: 0, // เว้นระยะห่างด้านบน
    marginBottom: 0, // เว้นระยะห่างด้านล่าง
    top: -250,
      left: 110,
  },
  descriptionButton: {
    width: '70%',
      backgroundColor: '#2ecc71',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
      top: -190,
      left: 110,
  },
  });

export default BookScreen;

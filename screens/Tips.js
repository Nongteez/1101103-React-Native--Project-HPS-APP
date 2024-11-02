import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { firebase } from '../config/firebase';

const Tips = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [selectedName, setSelectedName] = useState(null);

    const tipsCollection = firebase.firestore().collection('tips');

    useEffect(() => {
        const unsubscribe = tipsCollection.onSnapshot(
            (querySnapshot) => {
                const usersList = [];
                querySnapshot.forEach((doc) => {
                    const { name, Author, description, image } = doc.data();
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

    const openModal = (image, description, name) => {
        setSelectedImage(image);
        setSelectedDescription(description);
        setSelectedName(name);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
        setSelectedDescription(null);
        setSelectedName(null);
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
                <Text style={styles.text}>TIPS</Text>
                <Text style={styles.text2}>ทริค</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {users.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.button} onPress={() => openModal(item.image, item.description, item.name)}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <Text style={styles.buttonText2}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Profile")}>
                <AntDesign name="arrowleft" size={24} color="#e6e6ee" />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <AntDesign name="close" size={24} color="#000" />
                        </TouchableOpacity>
                        <ScrollView contentContainerStyle={styles.modalScrollView}>
                            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} />}
                            {selectedName && <Text style={styles.modalTitle}>{selectedName}</Text>}
                            {selectedDescription && <Text style={styles.description}>{selectedDescription}</Text>}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#dcd9f4',
    },
    section1: {
        height: '17%',
        backgroundColor: '#f4ebdc',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 5,
    },
    text2: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 30,
        marginTop: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    text: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 30,
        marginTop: 40,
        marginBottom: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    scrollViewContainer: {
        flexGrow: 1,
        backgroundColor: '#dcd9f4',
        alignItems: 'center',
        paddingVertical: 20,
    },
    button: {
        marginTop: 20,
        width: 350,
        height: 200,
        backgroundColor: '#eeeef4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        resizeMode: 'cover',
    },
    buttonText2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#88888e',
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        elevation: 4,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e6e6ee',
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        zIndex: 1,
    },
    modalScrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    description: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});

export default Tips;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { firebase } from '../config/firebase';

const AddScreen = () => {
    const todoRef = firebase.firestore().collection('movie');
    const [addData, setAddData] = useState('');
    const [title, setTitle] = useState('');

    const addField = () => {
        if (addData && addData.length > 0 && title && title.length > 0) {
            const data = {
                name: addData,
                title: title
            };
            todoRef
                .add(data)
                .then(() => {
                    setAddData('');
                    setTitle('');
                    Keyboard.dismiss();
                })
                .catch((error) => {
                    alert(error);
                });
        } else {
            alert('Please fill out all fields.');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder='Add name'
                    placeholderTextColor='#aaaaaa'
                    onChangeText={(name) => setAddData(name)}
                    value={addData}
                    multiline={true}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.input}
                    placeholder='Add Title'
                    placeholderTextColor='#aaaaaa'
                    onChangeText={(title) => setTitle(title)}
                    value={title}
                    multiline={true}
                    underlineColorAndroid='transparent'
                    autoCapitalize='none'
                />
                <TouchableOpacity style={styles.button} onPress={addField}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        flexDirection: 'row',
        height: 80,
        marginLeft: 10,
        marginRight: 10,
    },
    input: {
        height: 48,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
        paddingLeft: 16,
        flex: 1,
        marginRight: 5,
    },
    button: {
        height: 48,
        borderRadius: 5,
        backgroundColor: '#788eec',
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
});

export default AddScreen;

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const AdminTherapyscreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#8678c1', '#7164b6']}
                style={styles.section1}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <Text style={styles.text}>   Stress</Text>
                <Text style={styles.text2}>   Therapy</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <LinearGradient
                  colors={['#dcd9f4', '#dcd9f4']}
                  style={styles.gradientBackground}
                  start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                  >  
                  <Text style={styles.buttonText3}>category</Text>           
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]}onPress={() => navigation.navigate("AddNewData")}>
                    <Text style={styles.buttonText}>EDIT MOVIE & ANIMATION</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]}onPress={() => navigation.navigate("Editsong")}>
                    <Text style={styles.buttonText}>EDIT SONG</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]}onPress={() => navigation.navigate("Editbook")}>
                    <Text style={styles.buttonText}>EDIT BOOK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]}onPress={() => navigation.navigate("EditEbook")}>
                    <Text style={styles.buttonText}>EDIT E-BOOK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginTop: 10 }]}onPress={() => navigation.navigate("Edittips")}>
                    <Text style={styles.buttonText}>EDIT Tips</Text>
                </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    gradientBackground: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4ebdc',
        width: 400,
        
    },
    
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between', // จัดเรียงให้ส่วนบนและส่วนล่างมีระยะห่างเท่ากัน
        backgroundColor: '#dcd9f4',
        
        
    },
    section1: {
        height: '19%',
        backgroundColor: '#f4ebdc',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
        shadowColor: '#000', // สีของเงา
        shadowOffset: { width: 0, height: 2 }, // การเลื่อนของเงา
        shadowOpacity: 1, // ความทึบของเงา
        shadowRadius: 2, // รัศมีของเงา
        elevation: 5, // การยกระดับของเงา (สำหรับ Android)
        
        
        
    },
    text2: {
        fontSize: 30, // ปรับขนาดตัวอักษร
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 30, // ปรับระยะห่างระหว่างบรรทัด
        marginTop: 0, // เว้นระยะห่างด้านบน
    },
    text: {
        fontSize: 25, // ปรับขนาดตัวอักษร
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 30, // ปรับระยะห่างระหว่างบรรทัด
        marginTop: 20, // เว้นระยะห่างด้านบน
        marginBottom: 0, // เว้นระยะห่างด้านล่าง
    },
    scrollViewContainer: {
        flexGrow: 1,// กำหนดให้ส่วนตรงกลางใหญ่สุด
        backgroundColor: '#9379C2',
        alignItems: 'center', // จัดให้เนื้อหาอยู่ตรงกลาง
    },
    button: {
        marginTop: 20,
        width: 330,
        height: 80,
        backgroundColor: '#eeeef4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        shadowColor: '#000', // สีของเงา
        shadowOffset: { width: 0, height: 2 }, // การเลื่อนของเงา
        shadowOpacity: 0.8, // ความทึบของเงา
        shadowRadius: 2, // รัศมีของเงา
        elevation: 5, // การยกระดับของเงา (สำหรับ Android)
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7164b6',
        
    },buttonText2: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b7aac9',
        
    },
    buttonText3: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#b7aac9',
        marginTop: 10, // เว้นระยะห่างด้านบน
        marginBottom: -15, // เว้นระยะห่างด้านล่าง
        top: 1,
        left: 100,
        
    },
});

export default AdminTherapyscreen;

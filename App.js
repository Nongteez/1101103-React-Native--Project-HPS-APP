import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';

import LoginScreen from './screens/Login';
import SignUpScreen from './screens/Signup';
import ForgotPasswordScreen from './screens/ForgotPassword';
import ProfileScreen from './screens/Profile';
import HomeScreen from './screens/Home';
import TopicScreen from './screens/Topic';
import TherapyScreen from './screens/Therapy';
import TipsScreen from './screens/Tips';
import MAScreen from './screens/MA';
import SongScreen from './screens/Song';
import BookScreen from './screens/Book';
import EbookScreen from './screens/Ebook';
import AdminTherapyscreen from './screens/Admintherapy';
import EditmovieScreen from './screens/AddNewData';
import EditsongScreen from './screens/Editsong';
import EditbookScreen from './screens/Editbook';
import EditEbookScreen from './screens/EditEbook';
import EdittipsScreen from './screens/Edittips';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="hearto" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Topic"
        component={TopicScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="mail" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Therapy"
        component={TherapyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="folder1" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const AdminNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="AdminTherapy"
        component={AdminTherapyscreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="mail" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Topic"
        component={TopicScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Admintabs" component={AdminNavigator} />
        <Stack.Screen name="Tips" component={TipsScreen} />
        <Stack.Screen name="Therapy" component={TherapyScreen} />
        <Stack.Screen name="MA" component={MAScreen} />
        <Stack.Screen name="Song" component={SongScreen} />
        <Stack.Screen name="Book" component={BookScreen} />
        <Stack.Screen name="Ebook" component={EbookScreen} />
        <Stack.Screen name="AddNewData" component={EditmovieScreen} />
        <Stack.Screen name="Editsong" component={EditsongScreen} />
        <Stack.Screen name="Editbook" component={EditbookScreen} />
        <Stack.Screen name="EditEbook" component={EditEbookScreen} />
        <Stack.Screen name="Edittips" component={EdittipsScreen} />
        <Stack.Screen name="AdminTabs" component={AdminNavigator} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

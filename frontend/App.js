import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import SettingsScreen from './screens/SettingsScreen';

import axios from 'axios';

axios.interceptors.request.use(request => {
  console.log('Outgoing request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
}, error => Promise.reject(error));

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
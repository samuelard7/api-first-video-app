import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.12:5000';  

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

 const signup = async () => {
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      name,
      email,
      password
    });  

    console.log('Signup success:', response.data);
    navigation.navigate('Login');
  } catch (err) {
    console.error('Signup error:', err.response?.data || err.message); 
    setError(err.response?.data?.error || 'Something went wrong');
  }
};

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text>{error}</Text>}
      <Button title="Signup" onPress={signup} />
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
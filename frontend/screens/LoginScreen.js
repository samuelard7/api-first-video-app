import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.12:5000';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

 const login = async () => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });

    await SecureStore.setItemAsync('jwt', res.data.token);
    navigation.navigate('Dashboard');
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    setError(err.response?.data?.error || 'Invalid credentials');
  }
};

  return (
    <View style={{ padding: 40 }}>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text>{error}</Text>}
      <Button title="Login" onPress={login} />
      <Button title="Go to Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}
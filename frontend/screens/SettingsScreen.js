import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.12:5000';

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const token = await SecureStore.getItemAsync('jwt');
      const res = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (token) {
        
        await axios.post(`${API_BASE}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(e => console.log('Logout notify failed', e));
      }
    } finally {
      await SecureStore.deleteItemAsync('jwt');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Profile Info</Text>
        <Text style={{ fontSize: 16, marginTop: 10 }}>Name: {user.name}</Text>
        <Text style={{ fontSize: 16 }}>Email: {user.email}</Text>
      </View>
      <Button title="Logout" color="red" onPress={handleLogout} />
    </View>
  );
}
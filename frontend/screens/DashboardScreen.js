import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.12:5000';

export default function DashboardScreen({ navigation }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt');
        const res = await axios.get(`${API_BASE}/dashboard`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setVideos(res.data);
      } catch (e) {
        console.error('Failed to fetch videos', e);
      }
    };
    fetchVideos();
  }, []);

  const openVideo = (video) => {
    navigation.navigate('VideoPlayer', { video });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsLink}>Settings</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openVideo(item)}>
            <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
            <View style={styles.cardContent}>
              <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.videoDescription} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  settingsLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 15,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

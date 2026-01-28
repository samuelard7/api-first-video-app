import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Video } from 'expo-av';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.12:5000'; 

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt');
        if (!token) {
          setError('No authentication token');
          return;
        }

        const response = await fetch(
          `${API_BASE}/video/${video.id}/stream?token=${encodeURIComponent(video.playback_token)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            redirect: 'follow',
          }
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.error || `Server responded ${response.status}`);
        }

        setStreamUrl(response.url);
      } catch (err) {
        console.error('Stream fetch error:', err);
        setError(err.message || 'Failed to load video stream');
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [video.id, video.playback_token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Preparing your stream...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Oops!</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{video.title}</Text>
      </View>
      
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: streamUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay
          isLooping={false}
          useNativeControls={true}
          style={styles.video}
          onError={(e) => console.log('Video error:', e)}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.description}>{video.description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#000',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

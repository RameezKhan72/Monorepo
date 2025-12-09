import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
// We'll use Expo's Link component if you want to navigate, but for a single screen, 
// basic components are enough. We'll stick to basic RN components here.

// Base URL for the Fake Store API product endpoint
const API_URL = 'https://fakestoreapi.com/products/1'; // Hardcoded to fetch Product 1

export default function HomeScreen() {
  // State variables
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading immediately
  const [error, setError] = useState(null);

  /**
   * Fetches the image URL for Product ID 1 immediately when the screen loads.
   */
  const fetchProductImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product (Status: ${response.status})`);
      }

      const json = await response.json();

      if (json && json.image) {
        setImageUrl(json.image);
      } else {
        setError(`Product data found, but no image URL was available.`);
      }

    } catch (e) {
      console.error(e);
      setError(`Error: Could not retrieve product. Please check your network connection.`);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to run the fetch function once when the component mounts
  useEffect(() => {
    fetchProductImage();
  }, []); // Empty dependency array means it runs once

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome! 👋</Text>
        <Text style={styles.subtitle}>Fetched Product Image</Text>
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.statusText}>Fetching image...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.statusBox, styles.errorBox]}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <Button title="Try Again" onPress={fetchProductImage} color="#dc3545" />
          </View>
        )}

        {/* Display the Image */}
        {!loading && imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
        )}

        {!loading && !imageUrl && !error && (
            <Text style={styles.statusText}>No image to display.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#e9f7ff',
    alignItems: 'center',
    width: '100%',
    minHeight: 150,
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#fff0f0',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 350, // Fixed height for visual consistency
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
});
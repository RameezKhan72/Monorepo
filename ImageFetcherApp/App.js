import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';

// Base URL for the Fake Store API product endpoint
const API_URL = 'https://fakestoreapi.com/products';

export default function App() {
  // State variables
  const [productId, setProductId] = useState('1'); // We will fetch a single product by ID
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches the image URL for a single product from the Fake Store API.
   */
  const fetchProductImage = async () => {
    // Basic validation
    if (!productId.trim() || isNaN(productId)) {
      Alert.alert('Invalid ID', 'Please enter a valid product number (e.g., 1, 5, 10).');
      return;
    }

    setLoading(true);
    setImageUrl(null);
    setError(null);

    // Construct the API URL to fetch a single product by ID
    const productURL = `${API_URL}/${productId}`;

    try {
      const response = await fetch(productURL);
      
      // Check if the network request was successful
      if (!response.ok) {
         // This catches 404 Not Found, 500 Server Error, etc.
        throw new Error(`Failed to fetch product (Status: ${response.status})`);
      }

      const json = await response.json();

      // The Fake Store API product object has an 'image' property with the URL
      if (json && json.image) {
        setImageUrl(json.image);
      } else {
        // This should not happen with the Fake Store API, but good for robustness
        setError(`Product ID ${productId} found, but no image URL was available.`);
      }

    } catch (e) {
      console.error(e);
      // Display a user-friendly error message
      setError(`Error: Could not retrieve product. Check ID or network.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fake Store Product Fetcher</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Product ID (1-20)"
        keyboardType="numeric"
        value={productId}
        onChangeText={setProductId}
      />
      
      <Button 
        title={loading ? "Loading..." : `Fetch Product ${productId}`} 
        onPress={fetchProductImage} 
        disabled={loading}
        color="#007bff"
      />

      {/* Conditional Rendering: Show loader while loading */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Conditional Rendering: Show image if URL is present and not loading */}
      {!loading && imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="contain"
        />
      )}
      
      {/* Conditional Rendering: Show error if an error occurred */}
      {!loading && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && !imageUrl && !error && (
        <Text style={styles.placeholderText}>
            Enter a product ID (1-20) and tap 'Fetch'.
        </Text>
      )}

    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80, // More space at the top
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  loader: {
      marginTop: 30,
  },
  image: {
    width: '100%',
    height: 300,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  errorText: {
    color: 'darkred',
    marginTop: 30,
    fontSize: 16,
    padding: 10,
    backgroundColor: '#ffe0e0',
    borderRadius: 5,
  },
  placeholderText: {
    marginTop: 30,
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
  }
});
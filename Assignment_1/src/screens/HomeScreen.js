import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  SafeAreaView,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For the profile icon

// --- Color Palette and Constants ---
const COLORS = {
  textLight: '#F0F0F0',
  textDark: '#333333',
  primary: '#4A90E2',      
  secondary: '#FF3366',    
  cardBackground: '#FFFFFF',
  
  GRADIENT_START: 'rgba(74, 144, 226, 0.5)', 
  GRADIENT_END: 'rgba(255, 51, 102, 0.5)',   
};

// --- DUMMY DATA (Now used as INITIAL state) ---
const initialOffers = [ 
  { id: '1', title: 'Python Tutoring', user: 'Ali', category: 'Programming', duration: 60, description: 'Master the basics of Python from a certified expert.' },
  { id: '2', title: 'Guitar Lessons', user: 'Fatima', category: 'Music', duration: 45, description: 'Learn chords and tabs for popular songs.' },
  { id: '3', title: 'Drawing Basics', user: 'Ahmed', category: 'Art', duration: 60, description: 'Foundational techniques for beginners in sketching.' },
  { id: '4', title: 'Yoga & Meditation', user: 'Sara', category: 'Wellness', duration: 30, description: 'Daily session for stress relief and flexibility.' },
  { id: '5', title: 'Coffee Brewing', user: 'Mark', category: 'Food & Drink', duration: 30, description: 'Learn to brew the perfect cup at home.' },
];

// 🌟 FIX: OfferCard Component Definition
const OfferCard = ({ offer, onPress }) => {
  const publisherName = offer.publisher ? offer.publisher.name : offer.user;

  return (
    <TouchableOpacity style={offerStyles.card} onPress={onPress}>
      <View style={offerStyles.header}>
        <Text style={offerStyles.title}>{offer.title}</Text>
        <Text style={offerStyles.duration}>{offer.duration} min</Text>
      </View>
      <View style={offerStyles.details}>
        <Text style={offerStyles.category}>Category: {offer.category}</Text>
        <Text style={offerStyles.user}>By: {publisherName}</Text>
      </View>
      <Text style={offerStyles.description} numberOfLines={2}>
        {offer.description}
      </Text>
    </TouchableOpacity>
  );
};

// OfferCard Styles
const offerStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: COLORS.textDark,
    opacity: 0.7,
  },
  user: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textDark,
    marginTop: 5,
  },
});
// ------------------------------------

// --- Main Component ---
export default function HomeScreen({ navigation, route }) {
  const user = route.params?.user ?? { name: 'Demo User' };
  
  // Manage the list of offers in state
  const [offersList, setOffersList] = useState(initialOffers);

  // Animation for the list content
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  // Check for new offers passed back from CreatePostScreen
  useEffect(() => {
    if (route.params?.newOffer) {
      const newOffer = route.params.newOffer;
      
      // Add the new offer to the beginning of the list
      setOffersList(prevOffers => [newOffer, ...prevOffers]);
      
      // Clean up the parameter
      navigation.setParams({ newOffer: undefined });
    }
    
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 200); 

    return () => clearTimeout(timeout);
  }, [route.params?.newOffer, fadeAnim, navigation]);

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      start={[0.7, 0]} 
      end={[0.3, 1]}   
      style={styles.fullScreen}
    >
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello, {user.name.split(' ')[0]}!</Text>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account-circle" size={30} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.createOfferButton} 
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createOfferButtonText}>+ Create New Offer</Text>
        </TouchableOpacity>

        <Text style={styles.listTitle}>Available Offers</Text>

        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={offersList} 
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <OfferCard 
                offer={item} 
                onPress={() => alert(`Navigating to booking for ${item.title}`)} 
              />
            )}
            contentContainerStyle={styles.flatListContent}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ---
// ## Styling
// ---

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textLight,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileButton: {
    padding: 5,
  },
  createOfferButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  createOfferButtonText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 10,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  flatListContent: {
    paddingBottom: 20,
  },
});
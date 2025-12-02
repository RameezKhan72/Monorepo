import React, { useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    ScrollView, 
    StatusBar,
    Animated,
    // 🌟 FIX: Imported the Platform API
    Platform, 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

// --- Color Palette and Constants (Matching other screens) ---
const COLORS = {
    textLight: '#F0F0F0',
    textDark: '#333333',
    primary: '#4A90E2',      
    secondary: '#FF3366',    
    cardBackground: '#FFFFFF',
    
    GRADIENT_START: 'rgba(74, 144, 226, 0.5)', 
    GRADIENT_END: 'rgba(255, 51, 102, 0.5)',   
};

// --- Rameez Khan's Profile Data ---
const PROFILE_DATA = {
    name: "Rameez Khan",
    expertise: ["Graphic Designer", "Programmer", "Ethical Hacking"],
    bio: "Passionate about leveraging technology and design to solve complex problems and teach valuable skills.",
    // IMPORTANT: Ensure this is a direct, publicly accessible image URL for Snack
    imageUrl: "https://placehold.co/150x150/4A90E2/FFFFFF?text=RK", 
    memberSince: "May 2024",
    location: "Islamabad, PK",
};


export default function ProfileScreen({ navigation, route }) {
    const user = route.params?.user ?? PROFILE_DATA;
    
    // 🌟 Animated Name Color Setup
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Loop the animation
        Animated.loop(
            Animated.timing(colorAnim, {
                toValue: 1,
                duration: 5000, 
                useNativeDriver: false, 
            })
        ).start();
    }, [colorAnim]);

    // Interpolate between two colors (e.g., primary and secondary)
    const animatedColor = colorAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [COLORS.primary, COLORS.secondary, COLORS.primary],
    });

    return (
        <LinearGradient
            colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
            start={[0.7, 0]} 
            end={[0.3, 1]}   
            style={styles.fullScreen}
        >
            <SafeAreaView style={styles.fullScreen}>
                <StatusBar barStyle="light-content" />
                
                {/* 🌟 THIS IS YOUR BACK BUTTON 🌟 */}
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    {/* --- Profile Picture and Name --- */}
                    <View style={styles.profileHeader}>
                        <Image
                            source={{ uri: PROFILE_DATA.imageUrl }}
                            style={styles.profileImage}
                        />
                        {/* Animated Name */}
                        <Animated.Text style={[styles.profileName, { color: animatedColor }]}>
                            {PROFILE_DATA.name}
                        </Animated.Text>
                        <Text style={styles.profileBio}>{PROFILE_DATA.bio}</Text>
                    </View>

                    {/* --- Expertise Card --- */}
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Expertise Areas</Text>
                        <View style={styles.expertiseContainer}>
                            {PROFILE_DATA.expertise.map((skill, index) => (
                                <View key={index} style={styles.skillTag}>
                                    <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.primary} style={{ marginRight: 5 }}/>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    
                    {/* --- Details Card --- */}
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Details</Text>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.secondary} />
                            <Text style={styles.detailText}>Location: {PROFILE_DATA.location}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.secondary} />
                            <Text style={styles.detailText}>Member Since: {PROFILE_DATA.memberSince}</Text>
                        </View>
                    </View>

                    {/* --- Log Out Button --- */}
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={() => navigation.replace('Login')}
                    >
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                        <MaterialCommunityIcons name="exit-to-app" size={20} color={COLORS.textLight} style={{ marginLeft: 10 }} />
                    </TouchableOpacity>

                </ScrollView>
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
    // Back Button Style (Uses Platform.OS)
    backButton: {
        position: 'absolute', 
        // 🌟 FIX: Platform is now defined
        top: Platform.OS === 'ios' ? 40 : 20, 
        left: 20,
        zIndex: 10, 
        padding: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        // 🌟 FIX: Platform is now defined
        paddingTop: Platform.OS === 'ios' ? 80 : 50, 
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 150, 
        height: 150,
        borderRadius: 75,
        borderWidth: 5, 
        borderColor: COLORS.textLight,
        marginBottom: 15,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    profileName: {
        fontSize: 34, 
        fontWeight: '900',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginBottom: 5,
    },
    profileBio: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 5,
        opacity: 0.9, 
    },
    infoCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 5,
    },
    expertiseContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillTag: {
        flexDirection: 'row',
        backgroundColor: '#E6F0FF', 
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    skillText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: COLORS.textDark,
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    logoutButtonText: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: '700',
    },
    
});

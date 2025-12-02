import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView
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
    placeholder: '#A0A0A0',
};


export default function NewOfferScreen({ navigation }) {
    const [offerTitle, setOfferTitle] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [skills, setSkills] = useState('');

    const handleCreateOffer = () => {
        // This function is now updated to handle all the new fields.
        console.log('New Offer Created:', { 
            name,
            phoneNumber,
            skills,
            offerTitle, 
            offerDescription 
        });

        // For this example, we'll just navigate back
        navigation.goBack();
    };

    return (
        <LinearGradient
            colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
            start={[0.7, 0]} 
            end={[0.3, 1]}   
            style={styles.fullScreen}
        >
            <SafeAreaView style={styles.fullScreen}>
                <StatusBar barStyle="light-content" translucent={true} />
                
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    style={styles.contentWrapper}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create a New Offer</Text>
                            <Text style={styles.subtitle}>Let the community know what you can teach!</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <TextInput
                                placeholder="Your Name"
                                placeholderTextColor={COLORS.placeholder}
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor={COLORS.placeholder}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="Skills (e.g., Python, Guitar, Drawing)"
                                placeholderTextColor={COLORS.placeholder}
                                value={skills}
                                onChangeText={setSkills}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="Offer Title (e.g., 'Beginner Python Class')"
                                placeholderTextColor={COLORS.placeholder}
                                value={offerTitle}
                                onChangeText={setOfferTitle}
                                style={styles.input}
                            />
                            
                            <TextInput
                                placeholder="Offer Description (e.g., 'Learn the fundamentals of Python programming...')"
                                placeholderTextColor={COLORS.placeholder}
                                value={offerDescription}
                                onChangeText={setOfferDescription}
                                multiline
                                style={[styles.input, styles.descriptionInput]}
                            />

                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={handleCreateOffer}
                            >
                                <Text style={styles.buttonText}>Publish Offer</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    backButton: {
        position: 'absolute', 
        top: Platform.OS === 'ios' ? 40 : 20, 
        left: 20,
        zIndex: 10, 
        padding: 10,
    },
    contentWrapper: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        paddingTop: Platform.OS === 'ios' ? 80 : 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.textLight,
        textShadowColor: 'rgba(0, 0, 0, 0.4)', 
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 5,
        opacity: 0.9, 
    },
    formContainer: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    input: {
        height: 50,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 15,
        color: COLORS.textDark,
    },
    descriptionInput: {
        height: 120,
        textAlignVertical: 'top',
        paddingVertical: 15,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: COLORS.cardBackground, 
        fontSize: 18,
        fontWeight: '600',
    },
});

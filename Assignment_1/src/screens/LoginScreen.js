import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Animated,
    StatusBar,
    KeyboardAvoidingView,
    Platform, 
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

// --- Color Palette and Constants (Matching other screens) ---
const COLORS = {
    textLight: '#F0F0F0',
    textDark: '#333333',
    primary: '#4A90E2',
    secondary: '#FF3366',
    google: '#DB4437',
    
    // Gradient Colors
    GRADIENT_START: 'rgba(74, 144, 226, 0.5)', 
    GRADIENT_END: 'rgba(255, 51, 102, 0.5)', 
    
    placeholder: '#A0A0A0',
    inputBackground: '#FFFFFF',
};

// --- Main Component ---
export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOtpFlow, setIsOtpFlow] = useState(false); 

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const welcomeColorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, 
            duration: 1500, 
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.timing(welcomeColorAnim, {
                toValue: 1,
                duration: 5000,
                useNativeDriver: false,
            })
        ).start();
    }, [fadeAnim, welcomeColorAnim]);

    const animatedWelcomeColor = welcomeColorAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [COLORS.primary, COLORS.secondary, COLORS.primary],
    });

    const handleLogin = () => {
        // REAL APP LOGIC: Replace this with your actual API call.
        if (email.length > 0 && password.length > 0) {
            console.log('Attempting standard login...');
            navigation.replace('Home', { user: { name: 'New User', email } });
        } else {
            alert('Please enter a valid email and password.');
        }
    };
    
    const handleOtpLogin = () => {
        // REAL APP LOGIC: This would trigger an email containing the OTP/magic link.
        alert(`OTP/Magic Link sent to ${email}. Check your email!`);
        console.log('OTP/Magic Link requested...');
    };

    const handleGoogleLogin = () => {
        // REAL APP LOGIC: This requires setting up Expo/Firebase/Google OAuth.
        alert('Initiating Google Sign-In...');
        console.log('Google login requested...');
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
                
                {/* Back button to return to the previous screen */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textLight} />
                </TouchableOpacity>

                <View style={styles.centeredContainer}>
                    <View style={styles.welcomeContainer}>
                        <Animated.Text style={[styles.welcomeText, { color: animatedWelcomeColor }]}>
                            Welcome to
                        </Animated.Text>
                        <View style={styles.divider} />
                        <Animated.Text style={[styles.welcomeText, { color: animatedWelcomeColor, marginTop: 10 }]}>
                            SkillSwap
                        </Animated.Text>
                    </View>

                    <KeyboardAvoidingView 
                        style={styles.contentWrapper}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
                    >
                        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                            <View style={styles.content}>
                                <Animated.View style={{ opacity: fadeAnim }}>
                                    <Text style={styles.subtitle}>Your Community Awaits</Text>
                                </Animated.View>
                                
                                <Text style={styles.infoText}>Sign in to start learning and teaching.</Text>
                                
                                {/* --- Standard Email/Password Flow --- */}
                                {!isOtpFlow ? (
                                    <>
                                        <TextInput
                                            placeholder="Email Address (user@gmail.com)"
                                            placeholderTextColor={COLORS.placeholder}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            style={styles.input}
                                        />

                                        <TextInput
                                            placeholder="Password"
                                            placeholderTextColor={COLORS.placeholder}
                                            value={password}
                                            secureTextEntry
                                            onChangeText={setPassword}
                                            style={styles.input}
                                        />

                                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                            <Text style={styles.buttonText}>Log In</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    // --- OTP/Magic Link & Social Flow ---
                                    <>
                                        <TextInput
                                            placeholder="Email Address for OTP/Magic Link"
                                            placeholderTextColor={COLORS.placeholder}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            style={styles.input}
                                        />
                                        <TouchableOpacity 
                                            style={[styles.button, { backgroundColor: COLORS.secondary, marginBottom: 15 }]} 
                                            onPress={handleOtpLogin}
                                        >
                                            <Text style={styles.buttonText}>Get OTP / Magic Link</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={[styles.socialButton, { backgroundColor: COLORS.google }]} 
                                            onPress={handleGoogleLogin}
                                        >
                                            <MaterialCommunityIcons name="google" size={20} color={COLORS.textLight} />
                                            <Text style={styles.socialButtonText}>Sign In with Google</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                            <Text style={styles.buttonText}>Log In</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                {/* --- Flow Switcher --- */}
                                <TouchableOpacity 
                                    style={styles.linkButton} 
                                    onPress={() => setIsOtpFlow(!isOtpFlow)}
                                >
                                    <Text style={styles.linkText}>
                                        {isOtpFlow ? 
                                            "Use Email and Password instead" : 
                                            "Use OTP, Magic Link, or Google Login"
                                        }
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
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
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    welcomeContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20, 
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: '900',
        textShadowColor: 'rgba(0, 0, 0, 0.4)', 
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    divider: {
        width: '50%',
        height: 2,
        backgroundColor: COLORS.textLight,
        marginVertical: 10,
    },
    contentWrapper: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 30, 
        paddingBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.4)', 
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    input: {
        height: 50,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 15,
        color: COLORS.textDark,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonText: {
        color: COLORS.inputBackground, 
        fontSize: 18,
        fontWeight: '600',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: COLORS.textDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    socialButtonText: {
        color: COLORS.textLight,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    linkButton: {
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    linkText: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
});

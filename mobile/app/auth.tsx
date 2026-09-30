import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { loginUser, registerUser } from '../services/api';
import i18n from '../services/i18n';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const router = useRouter();

    const getErrorMessage = (error: any): string => {
        const rawError = error.response?.data?.error;
        if (rawError === 'Invalid credentials') {
            return i18n.t('auth.invalid_credentials');
        }
        if (rawError === 'User already exists') {
            return i18n.t('auth.user_exists');
        }
        if (error.message === 'Network Error') {
            return i18n.t('auth.network_error');
        }
        return rawError || error.message || i18n.t('auth.default_error');
    };

    const clearLocalAchievements = async () => {
        await AsyncStorage.removeItem('@achievements_first_blood');
        await AsyncStorage.removeItem('@achievements_machine');
        await AsyncStorage.removeItem('@achievements_titan');
    };

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Toast.show({ type: 'error', text1: i18n.t('auth.error_title'), text2: i18n.t('auth.fill_all_fields') });
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const data = await loginUser({ email, password });
                await AsyncStorage.setItem('@auth_token', data.token);
                await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
                await clearLocalAchievements();
                Toast.show({ type: 'success', text1: i18n.t('auth.welcome'), text2: i18n.t('auth.login_success') });
                router.replace('/');
            } else {
                const data = await registerUser({ name, email, password });
                await AsyncStorage.setItem('@auth_token', data.token);
                await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
                await clearLocalAchievements();
                Toast.show({ type: 'success', text1: i18n.t('auth.account_created'), text2: i18n.t('auth.welcome_heattrainer') });
                router.replace('/');
            }
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Toast.show({ type: 'error', text1: i18n.t('auth.error_title'), text2: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateLogin = async () => {
        setIsLogin(true);
        const simEmail = 'test@heattrainer.com';
        const simPassword = 'password123';
        setEmail(simEmail);
        setPassword(simPassword);
        
        setLoading(true);
        try {
            const data = await loginUser({ email: simEmail, password: simPassword });
            await AsyncStorage.setItem('@auth_token', data.token);
            await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
            
            await clearLocalAchievements();
            
            Toast.show({ type: 'success', text1: i18n.t('auth.welcome'), text2: i18n.t('auth.login_success') });
            router.replace('/');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Toast.show({ type: 'error', text1: i18n.t('auth.error_title'), text2: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>HeatTrainer</Text>
                    <Text style={styles.subtitle}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
                </View>
 
                <View style={styles.form}>
                    {!isLogin && (
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            placeholder="Mot de passe"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)} 
                            style={styles.eyeButton}
                        >
                            <Text style={styles.eyeText}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
                        </TouchableOpacity>
                    </View>
 
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
                        </Text>
                    </TouchableOpacity>
 
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
                        <Text style={styles.switchText}>
                            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={handleSimulateLogin} 
                        style={styles.simulBtn}
                        disabled={loading}
                    >
                        <Text style={styles.simulText}>Simuler la connexion</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 36, fontWeight: 'bold', color: '#ffcc00', marginBottom: 10 },
    subtitle: { fontSize: 24, color: '#fff' },
    form: { width: '100%' },
    input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#333' },
    passwordContainer: { position: 'relative', width: '100%', marginBottom: 15 },
    passwordInput: { paddingRight: 85, marginBottom: 0 },
    eyeButton: { position: 'absolute', right: 15, top: 15, justifyContent: 'center' },
    eyeText: { color: '#ffcc00', fontSize: 14, fontWeight: 'bold' },
    button: { backgroundColor: '#ffcc00', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#121212', fontSize: 18, fontWeight: 'bold' },
    switchBtn: { marginTop: 20, alignItems: 'center' },
    switchText: { color: '#aaa', fontSize: 16, textDecorationLine: 'underline' },
    simulBtn: { marginTop: 25, alignItems: 'center' },
    simulText: { color: '#ffcc00', fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' }
});

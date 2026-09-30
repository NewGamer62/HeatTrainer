// Auteur : Noa Gaillard

import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function Layout() {
    const [isVisible, setIsVisible] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('@auth_token');
            if (!token && pathname !== '/auth') {
                router.replace('/auth');
            }
            if (token) {
                const userData = await AsyncStorage.getItem('@user_data');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        setUserName(user.name);
                    } catch(e) {}
                }
            }
        };
        checkAuth();
    }, [pathname]);

    const toggleMenu = () => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: -width * 0.7,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setIsVisible(false));
        } else {
            setIsVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    };

    const closeMenu = () => {
        if (!isVisible) return;
        Animated.timing(slideAnim, {
            toValue: -width * 0.7,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setIsVisible(false));
    };

    const navigateTo = (path: string) => {
        closeMenu();
        setTimeout(() => router.push(path), 250);
    };

    const getTitle = () => {
        if (pathname === '/log-workout') return 'Constructeur';
        if (pathname === '/history') return 'Mes Séances';
        if (pathname === '/profile') return 'Mon Profil';
        if (pathname === '/auth') return 'Connexion';
        return 'HeatTrainer';
    };

    const handleLogout = async () => {
        closeMenu();
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@user_data');
        await AsyncStorage.removeItem('@achievements_first_blood');
        await AsyncStorage.removeItem('@achievements_machine');
        await AsyncStorage.removeItem('@achievements_titan');
        router.replace('/auth');
    };

    const isAuthScreen = pathname === '/auth';

    return (
        <View style={styles.mainContainer}>
            {!isAuthScreen && (
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={toggleMenu} 
                        style={styles.hamburger}
                        hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                    >
                        <View style={styles.line} />
                        <View style={styles.line} />
                        <View style={styles.line} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{getTitle()}</Text>
                    <View style={{ width: 30 }} />
                </View>
            )}

            {isVisible && (
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                <Text style={styles.drawerTitle}>HeatTrainer</Text>
                {userName && <Text style={styles.drawerUser}>Bonjour, {userName}</Text>}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/')}>
                    <Text style={[styles.menuText, pathname === '/' && styles.activeMenuText]}>Heatmap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/log-workout')}>
                    <Text style={[styles.menuText, pathname === '/log-workout' && styles.activeMenuText]}>Nouvelle Séance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/profile')}>
                    <Text style={[styles.menuText, pathname === '/profile' && styles.activeMenuText]}>Mon Profil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/history')}>
                    <Text style={[styles.menuText, pathname === '/history' && styles.activeMenuText]}>Historique</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Text style={[styles.menuText, { color: '#ff4444' }]}>Se déconnecter</Text>
                </TouchableOpacity>
            </Animated.View>

            <View style={styles.content}>
                <Slot />
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }} pointerEvents="box-none">
                <Toast position="top" topOffset={100} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#121212' },
    header: { height: 90, paddingTop: 40, backgroundColor: '#121212', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#333', zIndex: 10 },
    hamburger: { width: 40, height: 30, justifyContent: 'space-between', padding: 5 },
    line: { width: 30, height: 3, backgroundColor: '#ffcc00', borderRadius: 2 },
    headerTitle: { color: '#ffcc00', fontSize: 20, fontWeight: 'bold' },
    content: { flex: 1, zIndex: 1 },
    overlay: { position: 'absolute', top: 90, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 4 },
    drawer: { position: 'absolute', top: 90, bottom: 0, left: 0, width: width * 0.7, backgroundColor: '#1e1e1e', padding: 20, zIndex: 5, elevation: 5, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5 },
    drawerTitle: { color: '#ffcc00', fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    drawerUser: { color: '#ccc', fontSize: 16, marginBottom: 25 },
    menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    menuText: { color: '#fff', fontSize: 18 },
    activeMenuText: { color: '#ffcc00', fontWeight: 'bold' }
});
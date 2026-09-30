// Auteur : Noa Gaillard

import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { fetchHistory } from '../services/api';

export default function ProfileScreen() {
    const [stats, setStats] = useState({ totalSessions: 0, totalVolume: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const loadStats = async () => {
        setIsLoading(true);
        const history = await fetchHistory();
        let volume = 0;

        if (Array.isArray(history)) {
            history.forEach((session: any) => {
                session.exercises.forEach((ex: any) => {
                    volume += (ex.sets * ex.reps * ex.weight);
                });
            });

            setStats({
                totalSessions: history.length,
                totalVolume: volume
            });
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const achievements = [
        { id: 1, title: 'Premier sang', desc: 'Valider une première séance', condition: stats.totalSessions >= 1 },
        { id: 2, title: 'Machine', desc: 'Valider 10 séances', condition: stats.totalSessions >= 10 },
        { id: 3, title: 'Titan', desc: 'Soulever un volume total de 10 000 kg', condition: stats.totalVolume >= 10000 }
    ];

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffcc00" />
                <Text style={styles.loadingText}>Chargement du profil...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerCard}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>U</Text>
                </View>
                <Text style={styles.username}>Utilisateur</Text>
                <Text style={styles.level}>Niveau {Math.floor(stats.totalSessions / 5) + 1}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalSessions}</Text>
                    <Text style={styles.statLabel}>Séances</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalVolume} kg</Text>
                    <Text style={styles.statLabel}>Volume Total</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Succès & Trophées</Text>
            
            <View style={styles.achievementsContainer}>
                {achievements.map(ach => (
                    <View key={ach.id} style={[styles.achievementCard, ach.condition && styles.achievementUnlocked]}>
                        <View style={styles.achievementIcon}>
                            <Text style={styles.iconText}>{ach.condition ? '🏆' : '🔒'}</Text>
                        </View>
                        <View style={styles.achievementTextContainer}>
                            <Text style={[styles.achievementTitle, ach.condition && styles.textUnlocked]}>{ach.title}</Text>
                            <Text style={styles.achievementDesc}>{ach.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { padding: 20, paddingBottom: 80 },
    headerCard: { alignItems: 'center', backgroundColor: '#1e1e1e', padding: 20, borderRadius: 10, marginBottom: 20 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#ffcc00' },
    avatarText: { fontSize: 32, color: '#ffcc00', fontWeight: 'bold' },
    username: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
    level: { fontSize: 16, color: '#ffcc00', marginTop: 5 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statBox: { flex: 1, backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    statValue: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
    statLabel: { fontSize: 14, color: '#888', marginTop: 5 },
    sectionTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 15 },
    achievementsContainer: { gap: 10 },
    achievementCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, alignItems: 'center', opacity: 0.6 },
    achievementUnlocked: { opacity: 1, borderColor: '#ffcc00', borderWidth: 1 },
    achievementIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconText: { fontSize: 24 },
    achievementTextContainer: { flex: 1 },
    achievementTitle: { fontSize: 18, color: '#888', fontWeight: 'bold', marginBottom: 5 },
    textUnlocked: { color: '#ffcc00' },
    achievementDesc: { fontSize: 14, color: '#aaa' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { color: '#ffcc00', marginTop: 10, fontSize: 16, fontWeight: 'bold' }
});
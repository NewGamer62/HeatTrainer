// Auteur : Noa Gaillard

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDashboardData } from '../services/api';
import BodyHeatmap from '../components/BodyHeatmap';

export default function HomeScreen() {
    const [tensions, setTensions] = useState<Record<string, number>>({});
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const cachedTensions = await AsyncStorage.getItem('@heatmap_tensions');
            const cachedRecs = await AsyncStorage.getItem('@heatmap_recs');

            if (cachedTensions) setTensions(JSON.parse(cachedTensions));
            if (cachedRecs) setRecommendations(JSON.parse(cachedRecs));
        } catch (cacheError) {
            console.log("[CACHE] Erreur de lecture locale ignorée.");
        }

        const data = await fetchDashboardData();
        
        if (data) {
            if (data.tensions) {
                setTensions(data.tensions);
                AsyncStorage.setItem('@heatmap_tensions', JSON.stringify(data.tensions)).catch(() => {});
            }
            if (data.recommendations && Array.isArray(data.recommendations)) {
                setRecommendations(data.recommendations);
                AsyncStorage.setItem('@heatmap_recs', JSON.stringify(data.recommendations)).catch(() => {});
            }
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffcc00" />
                <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.heatmapContainer}>
                <BodyHeatmap tensions={tensions} />
            </View>

            {recommendations && recommendations.length > 0 && (
                <View style={styles.recoContainer}>
                    <Text style={styles.recoTitle}>Exercices Recommandés</Text>
                    {recommendations.map((ex, index) => (
                        <TouchableOpacity 
                            key={ex.id || index} 
                            style={styles.recoCard}
                            onPress={() => router.push({ pathname: '/log-workout', params: { preselectedId: ex.id } })}
                        >
                            <Text style={styles.recoText}>{ex.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { alignItems: 'center', paddingBottom: 40 },
    heatmapContainer: { width: '100%', alignItems: 'center', marginVertical: 20 },
    recoContainer: { width: '90%', marginTop: 10 },
    recoTitle: { color: '#ffcc00', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    recoCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#ffcc00' },
    recoText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { color: '#ffcc00', marginTop: 10, fontSize: 16, fontWeight: 'bold' }
});

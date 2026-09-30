// Auteur : Noa Gaillard

import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchHistory, deleteWorkout } from '../services/api';
import Toast from 'react-native-toast-message';

export default function HistoryScreen() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadHistory = async () => {
        setIsLoading(true);
        const data = await fetchHistory();
        setSessions(data);
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const executeDelete = async (id: string) => {
        await deleteWorkout(id);
        
        Toast.show({
            type: 'success',
            text1: 'Désintégration confirmée 💥',
            text2: 'La séance a été effacée de la matrice.',
            position: 'top',
            visibilityTime: 3000,
        });

        loadHistory();
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Suppression de la séance",
            "Es-tu sûr de vouloir supprimer cette séance ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Détruire", style: "destructive", onPress: () => executeDelete(id) }
            ]
        );
    };

    const handleEdit = (session: any) => {
        router.push({
            pathname: '/log-workout',
            params: { editSession: JSON.stringify(session) }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffcc00" />
                <Text style={styles.loadingText}>Chargement de l'historique...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historique des séances</Text>
            
            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.date}>
                            {new Date(item.createdAt).toLocaleDateString('fr-FR')} - {new Date(item.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                        
                        {item.exercises.map((ex: any) => (
                            <Text key={ex.id} style={styles.exerciseText}>
                                {ex.sets}x{ex.reps} {ex.exercise.name} ({ex.weight}kg)
                            </Text>
                        ))}
                        
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                                <Text style={styles.editText}>Modifier</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
                                <Text style={styles.deleteText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucune séance enregistrée.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#121212' },
    title: { fontSize: 24, color: '#fff', marginBottom: 20, fontWeight: 'bold' },
    card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 15 },
    date: { color: '#ffcc00', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    exerciseText: { color: '#fff', fontSize: 14, marginBottom: 5 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    editButton: { flex: 1, padding: 10, backgroundColor: '#333', borderRadius: 5, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#ffcc00' },
    editText: { color: '#ffcc00', fontWeight: 'bold' },
    deleteButton: { flex: 1, padding: 10, backgroundColor: '#330000', borderRadius: 5, alignItems: 'center', marginLeft: 10 },
    deleteText: { color: '#ff4444', fontWeight: 'bold' },
    emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { color: '#ffcc00', marginTop: 10, fontSize: 16, fontWeight: 'bold' }
});

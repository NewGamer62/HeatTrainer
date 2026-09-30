// Auteur : Noa Gaillard

import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { fetchExercises, saveWorkout, updateWorkout, fetchHistory } from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function LogWorkoutScreen() {
    const [exercises, setExercises] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const [sessionCart, setSessionCart] = useState<any[]>([]);
    const [editModeId, setEditModeId] = useState<string | null>(null);
    
    const router = useRouter();
    const { preselectedId, editSession } = useLocalSearchParams();

    // Chargement initial (API + Brouillon local)
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchExercises();
            setExercises(data);
            
            if (preselectedId && typeof preselectedId === 'string') {
                setSelectedExerciseId(preselectedId);
                const targetEx = data.find((e: any) => e.id === preselectedId);
                if (targetEx) {
                    setSearchQuery(targetEx.name);
                    setSelectedMuscle(null);
                }
            }

            if (editSession && typeof editSession === 'string') {
                try {
                    const session = JSON.parse(editSession);
                    setEditModeId(session.id);
                    
                    const mappedCart = session.exercises.map((ex: any) => ({
                        id: Math.random().toString(),
                        exerciseId: ex.exerciseId,
                        name: ex.exercise.name,
                        sets: ex.sets,
                        reps: ex.reps,
                        weight: ex.weight
                    }));
                    setSessionCart(mappedCart);
                } catch (e) {
                    console.error("Erreur parsing édition", e);
                }
            } else if (!editSession) {
                // Récupération du brouillon si on n'est pas en mode édition
                const draft = await AsyncStorage.getItem('@workout_draft');
                if (draft) {
                    setSessionCart(JSON.parse(draft));
                }
                setEditModeId(null);
            }
            setIsLoading(false);
        };
        loadData();
    }, [preselectedId, editSession]);

    // Sauvegarde automatique du brouillon à chaque modification du panier
    useEffect(() => {
        const saveDraft = async () => {
            if (!editModeId) {
                if (sessionCart.length > 0) {
                    await AsyncStorage.setItem('@workout_draft', JSON.stringify(sessionCart));
                } else {
                    await AsyncStorage.removeItem('@workout_draft');
                }
            }
        };
        saveDraft();
    }, [sessionCart, editModeId]);

    const availableMuscles = Array.from(
        new Set(exercises.flatMap(ex => ex.muscles?.map((m: any) => m.muscle.name) || []))
    ).sort();

    const filteredExercises = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMuscle = selectedMuscle ? ex.muscles?.some((m: any) => m.muscle.name === selectedMuscle) : true;
        return matchesSearch && matchesMuscle;
    });

    const addToSession = () => {
        if (!selectedExerciseId) return;

        const exerciseDetails = exercises.find(ex => ex.id === selectedExerciseId);

        const newEntry = {
            id: Math.random().toString(),
            exerciseId: selectedExerciseId,
            name: exerciseDetails?.name,
            sets: parseInt(sets) || 0,
            reps: parseInt(reps) || 0,
            weight: parseFloat(weight) || 0
        };

        setSessionCart([...sessionCart, newEntry]);

        setSelectedExerciseId(null);
        setSets('');
        setReps('');
        setWeight('');
        setSearchQuery('');
        
        router.setParams({ preselectedId: undefined });
    };

    const removeCartItem = (itemId: string) => {
        setSessionCart(sessionCart.filter(item => item.id !== itemId));
    };

    const submitWorkout = async () => {
        if (sessionCart.length === 0) return;

        const payload = {
            exercises: sessionCart.map(item => ({
                exerciseId: item.exerciseId,
                sets: item.sets,
                reps: item.reps,
                weight: item.weight
            }))
        };

        let result;
        if (editModeId) {
            result = await updateWorkout(editModeId, payload);
        } else {
            result = await saveWorkout(payload);
        }

        if (result) {
            // Destruction du brouillon une fois la séance validée
            if (!editModeId) await AsyncStorage.removeItem('@workout_draft');

            // Logique de succès (Achievement)
            const history = await fetchHistory();
            let totalVolume = 0;
            if (Array.isArray(history)) {
                history.forEach((session: any) => {
                    session.exercises.forEach((ex: any) => {
                        totalVolume += (ex.sets * ex.reps * ex.weight);
                    });
                });
            }
            const totalSessions = Array.isArray(history) ? history.length : 0;

            // Synchronisation dynamique : réinitialise l'état local dans AsyncStorage si la base de données a été réinitialisée
            if (totalSessions < 1) await AsyncStorage.removeItem('@achievements_first_blood');
            if (totalSessions < 10) await AsyncStorage.removeItem('@achievements_machine');
            if (totalVolume < 10000) await AsyncStorage.removeItem('@achievements_titan');

            const unlockedAchievements = [];

            const isFirstBlood = await AsyncStorage.getItem('@achievements_first_blood');
            if (!isFirstBlood && totalSessions >= 1) {
                await AsyncStorage.setItem('@achievements_first_blood', 'true');
                unlockedAchievements.push({ title: 'Premier sang', desc: 'Tu viens de valider ta toute première séance.' });
            }

            const isMachine = await AsyncStorage.getItem('@achievements_machine');
            if (!isMachine && totalSessions >= 10) {
                await AsyncStorage.setItem('@achievements_machine', 'true');
                unlockedAchievements.push({ title: 'Machine', desc: '10 séances validées, quel monstre !' });
            }

            const isTitan = await AsyncStorage.getItem('@achievements_titan');
            if (!isTitan && totalVolume >= 10000) {
                await AsyncStorage.setItem('@achievements_titan', 'true');
                unlockedAchievements.push({ title: 'Titan', desc: '10 000 kg soulevés au total !' });
            }

            if (unlockedAchievements.length > 0) {
                const lastAch = unlockedAchievements[unlockedAchievements.length - 1];
                Toast.show({
                    type: 'success',
                    text1: unlockedAchievements.length > 1 ? `${unlockedAchievements.length} Succès Déverrouillés !` : `Succès Déverrouillé : ${lastAch.title} !`,
                    text2: unlockedAchievements.length > 1 ? 'Tu as accompli de nouveaux exploits !' : lastAch.desc,
                    visibilityTime: 6000,
                    onPress: () => router.push('/profile'),
                });
            } else {
                Toast.show({
                    type: 'success',
                    text1: editModeId ? 'Séance mise à jour' : 'Séance enregistrée',
                    text2: 'Tes données ont été synchronisées.',
                    visibilityTime: 3000,
                });
            }

            setSessionCart([]);
            setEditModeId(null);
            router.setParams({ editSession: undefined, preselectedId: undefined });
            router.push('/');
        } else {
            Toast.show({
                type: 'error',
                text1: 'Erreur de sauvegarde',
                text2: 'Impossible d\'enregistrer votre séance. Vérifiez votre connexion.',
                visibilityTime: 4000,
            });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffcc00" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#121212' }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{editModeId ? 'Éditer la séance' : 'Constructeur de séance'}</Text>
            
            {sessionCart.length > 0 && (
                <View style={styles.cartContainer}>
                    <Text style={styles.subtitle}>{editModeId ? 'Séance en édition :' : 'Brouillon en cours :'}</Text>
                    {sessionCart.map((item) => (
                        <View key={item.id} style={styles.cartItem}>
                            <Text style={styles.cartItemText}>
                                {item.sets}x{item.reps} {item.name} ({item.weight}kg)
                            </Text>
                            <TouchableOpacity onPress={() => removeCartItem(item.id)}>
                                <Text style={styles.deleteText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    
                    <TouchableOpacity style={styles.submitButton} onPress={submitWorkout}>
                        <Text style={styles.submitButtonText}>{editModeId ? 'Mettre à jour la séance' : 'Valider la séance complète'}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.separator} />

            <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un exercice..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity 
                        style={[styles.filterChip, !selectedMuscle && styles.activeFilterChip]} 
                        onPress={() => setSelectedMuscle(null)}
                    >
                        <Text style={[styles.filterText, !selectedMuscle && styles.activeFilterText]}>Tous</Text>
                    </TouchableOpacity>
                    {availableMuscles.map(muscle => (
                        <TouchableOpacity 
                            key={muscle} 
                            style={[styles.filterChip, selectedMuscle === muscle && styles.activeFilterChip]} 
                            onPress={() => setSelectedMuscle(muscle as string)}
                        >
                            <Text style={[styles.filterText, selectedMuscle === muscle && styles.activeFilterText]}>{muscle}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            
            <View style={styles.listContainer}>
                <ScrollView style={styles.scrollableList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {filteredExercises.map((item) => (
                        <TouchableOpacity 
                            key={item.id}
                            style={[styles.item, selectedExerciseId === item.id && styles.selectedItem]}
                            onPress={() => setSelectedExerciseId(item.id)}
                        >
                            <Text style={styles.itemText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.form}>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="Séries" placeholderTextColor="#666" value={sets} onChangeText={setSets} />
                <TextInput style={styles.input} keyboardType="numeric" placeholder="Rép" placeholderTextColor="#666" value={reps} onChangeText={setReps} />
                <TextInput style={styles.input} keyboardType="numeric" placeholder="Poids(kg)" placeholderTextColor="#666" value={weight} onChangeText={setWeight} />
            </View>

            <TouchableOpacity 
                style={[styles.addButton, !selectedExerciseId && styles.buttonDisabled]} 
                onPress={addToSession} 
                disabled={!selectedExerciseId}
            >
                <Text style={styles.addButtonText}>+ Ajouter à la séance</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 80 },
    title: { fontSize: 24, color: '#fff', marginBottom: 15, fontWeight: 'bold' },
    subtitle: { fontSize: 18, color: '#ffcc00', marginBottom: 10, fontWeight: 'bold' },
    cartContainer: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    cartItemText: { color: '#fff', fontSize: 14 },
    deleteText: { color: '#ff0000', fontWeight: 'bold', fontSize: 16 },
    submitButton: { backgroundColor: '#ffcc00', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
    separator: { height: 1, backgroundColor: '#333', marginVertical: 15 },
    searchInput: { backgroundColor: '#1e1e1e', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
    filterWrapper: { marginBottom: 15 },
    filterChip: { backgroundColor: '#1e1e1e', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#333' },
    activeFilterChip: { backgroundColor: '#333', borderColor: '#ffcc00' },
    filterText: { color: '#fff', fontSize: 14 },
    activeFilterText: { color: '#ffcc00', fontWeight: 'bold' },
    listContainer: { marginBottom: 15 },
    scrollableList: { maxHeight: 250 },
    item: { padding: 12, backgroundColor: '#1e1e1e', marginBottom: 5, borderRadius: 8 },
    selectedItem: { backgroundColor: '#3a3a3a', borderColor: '#ffcc00', borderWidth: 1 },
    itemText: { color: '#fff', fontSize: 14 },
    form: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 8, width: '30%', textAlign: 'center' },
    addButton: { backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center', borderColor: '#ffcc00', borderWidth: 1 },
    buttonDisabled: { borderColor: '#555', opacity: 0.5 },
    addButtonText: { color: '#ffcc00', fontWeight: 'bold', fontSize: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { color: '#ffcc00', marginTop: 10, fontSize: 16, fontWeight: 'bold' }
});
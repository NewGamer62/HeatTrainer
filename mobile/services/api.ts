// Auteur : Noa Gaillard

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.103.250.93:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const registerUser = async (userData: any) => {
    try {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (credentials: any) => {
    try {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user_data');
};



/* Duplicate 'api' declaration removed */

export const checkHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchExercises = async () => {
    try {
        const response = await api.get('/api/exercises');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const saveWorkout = async (workoutData: any) => {
    try {
        const response = await api.post('/api/workouts', workoutData);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const fetchDashboardData = async () => {
    try {
        const response = await api.get('/api/recommendations');
        return response.data;
    } catch (error) {
        return { tensions: {}, recommendations: [] };
    }
};

export const fetchHistory = async () => {
    try {
        const response = await api.get('/api/workouts/history');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const deleteWorkout = async (id: string) => {
    try {
        const response = await api.delete(`/api/workouts/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateWorkout = async (id: string, workoutData: any) => {
    try {
        const response = await api.put(`/api/workouts/${id}`, workoutData);
        return response.data;
    } catch (error) {
        return null;
    }
};
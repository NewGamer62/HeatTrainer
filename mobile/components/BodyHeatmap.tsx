import React, { useState } from 'react';
import Svg, { Path, G, Defs, LinearGradient, Stop, RadialGradient, Ellipse } from 'react-native-svg';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface BodyHeatmapProps {
    tensions: Record<string, number>;
}

export default function BodyHeatmap({ tensions }: BodyHeatmapProps) {
    const [showFront, setShowFront] = useState(true);

    const interpolateColor = (val: number) => {
        if (!val || val === 0) return '#2A2A35'; // Gris de base
        
        const clamped = Math.min(val, 1000);
        
        if (clamped < 500) {
            // Jaune -> Orange vif
            const g = Math.round(220 - (clamped / 500) * 100);
            return `rgb(255, ${g}, 0)`;
        } else {
            // Orange vif -> Rouge pur
            const ratio = (clamped - 500) / 500;
            const g = Math.round(120 - ratio * 120);
            return `rgb(255, ${g}, 0)`;
        }
    };

    const MusclePath = ({ d, name }: { d: string; name: string }) => {
        const intensity = tensions[name] || 0;
        const isActive = intensity > 0;
        const fillColor = interpolateColor(intensity);
        
        return (
            <Path 
                d={d} 
                fill={fillColor} 
                stroke="#1A1A24"
                strokeWidth={isActive ? 1.5 : 1}
                strokeLinejoin="round"
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleButton, showFront && styles.activeToggle]} 
                        onPress={() => setShowFront(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, showFront && styles.activeToggleText]}>Face</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleButton, !showFront && styles.activeToggle]} 
                        onPress={() => setShowFront(false)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleText, !showFront && styles.activeToggleText]}>Dos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.svgContainer}>
                <Svg width="100%" height="100%" viewBox="0 0 200 420">
                    <Defs>
                        <LinearGradient id="bodyBase" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="#2A2A35" stopOpacity="0.3" />
                            <Stop offset="1" stopColor="#14141C" stopOpacity="0.1" />
                        </LinearGradient>
                        <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                            <Stop offset="0%" stopColor="#FF6B00" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#FF1A1A" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>

                    {/* Base Body Silhouette */}
                    <Path 
                        d="M40 30 Q100 0 160 30 L180 100 L160 250 L140 400 L60 400 L40 250 L20 100 Z" 
                        fill="url(#bodyBase)" 
                        stroke="#3A3A4A" 
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />
                    
                    {/* Neck/Head base */}
                    <Path 
                        d="M85 30 Q100 20 115 30 L100 60 Z" 
                        fill="url(#bodyBase)" 
                        stroke="#3A3A4A" 
                        strokeWidth="1.5"
                    />

                    {showFront ? (
                        <G id="Face">
                            {/* Pectoraux */}
                            <MusclePath name="Pectoraux" d="M70 70 Q100 78 130 70 L130 80 Q100 88 70 80 Z" />
                            <MusclePath name="Pectoraux" d="M65 80 Q100 88 135 80 L135 98 Q100 106 65 98 Z" />
                            <MusclePath name="Pectoraux" d="M68 98 Q100 106 132 98 L128 110 Q100 118 72 110 Z" />
                            
                            {/* Epaules */}
                            <MusclePath name="Épaules" d="M40 65 Q50 62 60 75 L50 110 Q35 95 40 65 Z" />
                            <MusclePath name="Épaules" d="M160 65 Q150 62 140 75 L150 110 Q165 95 160 65 Z" />
                            <MusclePath name="Épaules" d="M30 70 L40 65 L45 90 L35 110 Z" />
                            <MusclePath name="Épaules" d="M170 70 L160 65 L155 90 L165 110 Z" />
                            
                            {/* Biceps */}
                            <MusclePath name="Biceps" d="M50 110 Q60 120 55 145 L40 145 Z" />
                            <MusclePath name="Biceps" d="M150 110 Q140 120 145 145 L160 145 Z" />
                            
                            {/* Triceps (Face visible) */}
                            <MusclePath name="Triceps" d="M40 110 L50 110 L40 145 L35 130 Z" />
                            <MusclePath name="Triceps" d="M160 110 L150 110 L160 145 L165 130 Z" />
                            
                            {/* Abdominaux */}
                            <MusclePath name="Abdominaux" d="M75 115 Q100 110 125 115 L120 145 Q100 150 80 145 Z" />
                            <MusclePath name="Abdominaux" d="M80 145 Q100 150 120 145 L115 180 Q100 190 85 180 Z" />
                            <MusclePath name="Abdominaux" d="M60 115 L75 115 L80 180 L65 180 Q55 150 60 115 Z" />
                            <MusclePath name="Abdominaux" d="M140 115 L125 115 L120 180 L135 180 Q145 150 140 115 Z" />
                            
                            {/* Quadriceps */}
                            <MusclePath name="Quadriceps" d="M60 200 L95 200 L90 280 L65 280 Z" />
                            <MusclePath name="Quadriceps" d="M140 200 L105 200 L110 280 L135 280 Z" />
                            
                            {/* Mollets */}
                            <MusclePath name="Mollets" d="M65 290 L80 290 L75 360 L60 360 Z" />
                            <MusclePath name="Mollets" d="M135 290 L120 290 L125 360 L140 360 Z" />
                        </G>
                    ) : (
                        <G id="Dos">
                            {/* Dos */}
                            <MusclePath name="Dos" d="M80 60 L120 60 L135 90 L100 120 L65 90 Z" />
                            <MusclePath name="Dos" d="M65 90 L100 120 L90 180 L50 120 Z" />
                            <MusclePath name="Dos" d="M135 90 L100 120 L110 180 L150 120 Z" />
                            
                            {/* Epaules */}
                            <MusclePath name="Épaules" d="M40 65 Q50 62 60 75 L50 110 Q35 95 40 65 Z" />
                            <MusclePath name="Épaules" d="M160 65 Q150 62 140 75 L150 110 Q165 95 160 65 Z" />
                            
                            {/* Triceps */}
                            <MusclePath name="Triceps" d="M40 110 L50 110 L40 145 L35 130 Z" />
                            <MusclePath name="Triceps" d="M160 110 L150 110 L160 145 L165 130 Z" />
                            
                            {/* Fessiers */}
                            <MusclePath name="Fessiers" d="M60 190 L100 200 L95 240 L50 230 Z" />
                            <MusclePath name="Fessiers" d="M140 190 L100 200 L105 240 L150 230 Z" />
                            
                            {/* Ischios */}
                            <MusclePath name="Ischios" d="M50 230 L95 240 L85 300 L60 300 Z" />
                            <MusclePath name="Ischios" d="M150 230 L105 240 L115 300 L140 300 Z" />
                            
                            {/* Mollets */}
                            <MusclePath name="Mollets" d="M60 300 L85 300 L75 360 L60 360 Z" />
                            <MusclePath name="Mollets" d="M140 300 L115 300 L125 360 L140 360 Z" />
                        </G>
                    )}
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 480, // Slightly taller to accommodate the toggle
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 10,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E1E28',
        borderRadius: 20,
        padding: 4,
        borderWidth: 1,
        borderColor: '#2A2A35',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    activeToggle: {
        backgroundColor: '#2A2A35',
    },
    toggleText: {
        color: '#6E6E80',
        fontWeight: '600',
        fontSize: 14,
    },
    activeToggleText: {
        color: '#FFD700', // Gold for active toggle text
    },
    svgContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

// client/src/hooks/useTimezone.js
import { useState, useEffect, useCallback } from 'react';
import { detectAndSendTimezone, detectLocalTimezone } from '../utils/timezoneDetection';

/**
 * Hook personnalisé pour gérer la détection du fuseau horaire
 * @param {string} userId - ID Discord de l'utilisateur
 * @returns {Object} - État et fonctions du fuseau
 */
export default function useTimezone(userId) {
    const [timezone, setTimezone] = useState(null);
    const [localTimezone, setLocalTimezone] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastDetection, setLastDetection] = useState(null);

    // Détecter le fuseau local (sans backend)
    useEffect(() => {
        const detected = detectLocalTimezone();
        setLocalTimezone(detected);
        console.log('📍 Fuseau local détecté:', detected);
    }, []);

    // Fonction pour détecter et envoyer au backend
    const detectTimezone = useCallback(async (force = false) => {
        if (!userId) {
            console.warn('⚠️ Pas d\'ID utilisateur pour la détection fuseau');
            return;
        }

        // Vérifier si on a déjà détecté récemment (dans les 5 minutes)
        if (!force && lastDetection && (Date.now() - lastDetection < 5 * 60 * 1000)) {
            console.log('⏭️ Détection fuseau récente, skip');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await detectAndSendTimezone(userId);
            
            if (result.success) {
                setTimezone(result.timezone);
                setLastDetection(Date.now());
                
                // Stocker dans localStorage pour usage futur
                localStorage.setItem('user_timezone', result.timezone);
                localStorage.setItem('timezone_detected_at', Date.now().toString());
                
                console.log('✅ Fuseau détecté et sauvegardé:', result);
            } else {
                setError(result.error || 'Échec de détection');
                // Fallback sur la détection locale
                if (localTimezone) {
                    setTimezone(localTimezone);
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('❌ Erreur dans detectTimezone:', err);
            
            // Fallback sur la détection locale
            if (localTimezone) {
                setTimezone(localTimezone);
            }
        } finally {
            setLoading(false);
        }
    }, [userId, localTimezone, lastDetection]);

    // Détection automatique au chargement
    useEffect(() => {
        // Vérifier si déjà stocké
        const storedTimezone = localStorage.getItem('user_timezone');
        const storedTime = localStorage.getItem('timezone_detected_at');
        
        if (storedTimezone && storedTime) {
            const age = Date.now() - parseInt(storedTime, 10);
            
            // Si stocké depuis moins de 24h, l'utiliser
            if (age < 24 * 60 * 60 * 1000) {
                setTimezone(storedTimezone);
                console.log('📁 Fuseau restauré depuis localStorage:', storedTimezone);
                return;
            }
        }
        
        // Sinon, détecter
        if (userId && localTimezone) {
            detectTimezone();
        }
    }, [userId, localTimezone, detectTimezone]);

    // Fonction pour forcer une nouvelle détection
    const forceDetection = useCallback(() => {
        console.log('🔄 Forcer nouvelle détection fuseau');
        localStorage.removeItem('user_timezone');
        localStorage.removeItem('timezone_detected_at');
        detectTimezone(true);
    }, [detectTimezone]);

    return {
        // États
        timezone: timezone || localTimezone || 'UTC',
        localTimezone,
        loading,
        error,
        lastDetection,
        
        // Actions
        detectTimezone: () => detectTimezone(true),
        forceDetection,
        
        // Métadonnées
        isDetected: !!timezone,
        isLocalOnly: !timezone && !!localTimezone,
        isFallback: !timezone && !localTimezone,
        detectionAge: lastDetection ? Date.now() - lastDetection : null
    };
}
// File: resources/js/utils/soilbot-api.ts
// Helper functions untuk komunikasi dengan SoilBot API

interface SensorData {
    moisture: number;
    ph: number;
    npk: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
    };
    temperature: number;
    lastUpdate?: string;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'text' | 'suggestion' | 'analysis';
    suggestions?: string[];
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    conversation_id?: string;
}

class SoilBotAPI {
    private baseUrl: string;
    private conversationId: string | null = null;

    constructor() {
        this.baseUrl = '/api/soilbot';
        this.conversationId = this.generateConversationId();
    }

    private generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Update conversation ID if provided
            if (data.conversation_id) {
                this.conversationId = data.conversation_id;
            }

            return data;
        } catch (error) {
            console.error('SoilBot API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    // Get predefined questions
    async getPredefinedQuestions() {
        return this.makeRequest('/questions');
    }

    // Send chat message
    async sendMessage(message: string, sensorData?: SensorData) {
        return this.makeRequest('/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                sensor_data: sensorData,
                conversation_id: this.conversationId,
            }),
        });
    }

    // Get answer for specific question
    async getAnswer(questionId: string, sensorData?: SensorData) {
        return this.makeRequest('/answer', {
            method: 'POST',
            body: JSON.stringify({
                question_id: questionId,
                sensor_data: sensorData,
            }),
        });
    }

    // Get recommendations based on sensor data
    async getRecommendations(sensorData: SensorData) {
        return this.makeRequest('/recommendations', {
            method: 'POST',
            body: JSON.stringify({
                sensor_data: sensorData,
            }),
        });
    }

    // Health check
    async healthCheck() {
        return this.makeRequest('/health');
    }

    // Get conversation ID
    getConversationId(): string | null {
        return this.conversationId;
    }

    // Reset conversation (start new session)
    resetConversation(): void {
        this.conversationId = this.generateConversationId();
    }
}

// Singleton instance
export const soilBotAPI = new SoilBotAPI();

// =====================================================
// REACT HOOKS
// =====================================================

// File: resources/js/hooks/useSoilBot.ts
import { useCallback, useState } from 'react';

export const useSoilBot = (sensorData?: SensorData) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Send message to SoilBot
    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            // Add user message
            const userMessage: ChatMessage = {
                id: `user_${Date.now()}`,
                text,
                sender: 'user',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMessage]);

            setIsLoading(true);
            setError(null);

            try {
                const response = await soilBotAPI.sendMessage(text, sensorData);

                if (response.success && response.data) {
                    const botMessage: ChatMessage = {
                        id: `bot_${Date.now()}`,
                        text: response.data.text,
                        sender: 'bot',
                        timestamp: new Date(),
                        type: response.data.type,
                        suggestions: response.data.suggestions,
                    };
                    setMessages((prev) => [...prev, botMessage]);
                } else {
                    throw new Error(response.error || 'Failed to get response');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');

                // Add error message
                const errorMessage: ChatMessage = {
                    id: `error_${Date.now()}`,
                    text: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                    sender: 'bot',
                    timestamp: new Date(),
                    type: 'text',
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        },
        [sensorData],
    );

    // Get answer for predefined question
    const getAnswer = useCallback(
        async (questionId: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await soilBotAPI.getAnswer(questionId, sensorData);

                if (response.success && response.data) {
                    const botMessage: ChatMessage = {
                        id: `answer_${Date.now()}`,
                        text: response.data.text,
                        sender: 'bot',
                        timestamp: new Date(),
                        type: response.data.type,
                    };
                    setMessages((prev) => [...prev, botMessage]);
                } else {
                    throw new Error(response.error || 'Failed to get answer');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        },
        [sensorData],
    );

    // Clear conversation
    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
        soilBotAPI.resetConversation();
    }, []);

    // Add welcome message
    const addWelcomeMessage = useCallback(() => {
        const welcomeMessage: ChatMessage = {
            id: 'welcome',
            text: `Halo! Saya SoilBot 🤖🌱\n\nSaya di sini untuk membantu Anda dengan pertanyaan seputar pertanian pintar. Pilih topik yang ingin Anda ketahui atau ketik pertanyaan langsung!`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
        };
        setMessages([welcomeMessage]);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        getAnswer,
        clearMessages,
        addWelcomeMessage,
    };
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// File: resources/js/utils/sensor-helpers.ts
export const formatSensorData = (data: SensorData) => {
    return {
        moisture: Math.round(data.moisture),
        ph: Number(data.ph.toFixed(1)),
        npk: {
            nitrogen: Math.round(data.npk.nitrogen),
            phosphorus: Math.round(data.npk.phosphorus),
            potassium: Math.round(data.npk.potassium),
        },
        temperature: Number(data.temperature.toFixed(1)),
        lastUpdate: data.lastUpdate || new Date().toISOString(),
    };
};

export const getSensorStatus = (data: SensorData) => {
    const status = {
        moisture: getMoistureStatus(data.moisture),
        ph: getPHStatus(data.ph),
        npk: getNPKStatus(data.npk),
        temperature: getTemperatureStatus(data.temperature),
    };

    return status;
};

const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { level: 'critical', message: 'Sangat Kering', color: 'red' };
    if (moisture < 50) return { level: 'warning', message: 'Perlu Perhatian', color: 'orange' };
    if (moisture < 70) return { level: 'good', message: 'Optimal', color: 'green' };
    if (moisture < 85) return { level: 'excellent', message: 'Sangat Baik', color: 'blue' };
    return { level: 'warning', message: 'Terlalu Basah', color: 'orange' };
};

const getPHStatus = (ph: number) => {
    if (ph < 5.5) return { level: 'critical', message: 'Sangat Asam', color: 'red' };
    if (ph < 6.0) return { level: 'warning', message: 'Asam', color: 'orange' };
    if (ph <= 7.0) return { level: 'excellent', message: 'Optimal', color: 'green' };
    if (ph < 8.0) return { level: 'warning', message: 'Sedikit Basa', color: 'orange' };
    return { level: 'critical', message: 'Sangat Basa', color: 'red' };
};

const getNPKStatus = (npk: { nitrogen: number; phosphorus: number; potassium: number }) => {
    const total = npk.nitrogen + npk.phosphorus + npk.potassium;
    if (total < 120) return { level: 'critical', message: 'Perlu Pemupukan', color: 'red' };
    if (total < 150) return { level: 'warning', message: 'Cukup Baik', color: 'orange' };
    if (total < 180) return { level: 'good', message: 'Baik', color: 'green' };
    return { level: 'excellent', message: 'Sangat Baik', color: 'blue' };
};

const getTemperatureStatus = (temp: number) => {
    if (temp < 20) return { level: 'warning', message: 'Terlalu Dingin', color: 'blue' };
    if (temp < 25) return { level: 'good', message: 'Sejuk', color: 'green' };
    if (temp < 30) return { level: 'excellent', message: 'Optimal', color: 'green' };
    if (temp < 35) return { level: 'good', message: 'Hangat', color: 'orange' };
    return { level: 'warning', message: 'Terlalu Panas', color: 'red' };
};

// =====================================================
// LOCAL STORAGE HELPERS
// =====================================================

// File: resources/js/utils/storage-helpers.ts
const STORAGE_KEYS = {
    SOILBOT_CONVERSATION: 'soilbot_conversation',
    SOILBOT_PREFERENCES: 'soilbot_preferences',
    SENSOR_DATA_CACHE: 'sensor_data_cache',
};

export const storageHelpers = {
    // Save conversation to localStorage
    saveConversation: (messages: ChatMessage[]) => {
        try {
            localStorage.setItem(STORAGE_KEYS.SOILBOT_CONVERSATION, JSON.stringify(messages));
        } catch (error) {
            console.warn('Failed to save conversation to localStorage:', error);
        }
    },

    // Load conversation from localStorage
    loadConversation: (): ChatMessage[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SOILBOT_CONVERSATION);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Failed to load conversation from localStorage:', error);
            return [];
        }
    },

    // Clear conversation from localStorage
    clearConversation: () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.SOILBOT_CONVERSATION);
        } catch (error) {
            console.warn('Failed to clear conversation from localStorage:', error);
        }
    },

    // Save user preferences
    savePreferences: (preferences: any) => {
        try {
            localStorage.setItem(STORAGE_KEYS.SOILBOT_PREFERENCES, JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save preferences to localStorage:', error);
        }
    },

    // Load user preferences
    loadPreferences: () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SOILBOT_PREFERENCES);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load preferences from localStorage:', error);
            return {};
        }
    },

    // Cache sensor data
    cacheSensorData: (data: SensorData) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEYS.SENSOR_DATA_CACHE, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache sensor data:', error);
        }
    },

    // Get cached sensor data (with expiry check)
    getCachedSensorData: (maxAgeMinutes: number = 5): SensorData | null => {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.SENSOR_DATA_CACHE);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = (Date.now() - timestamp) / (1000 * 60); // Age in minutes

            return age <= maxAgeMinutes ? data : null;
        } catch (error) {
            console.warn('Failed to get cached sensor data:', error);
            return null;
        }
    },
};

export default soilBotAPI;

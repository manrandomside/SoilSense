import { ArrowLeft, BarChart3, Bot, ChevronRight, Droplets, HelpCircle, Leaf, MessageCircle, Send, Sun, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'text' | 'suggestion' | 'analysis';
    suggestions?: string[];
}

interface PreDefinedQuestion {
    id: string;
    question: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    category: 'nutrition' | 'irrigation' | 'pest' | 'weather' | 'general';
    children?: PreDefinedQuestion[];
    answer?: string;
    followUpSuggestions?: string[];
}

interface SoilBotProps {
    sensorData?: {
        moisture: number;
        ph: number;
        npk: {
            nitrogen: number;
            phosphorus: number;
            potassium: number;
        };
        temperature: number;
    };
    onClose: () => void;
}

const SoilBot: React.FC<SoilBotProps> = ({ sensorData, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentView, setCurrentView] = useState<'main' | 'chat'>('main');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Pre-defined questions dengan struktur parent-child
    const predefinedQuestions: PreDefinedQuestion[] = [
        {
            id: 'nutrition',
            question: 'Nutrisi Tanah & NPK',
            icon: Leaf,
            color: 'bg-gradient-to-br from-green-500 to-emerald-500',
            category: 'nutrition',
            children: [
                {
                    id: 'npk-analysis',
                    question: 'Analisis NPK saat ini',
                    icon: BarChart3,
                    color: 'bg-green-500',
                    category: 'nutrition',
                    answer: 'Berdasarkan data sensor terbaru, kondisi NPK tanah Anda menunjukkan...',
                    followUpSuggestions: ['Cara meningkatkan nitrogen', 'Pupuk yang direkomendasikan', 'Jadwal pemupukan optimal'],
                },
                {
                    id: 'nutrient-deficiency',
                    question: 'Tanda kekurangan nutrisi',
                    icon: HelpCircle,
                    color: 'bg-orange-500',
                    category: 'nutrition',
                    answer: 'Berikut adalah tanda-tanda kekurangan nutrisi yang perlu diperhatikan...',
                    followUpSuggestions: ['Solusi kekurangan nitrogen', 'Penanganan kekurangan fosfor', 'Tips meningkatkan kalium'],
                },
            ],
        },
        {
            id: 'irrigation',
            question: 'Pengairan & Kelembaban',
            icon: Droplets,
            color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            category: 'irrigation',
            children: [
                {
                    id: 'moisture-level',
                    question: 'Status kelembaban tanah',
                    icon: Droplets,
                    color: 'bg-blue-500',
                    category: 'irrigation',
                    answer: 'Kelembaban tanah saat ini menunjukkan tingkat yang...',
                    followUpSuggestions: ['Kapan waktu penyiraman', 'Berapa banyak air diperlukan', 'Sistem irigasi otomatis'],
                },
                {
                    id: 'irrigation-schedule',
                    question: 'Jadwal penyiraman optimal',
                    icon: Sun,
                    color: 'bg-cyan-500',
                    category: 'irrigation',
                    answer: 'Berdasarkan kondisi cuaca dan kelembaban tanah...',
                    followUpSuggestions: ['Penyiraman musim kering', 'Penyiraman musim hujan', 'Teknik hemat air'],
                },
            ],
        },
        {
            id: 'pest-disease',
            question: 'Hama & Penyakit',
            icon: Zap,
            color: 'bg-gradient-to-br from-red-500 to-pink-500',
            category: 'pest',
            children: [
                {
                    id: 'pest-prevention',
                    question: 'Pencegahan hama',
                    icon: Zap,
                    color: 'bg-red-500',
                    category: 'pest',
                    answer: 'Strategi pencegahan hama yang efektif meliputi...',
                    followUpSuggestions: ['Pestisida organik', 'Tanaman pengusir hama', 'Monitoring hama rutin'],
                },
            ],
        },
        {
            id: 'weather',
            question: 'Cuaca & Musim',
            icon: Sun,
            color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
            category: 'weather',
            children: [
                {
                    id: 'seasonal-tips',
                    question: 'Tips berdasarkan musim',
                    icon: Sun,
                    color: 'bg-yellow-500',
                    category: 'weather',
                    answer: 'Sesuai dengan kondisi musim saat ini...',
                    followUpSuggestions: ['Persiapan musim hujan', 'Adaptasi musim kering', 'Optimasi cuaca ekstrem'],
                },
            ],
        },
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Welcome message
        const welcomeMessage: ChatMessage = {
            id: 'welcome',
            text: `Halo! Saya SoilBot 🤖🌱\n\nSaya di sini untuk membantu Anda dengan pertanyaan seputar pertanian pintar. Pilih topik yang ingin Anda ketahui atau ketik pertanyaan langsung!`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
        };
        setMessages([welcomeMessage]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const simulateTyping = () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1000 + Math.random() * 1000);
    };

    const addMessage = (text: string, sender: 'user' | 'bot', type: 'text' | 'suggestion' | 'analysis' = 'text', suggestions?: string[]) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
            type,
            suggestions,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleQuestionClick = (question: PreDefinedQuestion) => {
        if (question.children && question.children.length > 0) {
            // Show children questions
            setSelectedCategory(question.id);
        } else {
            // Show answer and go to chat
            setCurrentView('chat');
            addMessage(question.question, 'user');

            simulateTyping();
            setTimeout(() => {
                let answer = question.answer || 'Maaf, jawaban belum tersedia untuk pertanyaan ini.';

                // Dynamic answer based on sensor data
                if (question.id === 'npk-analysis' && sensorData) {
                    answer = generateNPKAnalysis(sensorData);
                } else if (question.id === 'moisture-level' && sensorData) {
                    answer = generateMoistureAnalysis(sensorData);
                }

                addMessage(answer, 'bot', 'analysis', question.followUpSuggestions);
            }, 1500);
        }
    };

    const generateNPKAnalysis = (data: any) => {
        const { nitrogen, phosphorus, potassium } = data.npk;
        let analysis = `📊 **Analisis NPK Tanah Anda:**\n\n`;

        analysis += `🔸 **Nitrogen (N): ${nitrogen}%**\n`;
        if (nitrogen < 30) analysis += '   ⚠️ Rendah - Perlu penambahan pupuk nitrogen\n';
        else if (nitrogen > 60) analysis += '   ✅ Tinggi - Kondisi baik\n';
        else analysis += '   ✅ Normal - Dalam rentang optimal\n';

        analysis += `\n🔸 **Fosfor (P): ${phosphorus}%**\n`;
        if (phosphorus < 20) analysis += '   ⚠️ Rendah - Tambahkan pupuk fosfor\n';
        else if (phosphorus > 50) analysis += '   ✅ Tinggi - Kondisi sangat baik\n';
        else analysis += '   ✅ Normal - Sesuai kebutuhan tanaman\n';

        analysis += `\n🔸 **Kalium (K): ${potassium}%**\n`;
        if (potassium < 40) analysis += '   ⚠️ Rendah - Perlu peningkatan kalium\n';
        else if (potassium > 80) analysis += '   ✅ Sangat baik - Optimal untuk pertumbuhan\n';
        else analysis += '   ✅ Baik - Kondisi mendukung hasil panen\n';

        return analysis;
    };

    const generateMoistureAnalysis = (data: any) => {
        const moisture = data.moisture;
        let analysis = `💧 **Analisis Kelembaban Tanah:**\n\n`;

        analysis += `🔸 **Kelembaban saat ini: ${moisture}%**\n\n`;

        if (moisture < 30) {
            analysis += '⚠️ **Status: KERING**\n';
            analysis += '• Penyiraman segera diperlukan\n';
            analysis += '• Risiko stress pada tanaman\n';
            analysis += '• Rekomendasi: Siram 2-3 kali hari ini\n';
        } else if (moisture < 50) {
            analysis += '🟡 **Status: SEDANG**\n';
            analysis += '• Kondisi cukup baik\n';
            analysis += '• Monitor dalam 12-24 jam\n';
            analysis += '• Rekomendasi: Siram besok pagi\n';
        } else if (moisture < 70) {
            analysis += '✅ **Status: OPTIMAL**\n';
            analysis += '• Kelembaban ideal untuk pertumbuhan\n';
            analysis += '• Tanaman dalam kondisi baik\n';
            analysis += '• Rekomendasi: Pertahankan kondisi ini\n';
        } else {
            analysis += '🔵 **Status: TINGGI**\n';
            analysis += '• Kelembaban sangat baik\n';
            analysis += '• Hati-hati dengan genangan air\n';
            analysis += '• Rekomendasi: Pastikan drainase baik\n';
        }

        return analysis;
    };

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        addMessage(inputText, 'user');
        const userMessage = inputText;
        setInputText('');

        simulateTyping();
        setTimeout(() => {
            const response = generateSmartResponse(userMessage);
            addMessage(response, 'bot');
        }, 1500);
    };

    const generateSmartResponse = (message: string) => {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('npk') || lowerMessage.includes('nutrisi')) {
            return sensorData ? generateNPKAnalysis(sensorData) : 'Untuk analisis NPK yang akurat, pastikan sensor SoilSense aktif dan terhubung.';
        }

        if (lowerMessage.includes('air') || lowerMessage.includes('kelembaban')) {
            return sensorData ? generateMoistureAnalysis(sensorData) : 'Untuk informasi kelembaban real-time, aktivkan sensor kelembaban SoilSense.';
        }

        if (lowerMessage.includes('pupuk')) {
            return `🌱 **Rekomendasi Pupuk:**\n\nBerdasarkan kondisi tanah saat ini:\n• Pupuk NPK 16-16-16 untuk nutrisi seimbang\n• Pupuk organik kompos untuk struktur tanah\n• Pupuk cair untuk penyerapan cepat\n\n**Waktu aplikasi:** Pagi hari setelah penyiraman`;
        }

        if (lowerMessage.includes('hama') || lowerMessage.includes('pest')) {
            return `🐛 **Tips Pencegahan Hama:**\n\n• Rotasi tanaman setiap musim\n• Gunakan pestisida organik (neem oil)\n• Tanam tanaman pendamping (marigold)\n• Monitoring rutin setiap 3 hari\n• Jaga kebersihan lahan`;
        }

        // Default response
        return `Terima kasih atas pertanyaan Anda! 🤖\n\nSaya selalu belajar untuk memberikan jawaban yang lebih baik. Sementara itu, Anda bisa:\n\n• Pilih topik dari menu utama\n• Tanya tentang NPK, kelembaban, atau pupuk\n• Konsultasi dengan ahli pertanian kami\n\nAda yang bisa saya bantu lagi?`;
    };

    const renderMainMenu = () => (
        <div className="space-y-4">
            {selectedCategory ? (
                <div>
                    <button onClick={() => setSelectedCategory(null)} className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-800">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Kembali ke menu utama
                    </button>

                    <div className="grid gap-3">
                        {predefinedQuestions
                            .find((q) => q.id === selectedCategory)
                            ?.children?.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() => handleQuestionClick(child)}
                                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`rounded-lg p-2 ${child.color} text-white`}>
                                            <child.icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-gray-800">{child.question}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                                </button>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {predefinedQuestions.map((question) => (
                        <button
                            key={question.id}
                            onClick={() => handleQuestionClick(question)}
                            className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`rounded-lg p-3 ${question.color} text-white`}>
                                    <question.icon className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">{question.question}</div>
                                    <div className="text-xs text-gray-500">{question.children?.length || 0} topik tersedia</div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                        </button>
                    ))}
                </div>
            )}

            <div className="border-t pt-4">
                <button
                    onClick={() => setCurrentView('chat')}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-white transition-all hover:from-green-600 hover:to-emerald-600"
                >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat Langsung dengan SoilBot</span>
                </button>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b bg-gray-50 p-4">
                <button onClick={() => setCurrentView('main')} className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Menu Utama
                </button>
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-gray-800">SoilBot</span>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                </div>
            </div>

            {/* Messages */}
            <div className="max-h-96 flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-xs rounded-2xl px-4 py-2 lg:max-w-md ${
                                message.sender === 'user' ? 'rounded-br-sm bg-green-500 text-white' : 'rounded-bl-sm bg-gray-100 text-gray-800'
                            }`}
                        >
                            <div className="text-sm whitespace-pre-line">{message.text}</div>
                            {message.suggestions && (
                                <div className="mt-2 space-y-1">
                                    {message.suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                addMessage(suggestion, 'user');
                                                simulateTyping();
                                                setTimeout(() => {
                                                    const response = generateSmartResponse(suggestion);
                                                    addMessage(response, 'bot');
                                                }, 1000);
                                            }}
                                            className="block w-full rounded-lg bg-white/20 px-2 py-1 text-left text-xs transition-all hover:bg-white/30"
                                        >
                                            💡 {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2">
                            <div className="flex space-x-1">
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-gray-50 p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ketik pertanyaan Anda..."
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                    />
                    <button onClick={handleSendMessage} className="rounded-full bg-green-500 p-2 text-white transition-colors hover:bg-green-600">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-white/20 p-2">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">SoilBot</h2>
                            <p className="text-sm opacity-90">Asisten Pertanian Pintar</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-white/20">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="h-[600px]">{currentView === 'main' ? renderMainMenu() : renderChat()}</div>
            </div>
        </div>
    );
};

export default SoilBot;

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SoilBotController extends Controller
{
    /**
     * Get predefined questions for chatbot
     */
    public function getPredefinedQuestions()
    {
        $questions = [
            [
                'id' => 'nutrition',
                'question' => 'Nutrisi Tanah & NPK',
                'category' => 'nutrition',
                'icon' => 'Leaf',
                'color' => 'bg-gradient-to-br from-green-500 to-emerald-500',
                'children' => [
                    [
                        'id' => 'npk-analysis',
                        'question' => 'Analisis NPK saat ini',
                        'category' => 'nutrition',
                        'answer_template' => 'npk_analysis',
                        'follow_up_suggestions' => [
                            'Cara meningkatkan nitrogen',
                            'Pupuk yang direkomendasikan',
                            'Jadwal pemupukan optimal'
                        ]
                    ],
                    [
                        'id' => 'nutrient-deficiency',
                        'question' => 'Tanda kekurangan nutrisi',
                        'category' => 'nutrition',
                        'answer_template' => 'nutrient_deficiency',
                        'follow_up_suggestions' => [
                            'Solusi kekurangan nitrogen',
                            'Penanganan kekurangan fosfor',
                            'Tips meningkatkan kalium'
                        ]
                    ],
                    [
                        'id' => 'fertilizer-guide',
                        'question' => 'Panduan pemupukan',
                        'category' => 'nutrition',
                        'answer_template' => 'fertilizer_guide',
                        'follow_up_suggestions' => [
                            'Dosis pupuk organik',
                            'Waktu pemupukan terbaik',
                            'Kombinasi pupuk NPK'
                        ]
                    ]
                ]
            ],
            [
                'id' => 'irrigation',
                'question' => 'Pengairan & Kelembaban',
                'category' => 'irrigation',
                'icon' => 'Droplets',
                'color' => 'bg-gradient-to-br from-blue-500 to-cyan-500',
                'children' => [
                    [
                        'id' => 'moisture-level',
                        'question' => 'Status kelembaban tanah',
                        'category' => 'irrigation',
                        'answer_template' => 'moisture_analysis',
                        'follow_up_suggestions' => [
                            'Kapan waktu penyiraman',
                            'Berapa banyak air diperlukan',
                            'Sistem irigasi otomatis'
                        ]
                    ],
                    [
                        'id' => 'irrigation-schedule',
                        'question' => 'Jadwal penyiraman optimal',
                        'category' => 'irrigation',
                        'answer_template' => 'irrigation_schedule',
                        'follow_up_suggestions' => [
                            'Penyiraman musim kering',
                            'Penyiraman musim hujan',
                            'Teknik hemat air'
                        ]
                    ],
                    [
                        'id' => 'water-quality',
                        'question' => 'Kualitas air untuk irigasi',
                        'category' => 'irrigation',
                        'answer_template' => 'water_quality',
                        'follow_up_suggestions' => [
                            'pH air optimal',
                            'Filter air sederhana',
                            'Air hujan vs air tanah'
                        ]
                    ]
                ]
            ],
            [
                'id' => 'pest-disease',
                'question' => 'Hama & Penyakit',
                'category' => 'pest',
                'icon' => 'Zap',
                'color' => 'bg-gradient-to-br from-red-500 to-pink-500',
                'children' => [
                    [
                        'id' => 'pest-prevention',
                        'question' => 'Pencegahan hama',
                        'category' => 'pest',
                        'answer_template' => 'pest_prevention',
                        'follow_up_suggestions' => [
                            'Pestisida organik',
                            'Tanaman pengusir hama',
                            'Monitoring hama rutin'
                        ]
                    ],
                    [
                        'id' => 'disease-identification',
                        'question' => 'Identifikasi penyakit tanaman',
                        'category' => 'pest',
                        'answer_template' => 'disease_identification',
                        'follow_up_suggestions' => [
                            'Penyakit daun menguning',
                            'Busuk akar penanganan',
                            'Jamur pada tanaman'
                        ]
                    ]
                ]
            ],
            [
                'id' => 'weather-climate',
                'question' => 'Cuaca & Musim',
                'category' => 'weather',
                'icon' => 'Sun',
                'color' => 'bg-gradient-to-br from-yellow-500 to-orange-500',
                'children' => [
                    [
                        'id' => 'seasonal-tips',
                        'question' => 'Tips berdasarkan musim',
                        'category' => 'weather',
                        'answer_template' => 'seasonal_tips',
                        'follow_up_suggestions' => [
                            'Persiapan musim hujan',
                            'Adaptasi musim kering',
                            'Optimasi cuaca ekstrem'
                        ]
                    ],
                    [
                        'id' => 'climate-adaptation',
                        'question' => 'Adaptasi perubahan iklim',
                        'category' => 'weather',
                        'answer_template' => 'climate_adaptation',
                        'follow_up_suggestions' => [
                            'Varietas tahan panas',
                            'Teknik konservasi air',
                            'Greenhouse sederhana'
                        ]
                    ]
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    /**
     * Process chat message and generate response
     */
    public function processMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'sensor_data' => 'nullable|array',
            'conversation_id' => 'nullable|string'
        ]);

        $message = $request->input('message');
        $sensorData = $request->input('sensor_data');
        $conversationId = $request->input('conversation_id', 'anonymous-' . time());

        try {
            // Log conversation for improvement
            $this->logConversation($conversationId, $message, 'user');

            // Generate AI response
            $response = $this->generateSmartResponse($message, $sensorData);

            // Log bot response
            $this->logConversation($conversationId, $response['text'], 'bot');

            return response()->json([
                'success' => true,
                'data' => $response,
                'conversation_id' => $conversationId
            ]);

        } catch (\Exception $e) {
            Log::error('SoilBot Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                'data' => [
                    'text' => 'Maaf, saya sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat. 🤖',
                    'type' => 'error',
                    'suggestions' => ['Kembali ke menu utama', 'Coba pertanyaan lain']
                ]
            ], 500);
        }
    }

    /**
     * Get specific answer by question ID
     */
    public function getAnswer(Request $request)
    {
        $request->validate([
            'question_id' => 'required|string',
            'sensor_data' => 'nullable|array'
        ]);

        $questionId = $request->input('question_id');
        $sensorData = $request->input('sensor_data');

        $response = $this->generateAnswerByQuestionId($questionId, $sensorData);

        return response()->json([
            'success' => true,
            'data' => $response
        ]);
    }

    /**
     * Get chat recommendations based on current sensor data
     */
    public function getRecommendations(Request $request)
    {
        $sensorData = $request->input('sensor_data');

        if (!$sensorData) {
            return response()->json([
                'success' => false,
                'error' => 'Sensor data required'
            ], 400);
        }

        $recommendations = $this->generateRecommendations($sensorData);

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    /**
     * Generate smart response based on message content
     */
    private function generateSmartResponse($message, $sensorData = null)
    {
        $lowerMessage = strtolower($message);
        $response = [
            'text' => '',
            'type' => 'text',
            'suggestions' => []
        ];

        // NPK/Nutrition related
        if (strpos($lowerMessage, 'npk') !== false || 
            strpos($lowerMessage, 'nutrisi') !== false ||
            strpos($lowerMessage, 'nitrogen') !== false ||
            strpos($lowerMessage, 'fosfor') !== false ||
            strpos($lowerMessage, 'kalium') !== false) {
            
            if ($sensorData && isset($sensorData['npk'])) {
                $response['text'] = $this->generateNPKAnalysis($sensorData['npk']);
                $response['type'] = 'analysis';
                $response['suggestions'] = [
                    'Rekomendasi pupuk untuk NPK rendah',
                    'Jadwal pemupukan optimal',
                    'Cara meningkatkan efisiensi nutrisi'
                ];
            } else {
                $response['text'] = "🌱 **Informasi NPK (Nitrogen-Phosphorus-Potassium):**\n\n" .
                    "NPK adalah tiga nutrisi utama yang dibutuhkan tanaman:\n" .
                    "• **Nitrogen (N)**: Pertumbuhan daun dan batang\n" .
                    "• **Phosphorus (P)**: Perkembangan akar dan bunga\n" .
                    "• **Potassium (K)**: Ketahanan dan kualitas buah\n\n" .
                    "Untuk analisis real-time, pastikan sensor SoilSense aktif!";
                $response['suggestions'] = [
                    'Cara mengaktifkan sensor NPK',
                    'Tips pemupukan manual',
                    'Tanda kekurangan nutrisi'
                ];
            }
        }
        
        // Moisture/Water related
        elseif (strpos($lowerMessage, 'air') !== false || 
                 strpos($lowerMessage, 'kelembaban') !== false ||
                 strpos($lowerMessage, 'siram') !== false ||
                 strpos($lowerMessage, 'irigasi') !== false) {
            
            if ($sensorData && isset($sensorData['moisture'])) {
                $response['text'] = $this->generateMoistureAnalysis($sensorData['moisture']);
                $response['type'] = 'analysis';
                $response['suggestions'] = [
                    'Jadwal penyiraman otomatis',
                    'Teknik hemat air',
                    'Sistem irigasi tetes'
                ];
            } else {
                $response['text'] = "💧 **Panduan Pengairan Tanaman:**\n\n" .
                    "Kelembaban optimal berbeda untuk setiap jenis tanaman:\n" .
                    "• **Sayuran**: 50-70%\n" .
                    "• **Buah-buahan**: 60-80%\n" .
                    "• **Tanaman hias**: 40-60%\n\n" .
                    "**Tips penyiraman:**\n" .
                    "• Pagi hari (06:00-08:00) atau sore (16:00-18:00)\n" .
                    "• Siram secara merata\n" .
                    "• Pastikan drainase baik";
                $response['suggestions'] = [
                    'Cara mengecek kelembaban manual',
                    'Tanda tanaman kekurangan air',
                    'Sistem penyiraman sederhana'
                ];
            }
        }
        
        // Fertilizer related
        elseif (strpos($lowerMessage, 'pupuk') !== false ||
                 strpos($lowerMessage, 'fertilizer') !== false) {
            
            $response['text'] = "🌾 **Panduan Pemupukan:**\n\n" .
                "**Jenis Pupuk:**\n" .
                "• **Organik**: Kompos, pupuk kandang, vermikompos\n" .
                "• **Anorganik**: NPK, Urea, TSP, KCl\n" .
                "• **Cair**: Untuk penyerapan cepat\n\n" .
                "**Jadwal Pemupukan:**\n" .
                "• Pupuk dasar: Saat tanam\n" .
                "• Pupuk susulan: 2-4 minggu sekali\n" .
                "• Pupuk cair: 1-2 minggu sekali\n\n" .
                "**Dosis umum**: 2-3 sendok makan per tanaman (sesuaikan ukuran)";
            $response['suggestions'] = [
                'Cara membuat kompos sendiri',
                'Pupuk organik vs kimia',
                'Tanda overfertilisasi'
            ];
        }
        
        // Pest/Disease related
        elseif (strpos($lowerMessage, 'hama') !== false ||
                 strpos($lowerMessage, 'pest') !== false ||
                 strpos($lowerMessage, 'penyakit') !== false ||
                 strpos($lowerMessage, 'ulat') !== false) {
            
            $response['text'] = "🐛 **Pengendalian Hama dan Penyakit:**\n\n" .
                "**Pencegahan Natural:**\n" .
                "• Rotasi tanaman setiap musim\n" .
                "• Tanaman pendamping (basil, marigold)\n" .
                "• Jaga kebersihan lahan\n" .
                "• Monitor rutin 2-3 hari sekali\n\n" .
                "**Pestisida Organik:**\n" .
                "• Neem oil untuk aphids\n" .
                "• Sabun cuci untuk kutu\n" .
                "• Bawang putih + cabai untuk ulat\n" .
                "• Bacillus thuringiensis untuk larva";
            $response['suggestions'] = [
                'Identifikasi hama umum',
                'Resep pestisida alami',
                'Kapan menggunakan pestisida kimia'
            ];
        }
        
        // Weather/Season related
        elseif (strpos($lowerMessage, 'cuaca') !== false ||
                 strpos($lowerMessage, 'musim') !== false ||
                 strpos($lowerMessage, 'hujan') !== false ||
                 strpos($lowerMessage, 'kering') !== false) {
            
            $currentSeason = $this->getCurrentSeason();
            $response['text'] = "🌤️ **Tips Musiman (Musim {$currentSeason}):**\n\n";
            
            if ($currentSeason === 'Kering') {
                $response['text'] .= "**Strategi Musim Kering:**\n" .
                    "• Penyiraman lebih sering (2x sehari)\n" .
                    "• Mulching untuk menahan kelembaban\n" .
                    "• Pilih varietas tahan kekeringan\n" .
                    "• Naungan sementara saat terik\n" .
                    "• Harvest air hujan untuk cadangan";
            } else {
                $response['text'] .= "**Strategi Musim Hujan:**\n" .
                    "• Pastikan drainase lancar\n" .
                    "• Kurangi frekuensi penyiraman\n" .
                    "• Waspada penyakit jamur\n" .
                    "• Aplikasi fungisida preventif\n" .
                    "• Panen sebelum hujan deras";
            }
            
            $response['suggestions'] = [
                'Persiapan pergantian musim',
                'Tanaman sesuai musim',
                'Manajemen air hujan'
            ];
        }
        
        // pH related
        elseif (strpos($lowerMessage, 'ph') !== false ||
                 strpos($lowerMessage, 'asam') !== false ||
                 strpos($lowerMessage, 'basa') !== false) {
            
            if ($sensorData && isset($sensorData['ph'])) {
                $response['text'] = $this->generatePHAnalysis($sensorData['ph']);
                $response['type'] = 'analysis';
            } else {
                $response['text'] = "⚗️ **Panduan pH Tanah:**\n\n" .
                    "**Skala pH:**\n" .
                    "• 0-6.9: Asam\n" .
                    "• 7.0: Netral\n" .
                    "• 7.1-14: Basa\n\n" .
                    "**pH Optimal:**\n" .
                    "• Sayuran: 6.0-7.0\n" .
                    "• Buah: 5.5-6.5\n" .
                    "• Padi: 5.5-6.5\n\n" .
                    "**Koreksi pH:**\n" .
                    "• Tanah asam: Tambah kapur\n" .
                    "• Tanah basa: Tambah sulfur/kompos";
            }
            $response['suggestions'] = [
                'Cara mengukur pH tanah',
                'Bahan alami untuk koreksi pH',
                'Tanaman untuk tanah asam/basa'
            ];
        }
        
        // Default response untuk pertanyaan umum
        else {
            $response['text'] = "🤖 **Halo! Saya SoilBot, asisten pertanian pintar Anda.**\n\n" .
                "Saya bisa membantu dengan:\n" .
                "• Analisis kondisi tanah (NPK, pH, kelembaban)\n" .
                "• Rekomendasi pemupukan dan penyiraman\n" .
                "• Tips pengendalian hama dan penyakit\n" .
                "• Panduan musiman dan cuaca\n" .
                "• Troubleshooting masalah tanaman\n\n" .
                "Silakan tanyakan hal spesifik atau pilih topik dari menu utama! 🌱";
            $response['suggestions'] = [
                'Analisis nutrisi tanah saya',
                'Tips penyiraman yang tepat',
                'Cara mengatasi hama pada tanaman',
                'Rekomendasi pupuk organic'
            ];
        }

        return $response;
    }

    /**
     * Generate NPK analysis from sensor data
     */
    private function generateNPKAnalysis($npkData)
    {
        $nitrogen = $npkData['nitrogen'] ?? 0;
        $phosphorus = $npkData['phosphorus'] ?? 0;
        $potassium = $npkData['potassium'] ?? 0;

        $analysis = "📊 **Analisis NPK Real-time:**\n\n";

        // Nitrogen Analysis
        $analysis .= "🔸 **Nitrogen (N): {$nitrogen}%**\n";
        if ($nitrogen < 30) {
            $analysis .= "   ⚠️ **RENDAH** - Tanaman butuh nutrisi nitrogen segera\n";
            $analysis .= "   💡 Rekomendasi: Pupuk Urea atau pupuk hijau\n";
        } elseif ($nitrogen > 60) {
            $analysis .= "   ✅ **TINGGI** - Pertumbuhan daun optimal\n";
            $analysis .= "   💡 Pertahankan kondisi ini\n";
        } else {
            $analysis .= "   ✅ **NORMAL** - Dalam rentang sehat\n";
        }

        // Phosphorus Analysis
        $analysis .= "\n🔸 **Phosphorus (P): {$phosphorus}%**\n";
        if ($phosphorus < 20) {
            $analysis .= "   ⚠️ **RENDAH** - Akar dan bunga perlu perhatian\n";
            $analysis .= "   💡 Rekomendasi: TSP atau pupuk tulang\n";
        } elseif ($phosphorus > 50) {
            $analysis .= "   ✅ **TINGGI** - Perkembangan akar excellent\n";
        } else {
            $analysis .= "   ✅ **NORMAL** - Mendukung pembungaan baik\n";
        }

        // Potassium Analysis
        $analysis .= "\n🔸 **Potassium (K): {$potassium}%**\n";
        if ($potassium < 40) {
            $analysis .= "   ⚠️ **RENDAH** - Buah kurang berkualitas\n";
            $analysis .= "   💡 Rekomendasi: KCl atau abu kayu\n";
        } elseif ($potassium > 80) {
            $analysis .= "   ✅ **SANGAT BAIK** - Buah berkualitas premium\n";
        } else {
            $analysis .= "   ✅ **BAIK** - Kondisi optimal untuk buah\n";
        }

        // Overall recommendation
        $total = $nitrogen + $phosphorus + $potassium;
        $analysis .= "\n📈 **Skor Total: {$total}%**\n";
        
        if ($total < 120) {
            $analysis .= "🔥 **Action Required**: Pemupukan menyeluruh diperlukan";
        } elseif ($total > 180) {
            $analysis .= "🌟 **Excellent**: Tanah dalam kondisi prima!";
        } else {
            $analysis .= "👍 **Good**: Kondisi tanah mendukung pertumbuhan";
        }

        return $analysis;
    }

    /**
     * Generate moisture analysis
     */
    private function generateMoistureAnalysis($moisture)
    {
        $analysis = "💧 **Analisis Kelembaban Tanah:**\n\n";
        $analysis .= "🔸 **Kelembaban saat ini: {$moisture}%**\n\n";

        if ($moisture < 30) {
            $analysis .= "🚨 **STATUS: KRITIS - KERING**\n";
            $analysis .= "• Penyiraman SEGERA diperlukan\n";
            $analysis .= "• Tanaman dalam stress air\n";
            $analysis .= "• Risiko layu dan kerusakan akar\n\n";
            $analysis .= "💡 **Action Plan:**\n";
            $analysis .= "• Siram 2-3 kali hari ini\n";
            $analysis .= "• Berikan mulching\n";
            $analysis .= "• Monitor setiap 2 jam";
        } elseif ($moisture < 50) {
            $analysis .= "⚠️ **STATUS: SEDANG - PERLU PERHATIAN**\n";
            $analysis .= "• Kondisi borderline\n";
            $analysis .= "• Beberapa tanaman mungkin stress\n";
            $analysis .= "• Produktivitas mulai menurun\n\n";
            $analysis .= "💡 **Rekomendasi:**\n";
            $analysis .= "• Siram dalam 6-12 jam\n";
            $analysis .= "• Cek kembali besok pagi\n";
            $analysis .= "• Evaluasi sistem irigasi";
        } elseif ($moisture < 70) {
            $analysis .= "✅ **STATUS: OPTIMAL**\n";
            $analysis .= "• Kelembaban ideal untuk pertumbuhan\n";
            $analysis .= "• Tanaman berkembang baik\n";
            $analysis .= "• Akar aktif menyerap nutrisi\n\n";
            $analysis .= "💡 **Maintenance:**\n";
            $analysis .= "• Pertahankan kondisi ini\n";
            $analysis .= "• Monitor harian\n";
            $analysis .= "• Siram sesuai jadwal normal";
        } elseif ($moisture < 85) {
            $analysis .= "🔵 **STATUS: TINGGI - SANGAT BAIK**\n";
            $analysis .= "• Kondisi premium untuk tanaman\n";
            $analysis .= "• Pertumbuhan maksimal\n";
            $analysis .= "• Efisiensi nutrisi tinggi\n\n";
            $analysis .= "💡 **Tips:**\n";
            $analysis .= "• Kondisi ideal, lanjutkan\n";
            $analysis .= "• Pastikan drainase baik\n";
            $analysis .= "• Manfaatkan untuk propagasi";
        } else {
            $analysis .= "🌊 **STATUS: SANGAT TINGGI**\n";
            $analysis .= "• Risiko genangan air\n";
            $analysis .= "• Potensi busuk akar\n";
            $analysis .= "• Oksigen terbatas di akar\n\n";
            $analysis .= "⚠️ **Perhatian:**\n";
            $analysis .= "• Cek sistem drainase\n";
            $analysis .= "• Kurangi penyiraman\n";
            $analysis .= "• Aerasi tanah jika perlu";
        }

        return $analysis;
    }

    /**
     * Generate pH analysis
     */
    private function generatePHAnalysis($ph)
    {
        $analysis = "⚗️ **Analisis pH Tanah:**\n\n";
        $analysis .= "🔸 **pH saat ini: {$ph}**\n\n";

        if ($ph < 5.5) {
            $analysis .= "🔴 **STATUS: SANGAT ASAM**\n";
            $analysis .= "• Nutrisi sulit diserap tanaman\n";
            $analysis .= "• Aktivitas mikroba terhambat\n";
            $analysis .= "• Risiko keracunan aluminium\n\n";
            $analysis .= "💡 **Solusi:**\n";
            $analysis .= "• Tambahkan kapur pertanian\n";
            $analysis .= "• Aplikasi abu kayu\n";
            $analysis .= "• Kompos untuk buffer pH";
        } elseif ($ph < 6.0) {
            $analysis .= "🟡 **STATUS: ASAM**\n";
            $analysis .= "• Sebagian nutrisi terikat\n";
            $analysis .= "• Cocok untuk tanaman asidofil\n";
            $analysis .= "• Perlu sedikit koreksi\n\n";
            $analysis .= "💡 **Penyesuaian:**\n";
            $analysis .= "• Kapur dolomit secukupnya\n";
            $analysis .= "• Pupuk organik rutin\n";
            $analysis .= "• Monitor bulanan";
        } elseif ($ph <= 7.0) {
            $analysis .= "✅ **STATUS: OPTIMAL**\n";
            $analysis .= "• pH ideal untuk mayoritas tanaman\n";
            $analysis .= "• Nutrisi mudah diserap\n";
            $analysis .= "• Aktivitas mikroba aktif\n\n";
            $analysis .= "💡 **Maintenance:**\n";
            $analysis .= "• Pertahankan dengan kompos\n";
            $analysis .= "• Monitor berkala\n";
            $analysis .= "• Hindari over-liming";
        } elseif ($ph < 8.0) {
            $analysis .= "🟠 **STATUS: SEDIKIT BASA**\n";
            $analysis .= "• Beberapa nutrisi mulai terikat\n";
            $analysis .= "• Zat besi sulit diserap\n";
            $analysis .= "• Perlu koreksi minor\n\n";
            $analysis .= "💡 **Koreksi:**\n";
            $analysis .= "• Tambahkan belerang\n";
            $analysis .= "• Pupuk organik asam\n";
            $analysis .= "• Mulching dengan daun pine";
        } else {
            $analysis .= "🔵 **STATUS: SANGAT BASA**\n";
            $analysis .= "• Nutrisi banyak yang terikat\n";
            $analysis .= "• Defisiensi mikronutrient\n";
            $analysis .= "• Perlu koreksi serius\n\n";
            $analysis .= "💡 **Treatment:**\n";
            $analysis .= "• Sulfur elemental\n";
            $analysis .= "• Pupuk asam tinggi\n";
            $analysis .= "• Sistem drainase baik";
        }

        return $analysis;
    }

    /**
     * Generate recommendations based on sensor data
     */
    private function generateRecommendations($sensorData)
    {
        $recommendations = [];

        // NPK recommendations
        if (isset($sensorData['npk'])) {
            $npk = $sensorData['npk'];
            
            if ($npk['nitrogen'] < 30) {
                $recommendations[] = [
                    'type' => 'urgent',
                    'title' => 'Nitrogen Rendah',
                    'message' => 'Aplikasi pupuk nitrogen segera diperlukan',
                    'action' => 'Berikan pupuk Urea 2-3 sdm per tanaman'
                ];
            }
            
            if ($npk['phosphorus'] < 20) {
                $recommendations[] = [
                    'type' => 'warning',
                    'title' => 'Fosfor Kurang',
                    'message' => 'Perkembangan akar dan bunga terhambat',
                    'action' => 'Aplikasi TSP atau pupuk tulang'
                ];
            }
            
            if ($npk['potassium'] < 40) {
                $recommendations[] = [
                    'type' => 'info',
                    'title' => 'Kalium Perlu Ditingkatkan',
                    'message' => 'Kualitas buah bisa lebih optimal',
                    'action' => 'Tambahkan KCl atau abu kayu'
                ];
            }
        }

        // Moisture recommendations
        if (isset($sensorData['moisture'])) {
            $moisture = $sensorData['moisture'];
            
            if ($moisture < 30) {
                $recommendations[] = [
                    'type' => 'critical',
                    'title' => 'Kelembaban Kritis',
                    'message' => 'Tanaman dalam kondisi stress air',
                    'action' => 'Penyiraman segera diperlukan'
                ];
            } elseif ($moisture > 85) {
                $recommendations[] = [
                    'type' => 'warning',
                    'title' => 'Kelembaban Tinggi',
                    'message' => 'Risiko busuk akar dan penyakit jamur',
                    'action' => 'Cek drainase dan kurangi penyiraman'
                ];
            }
        }

        // pH recommendations
        if (isset($sensorData['ph'])) {
            $ph = $sensorData['ph'];
            
            if ($ph < 5.5) {
                $recommendations[] = [
                    'type' => 'urgent',
                    'title' => 'pH Terlalu Asam',
                    'message' => 'Nutrisi sulit diserap oleh tanaman',
                    'action' => 'Aplikasi kapur pertanian'
                ];
            } elseif ($ph > 8.0) {
                $recommendations[] = [
                    'type' => 'warning',
                    'title' => 'pH Terlalu Basa',
                    'message' => 'Defisiensi mikronutrient mungkin terjadi',
                    'action' => 'Tambahkan belerang atau kompos asam'
                ];
            }
        }

        // Seasonal recommendations
        $season = $this->getCurrentSeason();
        if ($season === 'Kering') {
            $recommendations[] = [
                'type' => 'info',
                'title' => 'Tips Musim Kering',
                'message' => 'Optimalkan penggunaan air',
                'action' => 'Gunakan mulching dan penyiraman pagi/sore'
            ];
        }

        return $recommendations;
    }

    /**
     * Log conversation for learning and improvement
     */
    private function logConversation($conversationId, $message, $sender)
    {
        try {
            // Simple logging to database (create table if needed)
            DB::table('soilbot_conversations')->insert([
                'conversation_id' => $conversationId,
                'message' => $message,
                'sender' => $sender,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (\Exception $e) {
            // If table doesn't exist, just log to file
            Log::info("SoilBot [{$conversationId}] {$sender}: {$message}");
        }
    }

    /**
     * Get current season based on month
     */
    private function getCurrentSeason()
    {
        $month = date('n');
        // Indonesia: Dry season (April-October), Wet season (November-March)
        return ($month >= 4 && $month <= 10) ? 'Kering' : 'Hujan';
    }

    /**
     * Generate answer by specific question ID
     */
    private function generateAnswerByQuestionId($questionId, $sensorData = null)
    {
        $answers = [
            'npk-analysis' => $sensorData ? $this->generateNPKAnalysis($sensorData['npk'] ?? []) : 
                'Sensor NPK tidak aktif. Aktifkan sensor untuk analisis real-time.',
            
            'moisture-level' => $sensorData ? $this->generateMoistureAnalysis($sensorData['moisture'] ?? 0) :
                'Sensor kelembaban tidak tersedia. Cek secara manual dengan jari atau stick kayu.',
            
            'nutrient-deficiency' => $this->getDeficiencyGuide(),
            'fertilizer-guide' => $this->getFertilizerGuide(),
            'pest-prevention' => $this->getPestPreventionGuide(),
            'seasonal-tips' => $this->getSeasonalTips(),
            'irrigation-schedule' => $this->getIrrigationGuide(),
        ];

        return [
            'text' => $answers[$questionId] ?? 'Jawaban untuk pertanyaan ini sedang dikembangkan.',
            'type' => 'analysis'
        ];
    }

    private function getDeficiencyGuide()
    {
        return "🌿 **Panduan Identifikasi Kekurangan Nutrisi:**\n\n" .
            "**🔸 Kekurangan Nitrogen:**\n" .
            "• Daun menguning dari bawah ke atas\n" .
            "• Pertumbuhan lambat dan kerdil\n" .
            "• Batang lemah dan tipis\n\n" .
            "**🔸 Kekurangan Fosfor:**\n" .
            "• Daun berwarna ungu/kemerahan\n" .
            "• Akar berkembang buruk\n" .
            "• Pembungaan terlambat\n\n" .
            "**🔸 Kekurangan Kalium:**\n" .
            "• Tepi daun menguning/coklat\n" .
            "• Buah kecil dan tidak manis\n" .
            "• Tanaman mudah rebah\n\n" .
            "**💡 Solusi Cepat:**\n" .
            "• Pupuk daun untuk nutrisi instan\n" .
            "• Kompos tea untuk organik\n" .
            "• Test soil untuk diagnosis akurat";
    }

    private function getFertilizerGuide()
    {
        return "🌾 **Panduan Lengkap Pemupukan:**\n\n" .
            "**Tahap 1: Pupuk Dasar (saat tanam)**\n" .
            "• Kompos/pupuk kandang: 2-3 kg/m²\n" .
            "• NPK 15-15-15: 50g/m²\n" .
            "• Aduk rata dengan tanah\n\n" .
            "**Tahap 2: Pupuk Susulan (2-4 minggu)**\n" .
            "• NPK sesuai fase pertumbuhan\n" .
            "• Urea untuk fase vegetatif\n" .
            "• Fosfor tinggi untuk pembungaan\n\n" .
            "**Tahap 3: Maintenance**\n" .
            "• Pupuk cair 2 minggu sekali\n" .
            "• Foliar feeding untuk boost\n" .
            "• Mikronutrient sesuai kebutuhan\n\n" .
            "**⏰ Timing Optimal:**\n" .
            "• Pagi hari (07:00-09:00)\n" .
            "• Setelah penyiraman\n" .
            "• Cuaca tidak terik";
    }

    private function getPestPreventionGuide()
    {
        return "🛡️ **Strategi Pencegahan Hama Terpadu:**\n\n" .
            "**Pencegahan Alami:**\n" .
            "• Rotasi tanaman setiap musim\n" .
            "• Companion planting (basil, marigold)\n" .
            "• Habitat predator alami\n" .
            "• Sanitasi lahan rutin\n\n" .
            "**Monitoring Rutin:**\n" .
            "• Cek tanaman setiap 2-3 hari\n" .
            "• Identifikasi early warning\n" .
            "• Catat populasi hama\n" .
            "• Photo untuk tracking\n\n" .
            "**Kontrol Organik:**\n" .
            "• Neem oil untuk aphids\n" .
            "• Sabun insektisida untuk kutu\n" .
            "• Bt untuk ulat lepidoptera\n" .
            "• Sticky trap untuk thrips\n\n" .
            "**Emergency Response:**\n" .
            "• Isolasi tanaman terinfeksi\n" .
            "• Treatment spot application\n" .
            "• Follow-up monitoring\n" .
            "• Evaluasi efektivitas";
    }

    private function getSeasonalTips()
    {
        $season = $this->getCurrentSeason();
        
        if ($season === 'Kering') {
            return "☀️ **Strategi Musim Kering:**\n\n" .
                "**Manajemen Air:**\n" .
                "• Penyiraman 2x sehari (pagi & sore)\n" .
                "• Drip irrigation untuk efisiensi\n" .
                "• Mulching untuk konservasi\n" .
                "• Rainwater harvesting\n\n" .
                "**Pemilihan Varietas:**\n" .
                "• Drought-resistant varieties\n" .
                "• Short season crops\n" .
                "• Deep root plants\n" .
                "• Heat tolerant species\n\n" .
                "**Proteksi Tanaman:**\n" .
                "• Shade cloth 30-50%\n" .
                "• Windbreaker installation\n" .
                "• Anti-transpirant spray\n" .
                "• Stress monitoring tools";
        } else {
            return "🌧️ **Strategi Musim Hujan:**\n\n" .
                "**Manajemen Drainase:**\n" .
                "• Raised beds/bedengan tinggi\n" .
                "• Saluran drainase lancar\n" .
                "• Avoid waterlogging\n" .
                "• Mulch removal jika perlu\n\n" .
                "**Pencegahan Penyakit:**\n" .
                "• Fungisida preventif\n" .
                "• Air circulation baik\n" .
                "• Spacing optimal\n" .
                "• Morning watering only\n\n" .
                "**Harvest Timing:**\n" .
                "• Panen sebelum hujan deras\n" .
                "• Storage preparation\n" .
                "• Quick drying methods\n" .
                "• Post-harvest handling";
        }
    }

    private function getIrrigationGuide()
    {
        return "💧 **Panduan Sistem Irigasi Optimal:**\n\n" .
            "**Metode Irigasi:**\n" .
            "• **Tetes**: Efisien air, cocok pot/greenhouse\n" .
            "• **Sprinkler**: Coverage luas, simulasi hujan\n" .
            "• **Furrow**: Traditional, cocok skala besar\n" .
            "• **Sub-surface**: Langsung ke akar\n\n" .
            "**Jadwal Optimal:**\n" .
            "• **Pagi**: 06:00-08:00 (utama)\n" .
            "• **Sore**: 16:00-18:00 (tambahan)\n" .
            "• **Avoid**: 10:00-15:00 (evaporasi tinggi)\n" .
            "• **Night**: Hindari (risiko jamur)\n\n" .
            "**Indikator Penyiraman:**\n" .
            "• Finger test: 2-3cm depth\n" .
            "• Soil meter: <50% moisture\n" .
            "• Plant signs: slight wilting\n" .
            "• Weather: no rain forecast\n\n" .
            "**Automation Tips:**\n" .
            "• Timer-based untuk konsistensi\n" .
            "• Sensor-based untuk presisi\n" .
            "• Weather integration\n" .
            "• Remote monitoring";
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\SeasonalSetting;
use App\Models\SeasonalAnalytic;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request = null)
    {
        // FIXED: Prioritas check user login terlebih dahulu
        $user = $request ? $request->user() : Auth::user();
        
        // Jika ada user yang login, gunakan data production (real user)
        if ($user) {
            // Production mode - check profile completion
            if (!$user->profile_completed) {
                return redirect()->route('profile.setup');
            }
            
            // Production mode - use real user data
            return $this->getProductionData($user);
        }
        
        // Hanya jika BENAR-BENAR tidak ada user login DAN dalam development mode
        $isDevelopment = app()->environment('local', 'testing');
        if ($isDevelopment) {
            return $this->getDevelopmentData();
        }
        
        // Jika tidak ada user dan bukan development, redirect ke login
        return redirect()->route('login');
    }
    
    /**
     * Get dummy data for development (no authentication)
     */
    private function getDevelopmentData()
    {
        $sensorData = [
            'moisture' => 63,
            'ph' => 6.8,
            'npk' => [
                'nitrogen' => 45,
                'phosphorus' => 32,
                'potassium' => 78
            ],
            'temperature' => 28.5,
            'lastUpdate' => now()->toISOString()
        ];

        $user = [
            'name' => 'Development User',
            'email' => 'dev@soilsense.com',
            'avatar' => null,
        ];

        $statistics = [
            'totalSensors' => 3,
            'alertsCount' => 0,
            'lastSyncTime' => now()->subMinutes(2)->toISOString(),
            'batteryLevel' => 85,
        ];

        $weatherData = [
            'temperature' => 32,
            'humidity' => 78,
            'condition' => 'Cerah Berawan',
            'rainfall' => 0,
            'windSpeed' => 5,
            'seasonal_forecast' => $this->getSeasonalForecast(),
        ];

        // Dummy seasonal settings
        $seasonalSettings = [
            'season_mode' => 'auto',
            'current_season' => 'dry',
            'dry_season_settings' => [
                'moisture_min' => 30,
                'moisture_max' => 60,
                'ph_min' => 6.0,
                'ph_max' => 7.5,
            ],
            'wet_season_settings' => [
                'moisture_min' => 50,
                'moisture_max' => 80,
                'ph_min' => 5.8,
                'ph_max' => 7.2,
            ],
            'monitoring_interval_dry' => 30,
            'monitoring_interval_wet' => 60,
            'power_conservation_enabled' => false,
        ];

        // Dummy seasonal analytics
        $seasonalAnalytics = [
            'dry_season' => [
                'avg_moisture' => 45.2,
                'solar_efficiency' => 85,
                'irrigation_frequency' => 2.3,
            ],
            'wet_season' => [
                'avg_moisture' => 68.7,
                'solar_efficiency' => 65,
                'irrigation_frequency' => 0.8,
            ],
        ];

        // Add demo plant-specific data
        $plantSpecificData = $this->getPlantSpecificData('lahan-kering'); // Default for development

        return Inertia::render('dashboard', [
            'user' => $user,
            'sensorData' => $sensorData,
            'statistics' => $statistics,
            'weatherData' => $weatherData,
            'seasonalSettings' => $seasonalSettings,
            'seasonalAnalytics' => $seasonalAnalytics,
            'plantSpecificData' => $plantSpecificData,
            'userPreference' => 'lahan-kering', // Default for development
        ]);
    }
    
    /**
     * Get real data for production (with authentication)
     */
    private function getProductionData($user)
    {
        // Get plant-specific settings based on user preference
        $plantPreference = $user->plant_preference ?? 'lahan-kering';
        $plantSettings = $this->getPlantThresholds($plantPreference);

        // Get or create seasonal settings for user
        $seasonalSettings = SeasonalSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'season_mode' => 'auto',
                'current_season' => $this->detectCurrentSeason(),
                'dry_season_settings' => $plantSettings['dry_season_settings'],
                'wet_season_settings' => $plantSettings['wet_season_settings'],
                'monitoring_interval_dry' => 30,
                'monitoring_interval_wet' => 60,
                'power_conservation_enabled' => false,
            ]
        );

        // Sample sensor data with seasonal context
        $sensorData = [
            'moisture' => 63,
            'ph' => 6.8,
            'npk' => [
                'nitrogen' => 45,
                'phosphorus' => 32,
                'potassium' => 78
            ],
            'temperature' => 28.5,
            'lastUpdate' => now()->toISOString()
        ];

        // FIXED: Enhanced user data - gunakan data user yang sebenarnya
        $userData = [
            'name' => $user->name, // Ini akan menampilkan "Firman Fadilah" bukan "Development User"
            'email' => $user->email,
            'avatar' => $user->avatar ?? null,
            'plant_preference' => $user->plant_preference,
            'profile_completed' => $user->profile_completed,
        ];

        // Statistics with seasonal context
        $statistics = [
            'totalSensors' => 3,
            'alertsCount' => $this->getSeasonalAlerts($sensorData, $seasonalSettings),
            'lastSyncTime' => now()->subMinutes(2)->toISOString(),
            'batteryLevel' => 85,
        ];

        // Weather data with seasonal prediction
        $weatherData = [
            'temperature' => 32,
            'humidity' => 78,
            'condition' => 'Cerah Berawan',
            'rainfall' => 0,
            'windSpeed' => 5,
            'seasonal_forecast' => $this->getSeasonalForecast(),
        ];

        // Seasonal analytics comparison
        $seasonalAnalytics = $this->getSeasonalComparison($user->id);

        // Get plant-specific data and recommendations
        $plantSpecificData = $this->getPlantSpecificData($plantPreference);

        return Inertia::render('dashboard', [
            'user' => $userData, // Data user yang sebenarnya (Firman Fadilah)
            'sensorData' => $sensorData,
            'statistics' => $statistics,
            'weatherData' => $weatherData,
            'seasonalSettings' => $seasonalSettings,
            'seasonalAnalytics' => $seasonalAnalytics,
            'plantSpecificData' => $plantSpecificData,
            'userPreference' => $plantPreference,
        ]);
    }

    /**
     * Get plant-specific data and recommendations
     */
    private function getPlantSpecificData($plantPreference)
    {
        $data = [
            'sawah' => [
                'name' => 'Tanaman Sawah',
                'optimal_moisture' => '60-90%',
                'optimal_ph' => '5.5-7.0',
                'key_nutrients' => ['Nitrogen', 'Phosphorus'],
                'recommendations' => [
                    'Pastikan sistem irigasi berfungsi optimal',
                    'Monitor pH tanah secara berkala',
                    'Perhatikan kadar nitrogen untuk pertumbuhan',
                    'Kontrol hama wereng dan tikus sawah'
                ],
                'season_tips' => [
                    'dry' => 'Pastikan irigasi optimal untuk sawah, tingkatkan frekuensi monitoring',
                    'wet' => 'Monitor drainase untuk mencegah genangan berlebih, waspadai penyakit jamur'
                ],
                'ideal_conditions' => [
                    'temperature' => '25-30°C',
                    'humidity' => '70-85%',
                    'sunlight' => '6-8 jam/hari'
                ]
            ],
            'lahan-kering' => [
                'name' => 'Lahan Kering',
                'optimal_moisture' => '40-70%',
                'optimal_ph' => '6.0-7.5',
                'key_nutrients' => ['Potassium', 'Phosphorus'],
                'recommendations' => [
                    'Optimalisasi penyiraman saat musim kemarau',
                    'Perhatikan drainase saat musim hujan',
                    'Monitor kadar fosfor dan kalium',
                    'Aplikasi mulsa untuk konservasi air'
                ],
                'season_tips' => [
                    'dry' => 'Tingkatkan frekuensi penyiraman, gunakan mulsa untuk konservasi air',
                    'wet' => 'Pastikan drainase baik untuk mencegah busuk akar, kurangi penyiraman'
                ],
                'ideal_conditions' => [
                    'temperature' => '22-28°C',
                    'humidity' => '60-75%',
                    'sunlight' => '5-7 jam/hari'
                ]
            ],
            'hidroponik' => [
                'name' => 'Hidroponik',
                'optimal_moisture' => '70-95%',
                'optimal_ph' => '5.5-6.5',
                'key_nutrients' => ['NPK Balance', 'Micronutrients'],
                'recommendations' => [
                    'Monitor EC (electrical conductivity) larutan',
                    'Jaga sirkulasi air dan oksigen',
                    'Kontrol pH larutan nutrisi secara ketat',
                    'Bersihkan sistem secara berkala'
                ],
                'season_tips' => [
                    'dry' => 'Monitor EC larutan nutrisi lebih ketat, pastikan cooling system berfungsi',
                    'wet' => 'Perhatikan sirkulasi udara dan oksigen, waspadai pertumbuhan alga'
                ],
                'ideal_conditions' => [
                    'temperature' => '18-25°C',
                    'humidity' => '50-70%',
                    'sunlight' => '12-16 jam/hari (LED)'
                ]
            ]
        ];

        return $data[$plantPreference] ?? $data['lahan-kering'];
    }

    /**
     * Get plant-specific threshold settings
     */
    private function getPlantThresholds($plantPreference)
    {
        $settings = [
            'sawah' => [
                'dry_season_settings' => [
                    'moisture_min' => 40,
                    'moisture_max' => 70,
                    'ph_min' => 5.5,
                    'ph_max' => 7.0,
                ],
                'wet_season_settings' => [
                    'moisture_min' => 60,
                    'moisture_max' => 90,
                    'ph_min' => 5.5,
                    'ph_max' => 6.8,
                ],
            ],
            'lahan-kering' => [
                'dry_season_settings' => [
                    'moisture_min' => 30,
                    'moisture_max' => 60,
                    'ph_min' => 6.0,
                    'ph_max' => 7.5,
                ],
                'wet_season_settings' => [
                    'moisture_min' => 50,
                    'moisture_max' => 80,
                    'ph_min' => 5.8,
                    'ph_max' => 7.2,
                ],
            ],
            'hidroponik' => [
                'dry_season_settings' => [
                    'moisture_min' => 70,
                    'moisture_max' => 90,
                    'ph_min' => 5.5,
                    'ph_max' => 6.5,
                ],
                'wet_season_settings' => [
                    'moisture_min' => 70,
                    'moisture_max' => 95,
                    'ph_min' => 5.5,
                    'ph_max' => 6.3,
                ],
            ],
        ];

        return $settings[$plantPreference] ?? $settings['lahan-kering'];
    }

    /**
     * Detect current season based on Indonesian climate pattern
     */
    private function detectCurrentSeason()
    {
        $month = now()->month;
        
        // Indonesian dry season: April - September
        // Indonesian wet season: October - March
        if ($month >= 4 && $month <= 9) {
            return 'dry';
        }
        return 'wet';
    }

    /**
     * Get seasonal alerts based on current thresholds
     */
    private function getSeasonalAlerts($sensorData, $seasonalSettings)
    {
        $alerts = 0;
        $currentSeason = $seasonalSettings->current_season ?? 'dry';
        
        // Handle both object and array format for seasonal settings
        if (is_object($seasonalSettings)) {
            $settings = $currentSeason === 'dry' 
                ? $seasonalSettings->dry_season_settings
                : $seasonalSettings->wet_season_settings;
        } else {
            $settings = $currentSeason === 'dry' 
                ? $seasonalSettings['dry_season_settings']
                : $seasonalSettings['wet_season_settings'];
        }

        // Check moisture alerts
        if ($sensorData['moisture'] < $settings['moisture_min'] || 
            $sensorData['moisture'] > $settings['moisture_max']) {
            $alerts++;
        }

        // Check pH alerts
        if ($sensorData['ph'] < $settings['ph_min'] || 
            $sensorData['ph'] > $settings['ph_max']) {
            $alerts++;
        }

        return $alerts;
    }

    /**
     * Get seasonal forecast prediction
     */
    private function getSeasonalForecast()
    {
        $currentMonth = now()->month;
        
        if ($currentMonth >= 3 && $currentMonth <= 5) {
            return 'Transisi ke musim kemarau - monitoring kelembaban intensif';
        } elseif ($currentMonth >= 9 && $currentMonth <= 11) {
            return 'Transisi ke musim hujan - siapkan drainase tambahan';
        } elseif ($currentMonth >= 6 && $currentMonth <= 8) {
            return 'Puncak musim kemarau - konservasi air maksimal';
        } else {
            return 'Musim hujan - pantau drainase dan pH tanah';
        }
    }

    /**
     * Get seasonal comparison analytics
     */
    private function getSeasonalComparison($userId)
    {
        // Dummy data for now - in real implementation, query from SeasonalAnalytic model
        return [
            'dry_season' => [
                'avg_moisture' => 45.2,
                'avg_ph' => 6.8,
                'solar_efficiency' => 85,
                'irrigation_frequency' => 2.3,
                'optimal_days_percentage' => 78,
            ],
            'wet_season' => [
                'avg_moisture' => 68.7,
                'avg_ph' => 6.2,
                'solar_efficiency' => 65,
                'irrigation_frequency' => 0.8,
                'optimal_days_percentage' => 82,
            ],
            'comparison' => [
                'moisture_difference' => 23.5,
                'efficiency_drop' => 20,
                'water_savings' => 65, // percentage
            ]
        ];
    }

    /**
     * Update seasonal settings - API endpoint
     */
    public function updateSeasonalSettings(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $seasonalSettings = SeasonalSetting::firstOrCreate(['user_id' => $user->id]);
        
        $seasonalSettings->update($request->only([
            'season_mode',
            'current_season',
            'dry_season_settings',
            'wet_season_settings',
            'monitoring_interval_dry',
            'monitoring_interval_wet',
            'power_conservation_enabled'
        ]));

        return response()->json(['success' => true]);
    }

    /**
     * Get seasonal analytics - API endpoint
     */
    public function getSeasonalAnalytics(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        return response()->json($this->getSeasonalComparison($user->id));
    }

    /**
     * Get seasonal trends - API endpoint
     */
    public function getSeasonalTrends(Request $request, $season = null)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Dummy trend data - implement real data fetching
        $trends = [
            'dates' => collect(range(1, 30))->map(fn($day) => now()->subDays($day)->format('Y-m-d')),
            'moisture' => collect(range(1, 30))->map(fn() => rand(30, 80)),
            'ph' => collect(range(1, 30))->map(fn() => rand(55, 75) / 10),
            'temperature' => collect(range(1, 30))->map(fn() => rand(25, 35)),
        ];

        return response()->json($trends);
    }

    /**
     * Export seasonal report - API endpoint
     */
    public function exportSeasonalReport(Request $request, $period = 'month')
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Implementation for PDF/Excel export
        return response()->json(['message' => 'Report export feature coming soon']);
    }

    /**
     * Get sensor data - API endpoint
     */
    public function getSensorData(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Real-time sensor data implementation
        return response()->json([
            'moisture' => rand(30, 80),
            'ph' => rand(55, 75) / 10,
            'npk' => [
                'nitrogen' => rand(20, 60),
                'phosphorus' => rand(15, 45),
                'potassium' => rand(40, 90)
            ],
            'temperature' => rand(25, 35),
            'lastUpdate' => now()->toISOString()
        ]);
    }

    /**
     * Get historical data - API endpoint
     */
    public function getHistoricalData(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Historical data implementation
        return response()->json(['message' => 'Historical data feature coming soon']);
    }

    /**
     * Update sensor settings - API endpoint
     */
    public function updateSensorSettings(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Sensor settings update implementation
        return response()->json(['success' => true]);
    }

    /**
     * IoT endpoints - for device integration
     */
    public function getIoTSeasonalConfig(Request $request)
    {
        // Public endpoint for IoT device
        return response()->json([
            'current_season' => $this->detectCurrentSeason(),
            'monitoring_interval' => 30,
            'power_conservation' => false
        ]);
    }

    public function receiveIoTSensorData(Request $request)
    {
        // Public endpoint for IoT device to send data
        return response()->json(['success' => true, 'message' => 'Data received']);
    }

    public function getIoTRecommendations(Request $request)
    {
        // Public endpoint for IoT device
        return response()->json([
            'irrigation_needed' => false,
            'optimal_ph_adjustment' => 0,
            'next_check_interval' => 30
        ]);
    }

    /**
     * Get plant-specific recommendations based on current conditions
     */
    public function getPlantRecommendations(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->profile_completed) {
            return response()->json(['error' => 'Authentication and profile completion required'], 401);
        }

        $plantPreference = $user->plant_preference;
        $plantData = $this->getPlantSpecificData($plantPreference);
        $currentSeason = $this->detectCurrentSeason();

        return response()->json([
            'plant_type' => $plantPreference,
            'current_season' => $currentSeason,
            'recommendations' => $plantData['recommendations'],
            'season_tips' => $plantData['season_tips'][$currentSeason],
            'optimal_conditions' => $plantData['ideal_conditions']
        ]);
    }

    /**
     * Update user plant preference (if needed to change)
     */
    public function updatePlantPreference(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $request->validate([
            'plant_preference' => 'required|in:sawah,lahan-kering,hidroponik'
        ]);

        $user->update([
            'plant_preference' => $request->plant_preference
        ]);

        // Update seasonal settings based on new plant preference
        $plantSettings = $this->getPlantThresholds($request->plant_preference);
        $seasonalSettings = SeasonalSetting::where('user_id', $user->id)->first();
        
        if ($seasonalSettings) {
            $seasonalSettings->update([
                'dry_season_settings' => $plantSettings['dry_season_settings'],
                'wet_season_settings' => $plantSettings['wet_season_settings'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Plant preference updated successfully',
            'plant_data' => $this->getPlantSpecificData($request->plant_preference)
        ]);
    }
}
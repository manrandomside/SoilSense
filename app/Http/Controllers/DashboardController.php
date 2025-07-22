<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SeasonalSetting;
use App\Models\SeasonalAnalytic;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Check if in development mode (no user authentication)
        $isDevelopment = !$user || app()->environment('local', 'testing');
        
        if ($isDevelopment) {
            // Development mode - use dummy data
            return $this->getDevelopmentData();
        }
        
        // Production mode - use real user data
        return $this->getProductionData($user);
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

        return Inertia::render('dashboard', [
            'user' => $user,
            'sensorData' => $sensorData,
            'statistics' => $statistics,
            'weatherData' => $weatherData,
            'seasonalSettings' => $seasonalSettings,
            'seasonalAnalytics' => $seasonalAnalytics,
        ]);
    }
    
    /**
     * Get real data for production (with authentication)
     */
    private function getProductionData($user)
    {
        // Get or create seasonal settings for user
        $seasonalSettings = SeasonalSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'season_mode' => 'auto',
                'current_season' => $this->detectCurrentSeason(),
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

        // Enhanced user data
        $userData = [
            'name' => $user->name,
            'avatar' => null,
            'email' => $user->email,
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

        return Inertia::render('dashboard', [
            'user' => $userData,
            'sensorData' => $sensorData,
            'statistics' => $statistics,
            'weatherData' => $weatherData,
            'seasonalSettings' => $seasonalSettings,
            'seasonalAnalytics' => $seasonalAnalytics,
        ]);
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
        $currentSeason = $seasonalSettings->current_season;
        $settings = $currentSeason === 'dry' 
            ? $seasonalSettings->dry_season_settings
            : $seasonalSettings->wet_season_settings;

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
}
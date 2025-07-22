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

        // Check moisture thresholds
        if ($sensorData['moisture'] < $settings['moisture_min'] || 
            $sensorData['moisture'] > $settings['moisture_max']) {
            $alerts++;
        }

        // Check pH thresholds
        if ($sensorData['ph'] < $settings['ph_min'] || 
            $sensorData['ph'] > $settings['ph_max']) {
            $alerts++;
        }

        return $alerts;
    }

    /**
     * Get seasonal forecast and recommendations
     */
    private function getSeasonalForecast()
    {
        $currentSeason = $this->detectCurrentSeason();
        
        if ($currentSeason === 'dry') {
            return [
                'season' => 'dry',
                'icon' => '🌞',
                'name' => 'Musim Kemarau',
                'description' => 'Fokus pada irigasi & konservasi air',
                'color' => 'orange',
                'recommendations' => [
                    'Tingkatkan frekuensi monitoring kelembapan',
                    'Siapkan sistem irigasi tambahan',
                    'Pantau efisiensi solar panel',
                ],
                'next_season_estimate' => 'Oktober - Musim Hujan'
            ];
        } else {
            return [
                'season' => 'wet',
                'icon' => '🌧️',
                'name' => 'Musim Hujan',
                'description' => 'Fokus pada drainase & pencegahan penyakit',
                'color' => 'blue',
                'recommendations' => [
                    'Pastikan drainase tanah optimal',
                    'Monitor pH tanah lebih sering',
                    'Aktifkan mode hemat daya',
                ],
                'next_season_estimate' => 'April - Musim Kemarau'
            ];
        }
    }

    /**
     * Get seasonal performance comparison
     */
    private function getSeasonalComparison($userId)
    {
        $drySeasonAvg = SeasonalAnalytic::where('user_id', $userId)
            ->where('season', 'dry')
            ->where('date', '>=', now()->subDays(90))
            ->avg('avg_moisture');

        $wetSeasonAvg = SeasonalAnalytic::where('user_id', $userId)
            ->where('season', 'wet')
            ->where('date', '>=', now()->subDays(90))
            ->avg('avg_moisture');

        return [
            'dry_season' => [
                'avg_moisture' => round($drySeasonAvg ?: 45, 1),
                'solar_efficiency' => 85,
                'irrigation_frequency' => 'Tinggi',
            ],
            'wet_season' => [
                'avg_moisture' => round($wetSeasonAvg ?: 70, 1),
                'solar_efficiency' => 65,
                'irrigation_frequency' => 'Rendah',
            ],
        ];
    }

    /**
     * Update seasonal settings
     */
    public function updateSeasonalSettings(Request $request)
    {
        $request->validate([
            'season_mode' => 'required|in:auto,manual_dry,manual_wet',
            'dry_season_settings' => 'required|array',
            'wet_season_settings' => 'required|array',
            'power_conservation_enabled' => 'boolean',
        ]);

        $user = $request->user();
        
        $seasonalSettings = SeasonalSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'season_mode' => $request->season_mode,
                'current_season' => $request->season_mode === 'auto' 
                    ? $this->detectCurrentSeason() 
                    : ($request->season_mode === 'manual_dry' ? 'dry' : 'wet'),
                'dry_season_settings' => $request->dry_season_settings,
                'wet_season_settings' => $request->wet_season_settings,
                'power_conservation_enabled' => $request->power_conservation_enabled ?? false,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan musim berhasil diperbarui',
            'data' => $seasonalSettings
        ]);
    }

    /**
     * Get real-time sensor data (existing method enhanced)
     */
    public function getSensorData(Request $request)
    {
        $user = $request->user();
        $seasonalSettings = SeasonalSetting::where('user_id', $user->id)->first();
        
        $sensorData = [
            'moisture' => rand(40, 80),
            'ph' => round(rand(60, 75) / 10, 1),
            'npk' => [
                'nitrogen' => rand(30, 60),
                'phosphorus' => rand(25, 45),
                'potassium' => rand(50, 85)
            ],
            'temperature' => rand(250, 320) / 10,
            'lastUpdate' => now()->toISOString()
        ];

        // Add seasonal context
        $response = [
            'success' => true,
            'data' => $sensorData,
            'seasonal_status' => $this->getSeasonalForecast(),
        ];

        if ($seasonalSettings) {
            $response['alerts'] = $this->getSeasonalAlerts($sensorData, $seasonalSettings);
        }
        
        return response()->json($response);
    }

    // Keep existing methods...
    public function getHistoricalData(Request $request)
    {
        $period = $request->get('period', '24h');
        
        $historicalData = [];
        $points = $period === '24h' ? 24 : ($period === '7d' ? 7 : 30);
        
        for ($i = $points; $i >= 0; $i--) {
            $time = $period === '24h' 
                ? now()->subHours($i) 
                : ($period === '7d' 
                    ? now()->subDays($i) 
                    : now()->subDays($i));
                    
            $historicalData[] = [
                'time' => $time->toISOString(),
                'moisture' => rand(50, 80),
                'ph' => round(rand(65, 72) / 10, 1),
                'temperature' => rand(260, 300) / 10,
                'season' => $this->detectCurrentSeason(), // Add seasonal context
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $historicalData
        ]);
    }

    public function updateSensorSettings(Request $request)
    {
        $request->validate([
            'moisture_min' => 'required|numeric|min:0|max:100',
            'moisture_max' => 'required|numeric|min:0|max:100',
            'ph_min' => 'required|numeric|min:0|max:14',
            'ph_max' => 'required|numeric|min:0|max:14',
            'temp_min' => 'required|numeric',
            'temp_max' => 'required|numeric',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Pengaturan sensor berhasil diperbarui'
        ]);
    }
}
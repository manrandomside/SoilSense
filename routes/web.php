<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// ROUTE TESTING - UNTUK DEBUG (HAPUS SETELAH BERHASIL)
Route::get('/test-dashboard', function () {
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
        'name' => 'Test SoilSense',
        'email' => 'test@soilsense.com',
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
    ];

    // Add seasonal data for testing
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
        'power_conservation_enabled' => false,
    ];

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
})->name('test.dashboard');

// Route default - cek apakah user sudah login
Route::get('/', function () {
    // Jika user sudah login, redirect ke dashboard
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    // Jika belum login, tampilkan welcome page
    return Inertia::render('welcome');
})->name('home');

// Route untuk landing page SoilSense (opsional, bisa diakses tanpa login)
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

// Protected routes (memerlukan authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard SoilSense dengan controller - DIPERBAIKI: menggunakan 'dashboard' (lowercase)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Route untuk planting guide - DIPERBAIKI: menggunakan 'PlantingGuide' sesuai nama file
    Route::get('/planting/{type}', function ($type) {
        return Inertia::render('PlantingGuide', [
            'type' => $type
        ]);
    })->name('planting.guide');
    
    // Route tambahan untuk pengaturan/settings (jika dibutuhkan)
    Route::get('/settings', function () {
        return Inertia::render('settings');
    })->name('settings');

    // =====================================================
    // SEASONAL MANAGEMENT ROUTES - NEW FEATURES
    // =====================================================
    
    // Update seasonal settings (mode: auto/manual, thresholds per season)
    Route::post('/dashboard/seasonal-settings', [DashboardController::class, 'updateSeasonalSettings'])
        ->name('dashboard.seasonal.update');
    
    // Get seasonal analytics comparison data
    Route::get('/dashboard/seasonal-analytics', [DashboardController::class, 'getSeasonalAnalytics'])
        ->name('dashboard.seasonal.analytics');
    
    // Get seasonal trends for charts (dry vs wet season performance)
    Route::get('/dashboard/seasonal-trends/{season?}', [DashboardController::class, 'getSeasonalTrends'])
        ->name('dashboard.seasonal.trends');
    
    // Export seasonal report (PDF/Excel)
    Route::get('/dashboard/seasonal-report/{period?}', [DashboardController::class, 'exportSeasonalReport'])
        ->name('dashboard.seasonal.report');
    
    // =====================================================
    // ENHANCED API ENDPOINTS - EXISTING + SEASONAL CONTEXT
    // =====================================================
    
    // Enhanced sensor data API with seasonal alerts
    Route::get('/api/sensor-data', [DashboardController::class, 'getSensorData'])
        ->name('api.sensor.data');
    
    // Enhanced historical data with seasonal grouping
    Route::get('/api/historical-data', [DashboardController::class, 'getHistoricalData'])
        ->name('api.historical.data');
    
    // Update sensor settings (enhanced with seasonal validation)
    Route::post('/api/sensor-settings', [DashboardController::class, 'updateSensorSettings'])
        ->name('api.sensor.settings');
    
    // =====================================================
    // IOT INTEGRATION ENDPOINTS - FOR DEVICE SYNC
    // =====================================================
    
    // Endpoint for IoT device to get current seasonal settings
    Route::get('/api/iot/seasonal-config', [DashboardController::class, 'getIoTSeasonalConfig'])
        ->name('api.iot.seasonal.config');
    
    // Endpoint for IoT device to report sensor data with seasonal context
    Route::post('/api/iot/sensor-report', [DashboardController::class, 'receiveIoTSensorData'])
        ->name('api.iot.sensor.report');
    
    // Endpoint for IoT device to request seasonal recommendations
    Route::get('/api/iot/seasonal-recommendations', [DashboardController::class, 'getIoTRecommendations'])
        ->name('api.iot.seasonal.recommendations');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
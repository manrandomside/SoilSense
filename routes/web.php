<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SoilBotController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

// =====================================================
// ROUTE TESTING - UNTUK DEBUG (HAPUS SETELAH BERHASIL)
// =====================================================

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
        'soilbot_available' => true // Enable SoilBot in test dashboard
    ]);
})->name('test.dashboard');

// =====================================================
// SOILBOT ROUTES (PUBLIC - NO MIDDLEWARE)
// =====================================================

// Halaman SoilBot (dapat diakses tanpa login)
Route::get('/soilbot', function () {
    // Demo sensor data jika tidak ada user login
    $demoSensorData = [
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

    return Inertia::render('SoilBot', [
        'sensorData' => $demoSensorData,
        'standalone' => true // Indicate this is standalone page
    ]);
})->name('soilbot');

// SoilBot Widget - untuk embed di dashboard
Route::get('/soilbot/widget', function () {
    return Inertia::render('SoilBotWidget');
})->name('soilbot.widget');

// API Routes untuk SoilBot (Public Access)
Route::prefix('api/soilbot')->name('api.soilbot.')->group(function () {
    
    // Get predefined questions
    Route::get('/questions', [SoilBotController::class, 'getPredefinedQuestions'])
          ->name('questions');
    
    // Process chat message
    Route::post('/chat', [SoilBotController::class, 'processMessage'])
          ->name('chat');
    
    // Get specific answer by question ID
    Route::post('/answer', [SoilBotController::class, 'getAnswer'])
          ->name('answer');
    
    // Get recommendations based on sensor data
    Route::post('/recommendations', [SoilBotController::class, 'getRecommendations'])
          ->name('recommendations');
    
    // Health check for chatbot service
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'service' => 'SoilBot',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString()
        ]);
    })->name('health');
});

// =====================================================
// DEVELOPMENT ROUTES (NO AUTH REQUIRED)
// =====================================================
// CATATAN: Route ini hanya untuk development. Hapus atau comment saat production!

if (app()->environment('local', 'testing')) {
    // Route development dashboard - bisa diakses tanpa login
    Route::get('/dev-dashboard', [DashboardController::class, 'index'])->name('dev.dashboard');
    
    // Route development untuk planting guide - tanpa auth
    Route::get('/dev-planting/{type}', function ($type) {
        return Inertia::render('PlantingGuide', [
            'type' => $type
        ]);
    })->name('dev.planting.guide');
    
    // Route development untuk settings - tanpa auth
    Route::get('/dev-settings', function () {
        return Inertia::render('settings');
    })->name('dev.settings');

    // Route development untuk profile setup - tanpa auth
    Route::get('/dev-profile', function () {
        return Inertia::render('ProfileSetup');
    })->name('dev.profile');

    // Route development untuk homepage - tanpa auth
    Route::get('/dev-homepage', function () {
        return Inertia::render('Homepage', [
            'user' => null
        ]);
    })->name('dev.homepage');

    // Route development untuk login - tanpa auth
    Route::get('/dev-login', function () {
        return Inertia::render('BarcodeLogin');
    })->name('dev.login');

    // BARU: Route development untuk email login - tanpa auth
    Route::get('/dev-email-login', function () {
        return Inertia::render('EmailLogin');
    })->name('dev.email.login');

    // BARU: Route development untuk SoilBot - tanpa auth
    Route::get('/dev-soilbot', function () {
        $demoSensorData = [
            'moisture' => 45,
            'ph' => 6.2,
            'npk' => [
                'nitrogen' => 35,
                'phosphorus' => 28,
                'potassium' => 65
            ],
            'temperature' => 29.5,
            'lastUpdate' => now()->toISOString()
        ];

        return Inertia::render('SoilBot', [
            'sensorData' => $demoSensorData,
            'standalone' => true,
            'demo_mode' => true
        ]);
    })->name('dev.soilbot');
    
    // Test barcode generation
    Route::get('/dev-generate-barcodes', function () {
        $barcodes = [];
        for ($i = 1; $i <= 10; $i++) {
            $barcode = 'SS' . str_pad($i, 10, '0', STR_PAD_LEFT);
            $barcodes[] = $barcode;
            
            \App\Models\BarcodeProduct::firstOrCreate([
                'barcode' => $barcode
            ], [
                'status' => 'available'
            ]);
        }
        
        return response()->json([
            'message' => 'Demo barcodes generated',
            'barcodes' => $barcodes,
            'demo_barcode' => '123456789012'
        ]);
    });
}

// =====================================================
// INTEGRATION WITH EXISTING DASHBOARD
// =====================================================

// Alternative dashboard access (public demo dengan SoilBot)
Route::get('/dashboard/demo', function () {
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
        'name' => 'Demo User',
        'email' => 'demo@soilsense.com',
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

    return Inertia::render('dashboard', [
        'user' => $user,
        'sensorData' => $sensorData,
        'statistics' => $statistics,
        'weatherData' => $weatherData,
        'demo_mode' => true,
        'soilbot_available' => true // Enable SoilBot in demo dashboard
    ]);
})->name('dashboard.demo');

// =====================================================
// PUBLIC ROUTES (NO AUTH REQUIRED)
// =====================================================

// Homepage SoilSense - dapat diakses semua orang
Route::get('/', function () {
    // Jika dalam mode development, bisa akses langsung atau homepage
    // Uncomment baris dibawah jika ingin langsung ke dashboard di development
    // if (app()->environment('local', 'testing')) {
    //     return redirect()->route('dev.dashboard');
    // }
    
    $user = Auth::user();
    
    // Jika sudah login dan profile complete, bisa akses homepage dengan user data
    // Atau redirect ke dashboard (sesuai kebutuhan)
    
    return Inertia::render('Homepage', [
        'user' => $user ? [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar ?? null,
            'plant_preference' => $user->plant_preference,
            'profile_completed' => $user->profile_completed,
        ] : null
    ]);
})->name('home');

// Route untuk landing page SoilSense (opsional, bisa diakses tanpa login)
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

// =====================================================
// AUTHENTICATION ROUTES (NO MIDDLEWARE USED)
// =====================================================

// CATATAN: Route /login sudah dihandle di routes/auth.php
// Route /login DIHAPUS dari sini untuk menghindari conflict

// Process barcode login - POST endpoint
Route::post('/login-barcode', [AuthController::class, 'loginWithBarcode'])->name('login.barcode');

// BARU: Email Login Routes (untuk user yang sudah pernah login)
Route::get('/login-email', function () {
    // Jika sudah login dan profile complete, redirect ke dashboard
    if (Auth::check() && Auth::user()->profile_completed) {
        return redirect()->route('dashboard');
    }
    
    // Jika sudah login tapi profile belum complete, redirect ke profile setup
    if (Auth::check() && !Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return Inertia::render('EmailLogin');
})->name('login.email');

// BARU: Process email login - POST endpoint
Route::post('/login-email', [AuthController::class, 'loginWithEmail'])->name('login.email.process');

// API untuk check email availability (public untuk AJAX)
Route::post('/api/check-email', [AuthController::class, 'checkEmailAvailability']);

// =====================================================
// PROFILE SETUP ROUTES (REQUIRE AUTH BUT INCOMPLETE PROFILE)
// =====================================================

Route::get('/profile-setup', function () {
    // Cek apakah user sudah login
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    // Jika profile sudah complete, redirect ke dashboard
    if (Auth::user()->profile_completed) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('ProfileSetup', [
        'user' => Auth::user()
    ]);
})->name('profile.setup');

Route::post('/profile-setup', function (Request $request) {
    // Cek apakah user sudah login
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    // Jika profile sudah complete, redirect ke dashboard
    if (Auth::user()->profile_completed) {
        return redirect()->route('dashboard');
    }
    
    return app(AuthController::class)->completeProfile($request);
})->name('profile.complete');

// =====================================================
// PROTECTED ROUTES - MANUAL AUTH CHECK (NO MIDDLEWARE)
// =====================================================

// Dashboard SoilSense dengan manual auth check (FIXED)
Route::get('/dashboard', function () {
    // Manual auth check
    if (!Auth::check()) {
        return redirect()->route('login')->with('message', 'Silakan login terlebih dahulu untuk mengakses dashboard.');
    }
    
    // Manual profile completion check
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup')->with('message', 'Silakan lengkapi profil Anda terlebih dahulu.');
    }
    
    // Get user data
    $user = Auth::user();
    
    // Generate demo sensor data (replace with real sensor data later)
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

    // Return Inertia response with SoilBot enabled
    return Inertia::render('dashboard', [
        'user' => [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar ?? null,
        ],
        'sensorData' => $sensorData,
        'statistics' => $statistics,
        'weatherData' => $weatherData,
        'soilbot_available' => true, // Enable SoilBot
        'demo_mode' => false
    ]);
})->name('dashboard');

// Route untuk planting guide dengan manual auth check
Route::get('/planting/{type}', function ($type) {
    if (!Auth::check()) {
        return redirect()->route('login')->with('message', 'Silakan login terlebih dahulu untuk melihat panduan penanaman.');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return Inertia::render('PlantingGuide', [
        'type' => $type,
        'user' => Auth::user()
    ]);
})->name('planting.guide');

// Route tambahan untuk pengaturan/settings dengan manual auth check
Route::get('/settings', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    // Redirect ke settings profile (existing)
    return redirect('/settings/profile');
})->name('settings');

// =====================================================
// PROFILE ROUTES - WITH MANUAL AUTH CHECK
// =====================================================

// Profile page dengan manual auth check
Route::get('/profile', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return Inertia::render('Profile', [
        'user' => Auth::user()
    ]);
})->name('profile.show');

// ADDED: Profile update route dengan manual auth check
Route::post('/profile/update', function (Request $request) {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return app(AuthController::class)->updateProfile($request);
})->name('profile.update');

// =====================================================
// OTHER PROTECTED ROUTES
// =====================================================

// Notifications page dengan manual auth check
Route::get('/notifications', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return Inertia::render('Notifications', [
        'user' => Auth::user(),
        'notifications' => [] // Add your notifications logic here
    ]);
})->name('notifications');

// Analytics page dengan manual auth check
Route::get('/analytics', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    
    if (!Auth::user()->profile_completed) {
        return redirect()->route('profile.setup');
    }
    
    return Inertia::render('Analytics', [
        'user' => Auth::user()
    ]);
})->name('analytics');

// =====================================================
// SEASONAL MANAGEMENT ROUTES - WITH MANUAL AUTH CHECK
// =====================================================

// Update seasonal settings dengan manual auth check
Route::post('/dashboard/seasonal-settings', function (Request $request) {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->updateSeasonalSettings($request);
})->name('dashboard.seasonal.update');

// Get seasonal analytics comparison data
Route::get('/dashboard/seasonal-analytics', function () {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->getSeasonalAnalytics();
})->name('dashboard.seasonal.analytics');

// Get seasonal trends for charts
Route::get('/dashboard/seasonal-trends/{season?}', function ($season = null) {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->getSeasonalTrends($season);
})->name('dashboard.seasonal.trends');

// Export seasonal report
Route::get('/dashboard/seasonal-report/{period?}', function ($period = null) {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->exportSeasonalReport($period);
})->name('dashboard.seasonal.report');

// =====================================================
// ENHANCED API ENDPOINTS - WITH MANUAL AUTH CHECK
// =====================================================

// Enhanced sensor data API dengan manual auth check
Route::get('/api/sensor-data', function () {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->getSensorData();
})->name('api.sensor.data');

// Enhanced historical data dengan manual auth check
Route::get('/api/historical-data', function () {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->getHistoricalData();
})->name('api.historical.data');

// Update sensor settings dengan manual auth check
Route::post('/api/sensor-settings', function (Request $request) {
    if (!Auth::check() || !Auth::user()->profile_completed) {
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    return app(DashboardController::class)->updateSensorSettings($request);
})->name('api.sensor.settings');

// =====================================================
// IOT INTEGRATION ENDPOINTS - PUBLIC (NO AUTH FOR DEVICES)
// =====================================================

// Endpoint for IoT device to get current seasonal settings (Public untuk device)
Route::get('/api/iot/seasonal-config', [DashboardController::class, 'getIoTSeasonalConfig'])
    ->name('api.iot.seasonal.config');

// Endpoint for IoT device to report sensor data (Public untuk device)
Route::post('/api/iot/sensor-report', [DashboardController::class, 'receiveIoTSensorData'])
    ->name('api.iot.sensor.report');

// Endpoint for IoT device to request seasonal recommendations (Public untuk device)
Route::get('/api/iot/seasonal-recommendations', [DashboardController::class, 'getIoTRecommendations'])
    ->name('api.iot.seasonal.recommendations');

// =====================================================
// LOGOUT ROUTE (UPDATED - FIX DUPLICATE)
// =====================================================

// UPDATED: Gunakan AuthController logout method untuk konsistensi
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// =====================================================
// HELPER FUNCTION UNTUK AUTH CHECK (OPTIONAL)
// =====================================================

// Helper function yang bisa digunakan di routes lain
function checkAuthAndProfile($redirectToLogin = true, $redirectToProfile = true) {
    if (!Auth::check()) {
        if ($redirectToLogin) {
            return redirect()->route('login')->with('message', 'Silakan login terlebih dahulu.');
        }
        return response()->json(['error' => 'Authentication required'], 401);
    }
    
    if (!Auth::user()->profile_completed) {
        if ($redirectToProfile) {
            return redirect()->route('profile.setup')->with('message', 'Silakan lengkapi profil Anda terlebih dahulu.');
        }
        return response()->json(['error' => 'Profile incomplete'], 403);
    }
    
    return null; // Auth check passed
}

// Include existing route files
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
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

    return Inertia::render('dashboard', [
        'user' => $user,
        'sensorData' => $sensorData,
        'statistics' => $statistics,
        'weatherData' => $weatherData,
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
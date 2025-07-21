<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard SoilSense dengan controller
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Route untuk planting guide
    Route::get('/planting/{type}', function ($type) {
        return Inertia::render('PlantingGuide', [
            'type' => $type
        ]);
    })->name('planting.guide');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
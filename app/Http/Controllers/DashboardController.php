<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Sample data - nanti akan diganti dengan data real dari IoT sensor
        $sensorData = [
            'moisture' => 63, // Kelembapan tanah dalam persen
            'ph' => 6.8, // pH tanah
            'npk' => [
                'nitrogen' => 45,
                'phosphorus' => 32,
                'potassium' => 78
            ],
            'temperature' => 28.5, // Suhu tanah dalam Celsius
            'lastUpdate' => now()->toISOString()
        ];

        // Sample user data
        $user = [
            'name' => $request->user() ? $request->user()->name : 'Petani Muda',
            'avatar' => null
        ];

        return Inertia::render('Dashboard', [
            'user' => $user,
            'sensorData' => $sensorData
        ]);
    }
}
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
            'avatar' => null,
            'email' => $request->user() ? $request->user()->email : null,
        ];

        // Data statistik tambahan untuk dashboard
        $statistics = [
            'totalSensors' => 3, // Jumlah sensor aktif
            'alertsCount' => 0, // Jumlah alert aktif
            'lastSyncTime' => now()->subMinutes(2)->toISOString(), // Terakhir sync data
            'batteryLevel' => 85, // Level battery sensor dalam persen
        ];

        // Data cuaca simulasi
        $weatherData = [
            'temperature' => 32, // Suhu udara
            'humidity' => 78, // Kelembapan udara
            'condition' => 'Cerah Berawan',
            'rainfall' => 0, // mm
            'windSpeed' => 5, // km/h
        ];

        // DIPERBAIKI: Menggunakan 'dashboard' (lowercase) sesuai nama file React component
        return Inertia::render('dashboard', [
            'user' => $user,
            'sensorData' => $sensorData,
            'statistics' => $statistics,
            'weatherData' => $weatherData,
        ]);
    }
    
    /**
     * API endpoint untuk mengambil data sensor real-time
     * Bisa digunakan untuk update data via AJAX tanpa refresh halaman
     */
    public function getSensorData(Request $request)
    {
        // Simulasi data sensor yang berubah-ubah
        $sensorData = [
            'moisture' => rand(40, 80), // Kelembapan 40-80%
            'ph' => round(rand(60, 75) / 10, 1), // pH 6.0-7.5
            'npk' => [
                'nitrogen' => rand(30, 60),
                'phosphorus' => rand(25, 45),
                'potassium' => rand(50, 85)
            ],
            'temperature' => rand(250, 320) / 10, // 25.0-32.0°C
            'lastUpdate' => now()->toISOString()
        ];
        
        return response()->json([
            'success' => true,
            'data' => $sensorData
        ]);
    }

    /**
     * API endpoint untuk mengambil historical data
     */
    public function getHistoricalData(Request $request)
    {
        $period = $request->get('period', '24h'); // 24h, 7d, 30d
        
        // Simulasi data historis
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
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $historicalData
        ]);
    }

    /**
     * Method untuk update pengaturan sensor
     */
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

        // Di sini nanti akan disimpan ke database atau dikirim ke IoT device
        // Untuk sekarang hanya return success response
        
        return response()->json([
            'success' => true,
            'message' => 'Pengaturan sensor berhasil diperbarui'
        ]);
    }
}
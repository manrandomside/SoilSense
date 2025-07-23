<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BarcodeProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Login user dengan barcode
     */
    public function loginWithBarcode(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string|size:12'
        ]);

        // Cek apakah barcode valid dan tersedia
        $barcodeProduct = BarcodeProduct::where('barcode', $request->barcode)
            ->where('status', 'available')
            ->first();

        if (!$barcodeProduct) {
            throw ValidationException::withMessages([
                'barcode' => ['Barcode tidak valid atau sudah digunakan.']
            ]);
        }

        // Cek apakah user sudah ada dengan barcode ini
        $user = User::where('barcode', $request->barcode)->first();

        if (!$user) {
            // Buat user baru
            $user = User::create([
                'name' => 'SoilSense User', // Temporary name
                'email' => $request->barcode . '@soilsense.temp', // Temporary email
                'barcode' => $request->barcode,
                'password' => Hash::make($request->barcode), // Use barcode as temporary password
                'profile_completed' => false,
                'first_login_at' => now(),
            ]);

            // Update barcode product status
            $barcodeProduct->update([
                'status' => 'used',
                'user_id' => $user->id,
                'activated_at' => now()
            ]);
        }

        // Login user
        Auth::login($user);

        // Redirect based on profile completion status
        if (!$user->profile_completed) {
            return redirect()->route('profile.setup');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Complete user profile
     */
    public function completeProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:users,email,' . Auth::id(),
            'plant_preference' => 'required|in:sawah,lahan-kering,hidroponik',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $user = Auth::user();
        
        // Update user profile
        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'plant_preference' => $request->plant_preference,
            'profile_completed' => true,
        ]);

        // Initialize seasonal settings based on plant preference
        $this->initializeSeasonalSettings($user, $request->plant_preference);

        return redirect()->route('dashboard')->with('success', 'Profil berhasil dilengkapi! Selamat datang di SoilSense.');
    }

    /**
     * Check email availability
     */
    public function checkEmailAvailability(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists = User::where('email', $request->email)
            ->where('id', '!=', Auth::id())
            ->exists();

        return response()->json([
            'available' => !$exists
        ]);
    }

    /**
     * Initialize seasonal settings based on plant preference
     */
    private function initializeSeasonalSettings($user, $plantPreference)
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

        $plantSettings = $settings[$plantPreference] ?? $settings['lahan-kering'];

        // Create seasonal setting for user
        \App\Models\SeasonalSetting::create([
            'user_id' => $user->id,
            'season_mode' => 'auto',
            'current_season' => $this->detectCurrentSeason(),
            'dry_season_settings' => $plantSettings['dry_season_settings'],
            'wet_season_settings' => $plantSettings['wet_season_settings'],
            'monitoring_interval_dry' => 30,
            'monitoring_interval_wet' => 60,
            'power_conservation_enabled' => false,
        ]);
    }

    /**
     * Detect current season (simplified)
     */
    private function detectCurrentSeason()
    {
        $month = now()->month;
        // Simplified: May-October = dry season, Nov-April = wet season
        return ($month >= 5 && $month <= 10) ? 'dry' : 'wet';
    }
}
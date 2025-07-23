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
     * Login user dengan barcode (Login Pertama - untuk user baru & existing)
     * UPDATED: Handle both new and existing users
     */
    public function loginWithBarcode(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string|size:12'
        ]);

        // Cek apakah barcode valid (bisa available atau used)
        $barcodeProduct = BarcodeProduct::where('barcode', $request->barcode)->first();

        if (!$barcodeProduct) {
            throw ValidationException::withMessages([
                'barcode' => ['Barcode tidak valid. Pastikan Anda memasukkan barcode yang benar.']
            ]);
        }

        // Cek apakah user sudah ada dengan barcode ini
        $user = User::where('barcode', $request->barcode)->first();

        if ($user) {
            // USER SUDAH ADA - login existing user
            
            if ($user->profile_completed) {
                // Jika profile sudah complete, arahkan ke email login
                return redirect()->route('login.email')->with('message', 
                    'Akun Anda sudah terdaftar. Silakan login menggunakan email dan password.');
            } else {
                // Jika profile belum complete, lanjutkan ke profile setup
                Auth::login($user);
                return redirect()->route('profile.setup');
            }
            
        } else {
            // USER BARU - buat akun baru
            
            if ($barcodeProduct->status !== 'available') {
                throw ValidationException::withMessages([
                    'barcode' => ['Barcode sudah digunakan oleh pengguna lain. Gunakan barcode yang berbeda.']
                ]);
            }

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

            // Login user
            Auth::login($user);
            return redirect()->route('profile.setup');
        }
    }

    /**
     * Login user dengan email dan password (Login Kedua - untuk user yang sudah terdaftar)
     */
    public function loginWithEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Cek apakah user dengan email tersebut exists dan profile sudah complete
        $user = User::where('email', $request->email)
            ->where('profile_completed', true)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Email tidak terdaftar atau profil belum dilengkapi. Silakan login dengan barcode terlebih dahulu.']
            ]);
        }

        // Cek password
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Password yang Anda masukkan salah.']
            ]);
        }

        // Login user
        Auth::login($user, $request->boolean('remember'));

        return redirect()->route('dashboard')->with('success', 'Selamat datang kembali di SoilSense!');
    }

    /**
     * Complete user profile (UPDATED - dengan password wajib)
     */
    public function completeProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:users,email,' . Auth::id(),
            'plant_preference' => 'required|in:sawah,lahan-kering,hidroponik',
            'password' => 'required|string|min:8|confirmed', // BARU: password wajib
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = Auth::user();
        
        // Prepare update data dengan password baru
        $updateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'plant_preference' => $request->plant_preference,
            'profile_completed' => true,
            'password' => Hash::make($request->password), // PENTING: Set password baru
        ];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = time() . '_' . $user->id . '.' . $avatar->getClientOriginalExtension();
            
            // Pastikan directory exists
            $avatarPath = public_path('storage/avatars');
            if (!file_exists($avatarPath)) {
                mkdir($avatarPath, 0755, true);
            }
            
            // Simpan avatar baru
            $avatar->move($avatarPath, $avatarName);
            $updateData['avatar'] = '/storage/avatars/' . $avatarName;
            
            // Hapus avatar lama jika ada
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }
        }

        // Update user profile
        $user->update($updateData);

        // Initialize seasonal settings based on plant preference
        $this->initializeSeasonalSettings($user, $request->plant_preference);

        return redirect()->route('dashboard')->with('success', 'Profil berhasil dilengkapi! Sekarang Anda dapat login menggunakan email dan password. Selamat datang di SoilSense! 🌱');
    }

    /**
     * Update user profile (untuk user yang sudah lengkap profile-nya)
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        $validationRules = [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'plant_preference' => 'required|in:sawah,lahan-kering,hidroponik',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Jika user ingin update password
        if ($request->filled('password')) {
            $validationRules['current_password'] = 'required|string';
            $validationRules['password'] = 'required|string|min:8|confirmed';
        }

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Jika user ingin update password, validasi password lama
        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Password saat ini tidak benar.'])->withInput();
            }
        }

        $updateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'plant_preference' => $request->plant_preference,
        ];

        // Update password jika diisi
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = time() . '_' . $user->id . '.' . $avatar->getClientOriginalExtension();
            
            // Pastikan directory exists
            $avatarPath = public_path('storage/avatars');
            if (!file_exists($avatarPath)) {
                mkdir($avatarPath, 0755, true);
            }
            
            // Simpan avatar baru
            $avatar->move($avatarPath, $avatarName);
            $updateData['avatar'] = '/storage/avatars/' . $avatarName;
            
            // Hapus avatar lama jika ada
            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }
        }

        // Update user data
        $user->update($updateData);

        // Update seasonal settings jika plant preference berubah
        if ($user->plant_preference !== $request->plant_preference) {
            $this->updateSeasonalSettings($user, $request->plant_preference);
        }

        $message = 'Profil berhasil diperbarui!';
        if ($request->filled('password')) {
            $message .= ' Password Anda juga telah diperbarui.';
        }

        return back()->with('success', $message);
    }

    /**
     * Logout user dan redirect ke homepage
     */
    public function logout(Request $request)
    {
        // Get user name before logout for personalized message
        $userName = Auth::user() ? Auth::user()->name : 'Pengguna';
        
        // Logout user
        Auth::logout();
        
        // Invalidate session
        $request->session()->invalidate();
        
        // Regenerate CSRF token untuk security
        $request->session()->regenerateToken();
        
        // Redirect ke homepage dengan success message
        return redirect('/')->with('success', "Terima kasih {$userName}! Anda telah logout dari SoilSense. Sampai jumpa lagi! 🌱");
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
     * Update seasonal settings based on plant preference change
     */
    private function updateSeasonalSettings($user, $plantPreference)
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

        // Update existing seasonal settings
        $seasonalSetting = \App\Models\SeasonalSetting::where('user_id', $user->id)->first();
        
        if ($seasonalSetting) {
            $seasonalSetting->update([
                'dry_season_settings' => $plantSettings['dry_season_settings'],
                'wet_season_settings' => $plantSettings['wet_season_settings'],
            ]);
        } else {
            // Create new if not exists
            $this->initializeSeasonalSettings($user, $plantPreference);
        }
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
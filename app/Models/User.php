<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'barcode',
        'phone',
        'plant_preference',
        'profile_completed',
        'first_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_completed' => 'boolean',
            'first_login_at' => 'datetime',
        ];
    }

    /**
     * Get the barcode product associated with this user
     */
    public function barcodeProduct(): HasOne
    {
        return $this->hasOne(BarcodeProduct::class, 'barcode', 'barcode');
    }

    /**
     * Get the seasonal settings for this user
     */
    public function seasonalSettings(): HasOne
    {
        return $this->hasOne(SeasonalSetting::class);
    }

    /**
     * Check if user has completed their profile setup
     */
    public function isProfileComplete(): bool
    {
        return $this->profile_completed && 
               !empty($this->name) && 
               !empty($this->email) && 
               !empty($this->phone) && 
               !empty($this->plant_preference);
    }

    /**
     * Get human-readable plant preference
     */
    public function getPlantPreferenceDisplayAttribute(): string
    {
        $preferences = [
            'sawah' => 'Tanaman Sawah',
            'lahan-kering' => 'Lahan Kering', 
            'hidroponik' => 'Hidroponik',
        ];

        return $preferences[$this->plant_preference] ?? 'Belum dipilih';
    }

    /**
     * Get plant preference icon class
     */
    public function getPlantPreferenceIconAttribute(): string
    {
        $icons = [
            'sawah' => 'wheat',
            'lahan-kering' => 'sprout',
            'hidroponik' => 'droplets',
        ];

        return $icons[$this->plant_preference] ?? 'leaf';
    }

    /**
     * Get optimal settings based on plant preference
     */
    public function getOptimalSettingsAttribute(): array
    {
        $settings = [
            'sawah' => [
                'moisture_range' => '60-90%',
                'ph_range' => '5.5-7.0',
                'key_nutrients' => ['Nitrogen', 'Phosphorus'],
                'monitoring_frequency' => 'Setiap 30 menit',
            ],
            'lahan-kering' => [
                'moisture_range' => '40-70%',
                'ph_range' => '6.0-7.5',
                'key_nutrients' => ['Potassium', 'Phosphorus'],
                'monitoring_frequency' => 'Setiap 45 menit',
            ],
            'hidroponik' => [
                'moisture_range' => '70-95%',
                'ph_range' => '5.5-6.5',
                'key_nutrients' => ['NPK Balance', 'Micronutrients'],
                'monitoring_frequency' => 'Setiap 15 menit',
            ],
        ];

        return $settings[$this->plant_preference] ?? $settings['lahan-kering'];
    }

    /**
     * Get days since first login
     */
    public function getDaysSinceFirstLoginAttribute(): int
    {
        if (!$this->first_login_at) {
            return 0;
        }

        return $this->first_login_at->diffInDays(now());
    }

    /**
     * Check if user is a new user (first week)
     */
    public function isNewUser(): bool
    {
        return $this->days_since_first_login <= 7;
    }

    /**
     * Get personalized greeting based on time and plant preference
     */
    public function getPersonalizedGreetingAttribute(): string
    {
        $hour = now()->hour;
        $timeGreeting = '';

        if ($hour < 12) {
            $timeGreeting = 'Selamat pagi';
        } elseif ($hour < 17) {
            $timeGreeting = 'Selamat siang';
        } else {
            $timeGreeting = 'Selamat malam';
        }

        $plantGreeting = '';
        if ($this->plant_preference) {
            $plantGreeting = ' petani ' . strtolower($this->plant_preference_display);
        }

        return $timeGreeting . $plantGreeting . ', ' . $this->name . '!';
    }

    /**
     * Scope for users with completed profiles
     */
    public function scopeProfileComplete($query)
    {
        return $query->where('profile_completed', true);
    }

    /**
     * Scope for users by plant preference
     */
    public function scopeByPlantPreference($query, $preference)
    {
        return $query->where('plant_preference', $preference);
    }

    /**
     * Scope for new users (within first week)
     */
    public function scopeNewUsers($query)
    {
        return $query->where('first_login_at', '>=', now()->subDays(7));
    }
}
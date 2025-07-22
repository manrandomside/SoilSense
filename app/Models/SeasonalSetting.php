<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeasonalSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'season_mode',
        'current_season',
        'dry_season_settings',
        'wet_season_settings',
        'power_conservation_enabled',
        'monitoring_interval_dry',
        'monitoring_interval_wet',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'dry_season_settings' => 'array',
        'wet_season_settings' => 'array',
        'power_conservation_enabled' => 'boolean',
        'monitoring_interval_dry' => 'integer',
        'monitoring_interval_wet' => 'integer',
    ];

    /**
     * Get the user that owns the seasonal setting.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get current season settings based on active season
     */
    public function getCurrentSeasonSettings(): array
    {
        return $this->current_season === 'dry' 
            ? $this->dry_season_settings 
            : $this->wet_season_settings;
    }

    /**
     * Get current monitoring interval based on active season
     */
    public function getCurrentMonitoringInterval(): int
    {
        return $this->current_season === 'dry' 
            ? $this->monitoring_interval_dry 
            : $this->monitoring_interval_wet;
    }

    /**
     * Check if value is within current season threshold
     */
    public function isWithinMoistureThreshold(float $moisture): bool
    {
        $settings = $this->getCurrentSeasonSettings();
        return $moisture >= $settings['moisture_min'] && $moisture <= $settings['moisture_max'];
    }

    /**
     * Check if pH is within current season threshold
     */
    public function isWithinPhThreshold(float $ph): bool
    {
        $settings = $this->getCurrentSeasonSettings();
        return $ph >= $settings['ph_min'] && $ph <= $settings['ph_max'];
    }

    /**
     * Get seasonal recommendations based on current season
     */
    public function getSeasonalRecommendations(): array
    {
        if ($this->current_season === 'dry') {
            return [
                'icon' => '🌞',
                'title' => 'Musim Kemarau',
                'description' => 'Fokus pada irigasi & konservasi air',
                'color' => 'orange',
                'bgColor' => 'from-orange-50 to-yellow-50',
                'textColor' => 'text-orange-600',
                'recommendations' => [
                    'Tingkatkan frekuensi monitoring kelembapan tanah',
                    'Siapkan sistem irigasi tambahan untuk antisipasi kekeringan',
                    'Pantau efisiensi solar panel untuk charging optimal',
                    'Pertimbangkan mulsa untuk mengurangi evaporasi air',
                ],
                'optimal_watering' => 'Pagi (06:00-08:00) dan sore (16:00-18:00)',
                'monitoring_frequency' => 'Setiap 30 menit'
            ];
        } else {
            return [
                'icon' => '🌧️',
                'title' => 'Musim Hujan',
                'description' => 'Fokus pada drainase & pencegahan penyakit',
                'color' => 'blue',
                'bgColor' => 'from-blue-50 to-green-50',
                'textColor' => 'text-blue-600',
                'recommendations' => [
                    'Pastikan sistem drainase tanah berfungsi optimal',
                    'Monitor pH tanah lebih sering karena perubahan curah hujan',
                    'Aktifkan mode hemat daya untuk mengoptimalkan battery',
                    'Waspada penyakit tanaman akibat kelembapan tinggi',
                ],
                'optimal_watering' => 'Sesuaikan dengan curah hujan alami',
                'monitoring_frequency' => 'Setiap 60 menit'
            ];
        }
    }

    /**
     * Auto-detect and update season based on Indonesian climate pattern
     */
    public function autoUpdateSeason(): void
    {
        if ($this->season_mode === 'auto') {
            $month = now()->month;
            
            // Indonesian dry season: April - September (month 4-9)
            // Indonesian wet season: October - March (month 10-12, 1-3)
            $detectedSeason = ($month >= 4 && $month <= 9) ? 'dry' : 'wet';
            
            if ($this->current_season !== $detectedSeason) {
                $this->update(['current_season' => $detectedSeason]);
            }
        }
    }

    /**
     * Get season transition information
     */
    public function getSeasonTransitionInfo(): array
    {
        $month = now()->month;
        
        if ($this->current_season === 'dry') {
            $daysUntilWet = $month <= 9 
                ? now()->diffInDays(now()->setMonth(10)->setDay(1))
                : 0;
                
            return [
                'next_season' => 'wet',
                'next_season_name' => 'Musim Hujan',
                'estimated_date' => 'Oktober',
                'days_remaining' => $daysUntilWet,
                'preparation_tips' => [
                    'Siapkan sistem drainase',
                    'Cek kondisi atap/pelindung sensor',
                    'Backup data penting'
                ]
            ];
        } else {
            $daysUntilDry = $month >= 4 
                ? now()->diffInDays(now()->addYear()->setMonth(4)->setDay(1))
                : now()->diffInDays(now()->setMonth(4)->setDay(1));
                
            return [
                'next_season' => 'dry',
                'next_season_name' => 'Musim Kemarau',
                'estimated_date' => 'April',
                'days_remaining' => $daysUntilDry,
                'preparation_tips' => [
                    'Siapkan sistem irigasi',
                    'Cek kondisi solar panel',
                    'Stok air untuk irigasi darurat'
                ]
            ];
        }
    }
}
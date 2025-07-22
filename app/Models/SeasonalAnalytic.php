<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class SeasonalAnalytic extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'season',
        'date',
        'avg_moisture',
        'avg_ph',
        'avg_temperature',
        'solar_efficiency',
        'irrigation_count',
        'npk_avg',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'date' => 'date',
        'avg_moisture' => 'decimal:2',
        'avg_ph' => 'decimal:1',
        'avg_temperature' => 'decimal:1',
        'solar_efficiency' => 'decimal:2',
        'irrigation_count' => 'integer',
        'npk_avg' => 'array',
    ];

    /**
     * Get the user that owns the seasonal analytic.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for dry season data
     */
    public function scopeDrySeason($query)
    {
        return $query->where('season', 'dry');
    }

    /**
     * Scope for wet season data
     */
    public function scopeWetSeason($query)
    {
        return $query->where('season', 'wet');
    }

    /**
     * Get analytics for specific date range
     */
    public function scopeDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Get current month analytics
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year);
    }

    /**
     * Get last 30 days analytics
     */
    public function scopeLast30Days($query)
    {
        return $query->where('date', '>=', now()->subDays(30));
    }

    /**
     * Create or update daily analytics record
     */
    public static function recordDailyData(int $userId, array $sensorData, string $season): self
    {
        $today = now()->toDateString();
        
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'date' => $today,
            ],
            [
                'season' => $season,
                'avg_moisture' => $sensorData['moisture'],
                'avg_ph' => $sensorData['ph'],
                'avg_temperature' => $sensorData['temperature'],
                'solar_efficiency' => $sensorData['solar_efficiency'] ?? 0,
                'irrigation_count' => $sensorData['irrigation_count'] ?? 0,
                'npk_avg' => $sensorData['npk'] ?? ['nitrogen' => 0, 'phosphorus' => 0, 'potassium' => 0],
            ]
        );
    }

    /**
     * Get seasonal performance comparison
     */
    public static function getSeasonalComparison(int $userId, int $days = 90): array
    {
        $startDate = now()->subDays($days);
        
        $drySeasonData = self::where('user_id', $userId)
            ->drySeason()
            ->where('date', '>=', $startDate)
            ->selectRaw('
                AVG(avg_moisture) as avg_moisture,
                AVG(avg_ph) as avg_ph,
                AVG(avg_temperature) as avg_temperature,
                AVG(solar_efficiency) as avg_solar_efficiency,
                SUM(irrigation_count) as total_irrigations,
                COUNT(*) as days_count
            ')
            ->first();

        $wetSeasonData = self::where('user_id', $userId)
            ->wetSeason()
            ->where('date', '>=', $startDate)
            ->selectRaw('
                AVG(avg_moisture) as avg_moisture,
                AVG(avg_ph) as avg_ph,
                AVG(avg_temperature) as avg_temperature,
                AVG(solar_efficiency) as avg_solar_efficiency,
                SUM(irrigation_count) as total_irrigations,
                COUNT(*) as days_count
            ')
            ->first();

        return [
            'dry_season' => [
                'avg_moisture' => round($drySeasonData->avg_moisture ?? 45, 1),
                'avg_ph' => round($drySeasonData->avg_ph ?? 6.5, 1),
                'avg_temperature' => round($drySeasonData->avg_temperature ?? 29.0, 1),
                'solar_efficiency' => round($drySeasonData->avg_solar_efficiency ?? 85, 1),
                'total_irrigations' => $drySeasonData->total_irrigations ?? 0,
                'days_monitored' => $drySeasonData->days_count ?? 0,
                'irrigation_frequency' => $drySeasonData->days_count > 0 
                    ? round(($drySeasonData->total_irrigations ?? 0) / $drySeasonData->days_count, 1)
                    : 0,
            ],
            'wet_season' => [
                'avg_moisture' => round($wetSeasonData->avg_moisture ?? 70, 1),
                'avg_ph' => round($wetSeasonData->avg_ph ?? 6.2, 1),
                'avg_temperature' => round($wetSeasonData->avg_temperature ?? 26.5, 1),
                'solar_efficiency' => round($wetSeasonData->avg_solar_efficiency ?? 65, 1),
                'total_irrigations' => $wetSeasonData->total_irrigations ?? 0,
                'days_monitored' => $wetSeasonData->days_count ?? 0,
                'irrigation_frequency' => $wetSeasonData->days_count > 0 
                    ? round(($wetSeasonData->total_irrigations ?? 0) / $wetSeasonData->days_count, 1)
                    : 0,
            ],
        ];
    }

    /**
     * Get seasonal trends for charts
     */
    public static function getSeasonalTrends(int $userId, string $season, int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        $trends = self::where('user_id', $userId)
            ->where('season', $season)
            ->where('date', '>=', $startDate)
            ->orderBy('date')
            ->get(['date', 'avg_moisture', 'avg_ph', 'avg_temperature', 'solar_efficiency'])
            ->map(function ($item) {
                return [
                    'date' => $item->date->format('Y-m-d'),
                    'moisture' => (float) $item->avg_moisture,
                    'ph' => (float) $item->avg_ph,
                    'temperature' => (float) $item->avg_temperature,
                    'solar' => (float) $item->solar_efficiency,
                ];
            })
            ->toArray();

        return $trends;
    }

    /**
     * Get irrigation efficiency insights
     */
    public function getIrrigationEfficiency(): array
    {
        $moistureImprovement = 0; // Calculate based on before/after irrigation data
        
        return [
            'irrigation_count' => $this->irrigation_count,
            'efficiency_score' => min(100, max(0, 100 - ($this->irrigation_count * 2))), // Simple scoring
            'water_usage_estimate' => $this->irrigation_count * 15, // liters (estimate)
            'cost_efficiency' => $this->irrigation_count > 0 
                ? round($this->avg_moisture / $this->irrigation_count, 2)
                : 0,
        ];
    }

    /**
     * Generate weekly summary
     */
    public static function getWeeklySummary(int $userId): array
    {
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        
        $weeklyData = self::where('user_id', $userId)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->get();

        $summary = [
            'total_days' => $weeklyData->count(),
            'avg_moisture' => round($weeklyData->avg('avg_moisture'), 1),
            'avg_ph' => round($weeklyData->avg('avg_ph'), 1),
            'avg_temperature' => round($weeklyData->avg('avg_temperature'), 1),
            'total_irrigations' => $weeklyData->sum('irrigation_count'),
            'avg_solar_efficiency' => round($weeklyData->avg('solar_efficiency'), 1),
            'dominant_season' => $weeklyData->groupBy('season')->map->count()->sortDesc()->keys()->first(),
        ];

        return $summary;
    }
}
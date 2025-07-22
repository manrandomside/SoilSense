import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Battery,
    Bell,
    ChevronRight,
    CloudRain,
    Droplets,
    Leaf,
    Settings,
    Sprout,
    Sun,
    Thermometer,
    TreePine,
    TrendingUp,
    User,
    Wheat,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SensorData {
    moisture: number;
    ph: number;
    npk: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
    };
    temperature: number;
    lastUpdate: string;
}

interface SeasonalThresholds {
    moisture_min: number;
    moisture_max: number;
    ph_min: number;
    ph_max: number;
}

interface SeasonalSettings {
    season_mode: 'auto' | 'manual_dry' | 'manual_wet';
    current_season: 'dry' | 'wet';
    dry_season_settings: SeasonalThresholds;
    wet_season_settings: SeasonalThresholds;
    power_conservation_enabled: boolean;
}

interface SeasonalMetrics {
    avg_moisture: number;
    solar_efficiency: number;
    irrigation_frequency: number;
}

interface SeasonalAnalytics {
    dry_season: SeasonalMetrics;
    wet_season: SeasonalMetrics;
}

interface WeatherForecast {
    season: 'dry' | 'wet';
    icon: string;
    name: string;
    description: string;
    color: string;
    recommendations: string[];
    next_season_estimate: string;
}

interface DashboardProps {
    user: {
        name: string;
        email?: string;
        avatar?: string;
    };
    sensorData: SensorData;
    statistics?: {
        totalSensors: number;
        alertsCount: number;
        lastSyncTime: string;
        batteryLevel: number;
    };
    weatherData?: {
        temperature: number;
        humidity: number;
        condition: string;
        rainfall: number;
        windSpeed: number;
        seasonal_forecast?: WeatherForecast;
    };
    seasonalSettings?: SeasonalSettings;
    seasonalAnalytics?: SeasonalAnalytics;
}

interface PlantType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    optimalMoisture: string;
}

interface MoistureStatus {
    status: string;
    message: string;
    color: string;
    bgColor: string;
}

interface SeasonalInfo {
    season: 'dry' | 'wet';
    icon: string;
    title: string;
    description: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    mode: 'auto' | 'manual_dry' | 'manual_wet';
}

const Dashboard: React.FC<DashboardProps> = ({ user, sensorData, statistics, weatherData, seasonalSettings, seasonalAnalytics }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPlantType, setSelectedPlantType] = useState<string | null>(null);
    const [showSeasonalSettings, setShowSeasonalSettings] = useState(false);
    const [showSeasonalAnalytics, setShowSeasonalAnalytics] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get seasonal information
    const getSeasonalInfo = (): SeasonalInfo | null => {
        if (!seasonalSettings) return null;

        const isDry = seasonalSettings.current_season === 'dry';
        return {
            season: seasonalSettings.current_season,
            icon: isDry ? '🌞' : '🌧️',
            title: isDry ? 'Musim Kemarau' : 'Musim Hujan',
            description: isDry ? 'Fokus pada irigasi & konservasi air' : 'Fokus pada drainase & pencegahan penyakit',
            bgColor: isDry ? 'from-orange-50 to-yellow-50' : 'from-blue-50 to-green-50',
            borderColor: isDry ? 'border-orange-200' : 'border-blue-200',
            textColor: isDry ? 'text-orange-600' : 'text-blue-600',
            mode: seasonalSettings.season_mode,
        };
    };

    // Fungsi untuk menentukan status kelembapan dengan seasonal context
    const getMoistureStatus = (moisture: number): MoistureStatus => {
        let thresholds = { min: 30, max: 70 };

        if (seasonalSettings) {
            const settings = seasonalSettings.current_season === 'dry' ? seasonalSettings.dry_season_settings : seasonalSettings.wet_season_settings;
            thresholds = { min: settings.moisture_min, max: settings.moisture_max };
        }

        if (moisture < thresholds.min)
            return {
                status: 'Kering',
                message: `Tanaman membutuhkan air segera! (Target: ${thresholds.min}-${thresholds.max}%)`,
                color: 'text-red-600',
                bgColor: 'bg-red-100',
            };
        if (moisture > thresholds.max)
            return {
                status: 'Terlalu Basah',
                message: `Kelembapan berlebih, perhatikan drainase! (Target: ${thresholds.min}-${thresholds.max}%)`,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
            };
        if (moisture < (thresholds.min + thresholds.max) / 2)
            return {
                status: 'Sedang Haus',
                message: `Kondisi cukup baik, pantau terus! (Target: ${thresholds.min}-${thresholds.max}%)`,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
            };
        return {
            status: 'Optimal',
            message: `Perfect! Kelembapan dalam range seasonal optimal! (${thresholds.min}-${thresholds.max}%)`,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        };
    };

    // Fungsi untuk menentukan warna progress bar
    const getMoistureBarColor = (moisture: number): string => {
        if (moisture < 30) return 'bg-gradient-to-r from-red-500 to-red-400';
        if (moisture < 50) return 'bg-gradient-to-r from-yellow-500 to-orange-400';
        if (moisture < 70) return 'bg-gradient-to-r from-green-500 to-green-400';
        return 'bg-gradient-to-r from-blue-500 to-green-400';
    };

    const moistureStatus = getMoistureStatus(sensorData.moisture);
    const seasonalInfo = getSeasonalInfo();

    const plantTypes: PlantType[] = [
        {
            id: 'sawah',
            name: 'Sawah',
            icon: Wheat,
            description: 'Tanaman padi & sereal',
            optimalMoisture: '60-80%',
        },
        {
            id: 'lahan-kering',
            name: 'Lahan Kering',
            icon: TreePine,
            description: 'Tanaman sayuran & buah',
            optimalMoisture: '40-60%',
        },
        {
            id: 'hidroponik',
            name: 'Hidroponik',
            icon: Sprout,
            description: 'Sistem tanam modern',
            optimalMoisture: '70-90%',
        },
    ];

    return (
        <>
            <Head title="Dashboard - SoilSense" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-green-200 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-blue-500">
                                    <Leaf className="h-6 w-6 text-white" />
                                </div>
                                <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                                    SoilSense
                                </h1>
                            </div>

                            {/* User Actions */}
                            <div className="flex items-center space-x-4">
                                <button className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600">
                                    <Bell className="h-5 w-5" />
                                    {statistics && statistics.alertsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                            {statistics.alertsCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowSeasonalSettings(true)}
                                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600"
                                >
                                    <Settings className="h-5 w-5" />
                                </button>
                                <div className="flex items-center space-x-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                        {user.email && <span className="text-xs text-gray-500">{user.email}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Selamat Datang, {user.name}! 👋</h2>
                        <p className="text-gray-600">
                            Pantau kondisi tanah Anda secara real-time • {currentTime.toLocaleTimeString('id-ID')}
                            {statistics && (
                                <span className="ml-2">
                                    • {statistics.totalSensors} sensor aktif • Battery {statistics.batteryLevel}%
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Seasonal Status Card - NEW */}
                    {seasonalInfo && (
                        <div className={`mb-8 rounded-2xl border ${seasonalInfo.borderColor} bg-gradient-to-r ${seasonalInfo.bgColor} p-6 shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl">{seasonalInfo.icon}</div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className={`text-xl font-bold ${seasonalInfo.textColor}`}>{seasonalInfo.title}</h3>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${seasonalInfo.textColor} bg-white/50`}
                                            >
                                                {seasonalInfo.mode === 'auto' ? 'Auto-Detect' : 'Manual'}
                                            </span>
                                        </div>
                                        <p className={`${seasonalInfo.textColor} font-medium`}>{seasonalInfo.description}</p>
                                        {seasonalSettings?.power_conservation_enabled && (
                                            <div className="mt-2 flex items-center space-x-1 text-sm text-green-600">
                                                <Battery className="h-4 w-4" />
                                                <span>Mode Hemat Daya Aktif</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowSeasonalAnalytics(true)}
                                        className={`rounded-lg bg-white/70 px-4 py-2 text-sm font-medium ${seasonalInfo.textColor} transition-colors hover:bg-white/90`}
                                    >
                                        <BarChart3 className="mr-1 inline h-4 w-4" />
                                        Analytics
                                    </button>
                                    <button
                                        onClick={() => setShowSeasonalSettings(true)}
                                        className={`rounded-lg bg-white/70 px-4 py-2 text-sm font-medium ${seasonalInfo.textColor} transition-colors hover:bg-white/90`}
                                    >
                                        <Settings className="mr-1 inline h-4 w-4" />
                                        Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weather Info (enhanced) */}
                    {weatherData && (
                        <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 to-blue-50 p-6 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">Cuaca Hari Ini</h3>
                                    <p className="text-blue-700">
                                        {weatherData.condition} • {weatherData.temperature}°C
                                    </p>
                                </div>
                                <div className="text-right text-sm text-blue-600">
                                    <p>Kelembapan: {weatherData.humidity}%</p>
                                    <p>Angin: {weatherData.windSpeed} km/h</p>
                                    {weatherData.rainfall > 0 && <p className="font-medium">Hujan: {weatherData.rainfall}mm</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Sensor Display */}
                    <div className="mb-8 rounded-2xl border border-green-100 bg-white p-8 shadow-lg">
                        {/* Moisture Main Indicator */}
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-blue-100">
                                <div className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-5xl font-bold text-transparent">
                                    {sensorData.moisture}%
                                </div>
                            </div>

                            <div
                                className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${moistureStatus.bgColor} ${moistureStatus.color} mb-4`}
                            >
                                {moistureStatus.status}
                            </div>

                            <p className="mx-auto max-w-lg text-lg text-gray-600">{moistureStatus.message}</p>

                            {/* Progress Bar */}
                            <div className="mx-auto mt-6 w-full max-w-md">
                                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className={`h-full ${getMoistureBarColor(sensorData.moisture)} transition-all duration-1000 ease-out`}
                                        style={{ width: `${sensorData.moisture}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Sensor Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Kelembapan Card */}
                            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-blue-500 p-3">
                                        <Droplets className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="mb-1 text-3xl font-bold text-blue-700">{sensorData.moisture}%</div>
                                <p className="font-medium text-blue-600">Kelembapan Tanah</p>
                            </div>

                            {/* pH Card */}
                            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-green-500 p-3">
                                        <Leaf className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="mb-1 text-3xl font-bold text-green-700">{sensorData.ph}</div>
                                <p className="font-medium text-green-600">pH Tanah</p>
                            </div>

                            {/* Temperature Card */}
                            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="rounded-lg bg-orange-500 p-3">
                                        <Thermometer className="h-6 w-6 text-white" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="mb-1 text-3xl font-bold text-orange-700">{sensorData.temperature}°C</div>
                                <p className="font-medium text-orange-600">Suhu Tanah</p>
                            </div>
                        </div>
                    </div>

                    {/* Seasonal Analytics Quick View - NEW */}
                    {seasonalAnalytics && (
                        <div className="mb-8 rounded-2xl border border-purple-100 bg-white p-8 shadow-lg">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Performa Seasonal</h3>
                                <button
                                    onClick={() => setShowSeasonalAnalytics(true)}
                                    className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                                >
                                    Lihat Detail <ChevronRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Dry Season */}
                                <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
                                    <div className="mb-4 flex items-center space-x-3">
                                        <Sun className="h-6 w-6 text-orange-500" />
                                        <h4 className="font-semibold text-orange-700">Musim Kemarau</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Kelembapan Rata-rata:</span>
                                            <span className="font-medium">{seasonalAnalytics.dry_season.avg_moisture}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Efisiensi Solar:</span>
                                            <span className="font-medium">{seasonalAnalytics.dry_season.solar_efficiency}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Frekuensi Irigasi:</span>
                                            <span className="font-medium">{seasonalAnalytics.dry_season.irrigation_frequency}x/hari</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Wet Season */}
                                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 p-6">
                                    <div className="mb-4 flex items-center space-x-3">
                                        <CloudRain className="h-6 w-6 text-blue-500" />
                                        <h4 className="font-semibold text-blue-700">Musim Hujan</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Kelembapan Rata-rata:</span>
                                            <span className="font-medium">{seasonalAnalytics.wet_season.avg_moisture}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Efisiensi Solar:</span>
                                            <span className="font-medium">{seasonalAnalytics.wet_season.solar_efficiency}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Frekuensi Irigasi:</span>
                                            <span className="font-medium">{seasonalAnalytics.wet_season.irrigation_frequency}x/hari</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plant Type Selection */}
                    <div className="mb-8 rounded-2xl border border-green-100 bg-white p-8 shadow-lg">
                        <div className="mb-8 text-center">
                            <h3 className="mb-2 text-2xl font-bold text-gray-900">Mau Tanam Lagi? 🌱</h3>
                            <p className="text-gray-600">Wow kamu semangat banget, mau tanam dimana?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {plantTypes.map((plantType) => {
                                const IconComponent = plantType.icon;
                                const isSelected = selectedPlantType === plantType.id;

                                return (
                                    <button
                                        key={plantType.id}
                                        onClick={() => setSelectedPlantType(plantType.id)}
                                        className={`rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                                            isSelected
                                                ? 'border-green-500 bg-green-50 shadow-lg'
                                                : 'border-gray-200 bg-gray-50 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center space-y-4 text-center">
                                            <div className={`rounded-full p-4 ${isSelected ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                <IconComponent className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="mb-1 text-lg font-semibold text-gray-900">{plantType.name}</h4>
                                                <p className="mb-2 text-sm text-gray-600">{plantType.description}</p>
                                                <p className="text-xs font-medium text-green-600">Optimal: {plantType.optimalMoisture}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedPlantType && (
                            <div className="mt-8 text-center">
                                <Link
                                    href={`/planting/${selectedPlantType}`}
                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-600 hover:shadow-xl"
                                >
                                    Mulai Menanam
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* NPK Quick View */}
                    <div className="rounded-2xl border border-green-100 bg-white p-8 shadow-lg">
                        <h3 className="mb-6 text-xl font-bold text-gray-900">Nutrisi Tanah (NPK)</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mb-2 text-2xl font-bold text-purple-600">{sensorData.npk.nitrogen}%</div>
                                <p className="text-gray-600">Nitrogen (N)</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-purple-100">
                                    <div
                                        className="h-2 rounded-full bg-purple-500 transition-all duration-1000"
                                        style={{ width: `${sensorData.npk.nitrogen}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-2xl font-bold text-pink-600">{sensorData.npk.phosphorus}%</div>
                                <p className="text-gray-600">Phosphorus (P)</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-pink-100">
                                    <div
                                        className="h-2 rounded-full bg-pink-500 transition-all duration-1000"
                                        style={{ width: `${sensorData.npk.phosphorus}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-2xl font-bold text-indigo-600">{sensorData.npk.potassium}%</div>
                                <p className="text-gray-600">Potassium (K)</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-indigo-100">
                                    <div
                                        className="h-2 rounded-full bg-indigo-500 transition-all duration-1000"
                                        style={{ width: `${sensorData.npk.potassium}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Seasonal Settings Modal - NEW */}
                {showSeasonalSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Pengaturan Musim</h2>
                                    <button onClick={() => setShowSeasonalSettings(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Season Mode Selection */}
                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-gray-700">Mode Musim</label>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <button className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 font-medium text-blue-600">
                                                Auto-Detect
                                            </button>
                                            <button className="rounded-lg border-2 border-gray-200 p-3 text-gray-600 hover:border-orange-200 hover:bg-orange-50">
                                                Manual - Kemarau
                                            </button>
                                            <button className="rounded-lg border-2 border-gray-200 p-3 text-gray-600 hover:border-blue-200 hover:bg-blue-50">
                                                Manual - Hujan
                                            </button>
                                        </div>
                                    </div>

                                    {/* Threshold Settings */}
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Dry Season Settings */}
                                        <div className="rounded-lg border border-orange-200 p-4">
                                            <h3 className="mb-4 flex items-center text-lg font-semibold text-orange-600">
                                                <Sun className="mr-2 h-5 w-5" />
                                                Musim Kemarau
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Kelembapan (%)</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">pH Range</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Interval Monitoring (menit)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="30"
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wet Season Settings */}
                                        <div className="rounded-lg border border-blue-200 p-4">
                                            <h3 className="mb-4 flex items-center text-lg font-semibold text-blue-600">
                                                <CloudRain className="mr-2 h-5 w-5" />
                                                Musim Hujan
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">Kelembapan (%)</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">pH Range</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Min"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Max"
                                                            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Interval Monitoring (menit)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="60"
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Power Conservation */}
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center space-x-3">
                                            <Battery className="h-5 w-5 text-green-600" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">Mode Hemat Daya</h4>
                                                <p className="text-sm text-gray-500">Aktif otomatis saat musim hujan</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input type="checkbox" className="peer sr-only" />
                                            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-600 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowSeasonalSettings(false)}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700">Simpan Pengaturan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seasonal Analytics Modal - NEW */}
                {showSeasonalAnalytics && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Analytics Seasonal</h2>
                                    <button onClick={() => setShowSeasonalAnalytics(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                                            <div className="text-2xl font-bold text-orange-600">85%</div>
                                            <div className="text-sm text-orange-600">Solar Efficiency (Dry)</div>
                                        </div>
                                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">65%</div>
                                            <div className="text-sm text-blue-600">Solar Efficiency (Wet)</div>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">2.3x</div>
                                            <div className="text-sm text-green-600">Irigasi/Hari (Dry)</div>
                                        </div>
                                        <div className="rounded-lg bg-purple-50 p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-600">0.8x</div>
                                            <div className="text-sm text-purple-600">Irigasi/Hari (Wet)</div>
                                        </div>
                                    </div>

                                    {/* Chart Placeholder */}
                                    <div className="rounded-lg border border-gray-200 p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Trend Kelembapan Musiman</h3>
                                        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
                                            <div className="text-center text-gray-500">
                                                <BarChart3 className="mx-auto mb-2 h-12 w-12" />
                                                <p>Chart akan ditampilkan di sini</p>
                                                <p className="text-sm">Integrasi dengan Chart.js/Recharts</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="rounded-lg border border-gray-200 p-6">
                                        <h3 className="mb-4 text-lg font-semibold">Rekomendasi Berdasarkan Pola Musiman</h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                                <h4 className="mb-2 font-medium text-orange-700">🌞 Persiapan Musim Kemarau</h4>
                                                <ul className="space-y-1 text-sm text-orange-600">
                                                    <li>• Siapkan sistem irigasi tambahan</li>
                                                    <li>• Tingkatkan monitoring ke 30 menit</li>
                                                    <li>• Optimasi panel surya untuk charging</li>
                                                </ul>
                                            </div>
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                <h4 className="mb-2 font-medium text-blue-700">🌧️ Persiapan Musim Hujan</h4>
                                                <ul className="space-y-1 text-sm text-blue-600">
                                                    <li>• Pastikan drainase berfungsi optimal</li>
                                                    <li>• Aktifkan mode hemat daya</li>
                                                    <li>• Monitor pH lebih intensif</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// Type-safe way untuk disable layout
interface ComponentWithLayout extends React.FC<DashboardProps> {
    layout?: (page: React.ReactNode) => React.ReactNode;
}

const DashboardWithLayout: ComponentWithLayout = Dashboard;
DashboardWithLayout.layout = (page: React.ReactNode) => page;

export default DashboardWithLayout;

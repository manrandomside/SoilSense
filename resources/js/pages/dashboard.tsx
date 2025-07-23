import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Battery,
    Bell,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    CloudRain,
    Droplets,
    Leaf,
    Lightbulb,
    Sprout,
    Sun,
    Target,
    TreePine,
    TrendingUp,
    User,
    Wheat,
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
    color: string;
    bgGradient: string;
    description: string;
    optimal: string;
    priority: 'primary' | 'secondary';
}

const plantTypes: PlantType[] = [
    {
        id: 'sawah',
        name: 'Sawah',
        icon: Wheat,
        color: 'text-emerald-600',
        bgGradient: 'from-emerald-50 via-emerald-100 to-green-100',
        description: 'Tanaman padi & sereal',
        optimal: '60-80%',
        priority: 'primary',
    },
    {
        id: 'lahan_kering',
        name: 'Lahan Kering',
        icon: Sprout,
        color: 'text-amber-600',
        bgGradient: 'from-amber-50 via-yellow-100 to-orange-100',
        description: 'Tanaman sayuran & buah',
        optimal: '40-60%',
        priority: 'primary',
    },
    {
        id: 'hidroponik',
        name: 'Hidroponik',
        icon: TreePine,
        color: 'text-blue-600',
        bgGradient: 'from-blue-50 via-cyan-100 to-teal-100',
        description: 'Sistem tanam modern',
        optimal: '70-90%',
        priority: 'secondary',
    },
];

const Dashboard: React.FC<DashboardProps> = ({
    user,
    sensorData,
    statistics = {
        totalSensors: 3,
        alertsCount: 0,
        lastSyncTime: new Date().toISOString(),
        batteryLevel: 85,
    },
    weatherData = {
        temperature: 32,
        humidity: 78,
        condition: 'Cerah Berawan',
        rainfall: 0,
        windSpeed: 5,
    },
    seasonalSettings,
    seasonalAnalytics,
}) => {
    const [selectedPlant, setSelectedPlant] = useState<string>('sawah');
    const [isLoading, setIsLoading] = useState(false);

    // Animation states
    const [cardHovered, setCardHovered] = useState<string | null>(null);
    const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate real-time data updates
            setIsLoading((prev) => !prev);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getMoistureStatus = (moisture: number) => {
        if (moisture < 30) return { status: 'Kering', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
        if (moisture < 60) return { status: 'Optimal', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
        return { status: 'Terlalu Basah', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    };

    const currentMoistureStatus = getMoistureStatus(sensorData.moisture);
    const primaryPlants = plantTypes.filter((p) => p.priority === 'primary');
    const secondaryPlants = plantTypes.filter((p) => p.priority === 'secondary');

    return (
        <>
            <Head title="SoilSense Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(16, 185, 129)" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Floating Decorative Elements */}
                <div className="absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full bg-green-200/30 blur-xl"></div>
                <div
                    className="absolute top-40 right-20 h-32 w-32 animate-pulse rounded-full bg-emerald-200/20 blur-2xl"
                    style={{ animationDelay: '1000ms' }}
                ></div>
                <div
                    className="absolute bottom-20 left-1/4 h-24 w-24 animate-pulse rounded-full bg-cyan-200/25 blur-xl"
                    style={{ animationDelay: '2000ms' }}
                ></div>

                {/* Enhanced Header */}
                <header className="sticky top-0 z-50 border-b border-emerald-200/30 bg-white/90 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg ring-2 ring-green-200">
                                        <Leaf className="h-6 w-6 text-white" />
                                    </div>
                                    {isLoading && <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400"></div>}
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-bold text-transparent">
                                        SoilSense
                                    </h1>
                                    <p className="text-xs text-slate-500">Smart Agriculture System</p>
                                </div>
                            </div>

                            {/* Enhanced Header Actions */}
                            <div className="flex items-center space-x-4">
                                {/* Real-time Status - Removed "Live" text */}
                                <div className="hidden items-center space-x-2 rounded-full bg-green-50 px-3 py-1.5 ring-1 ring-green-200/50 md:flex">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                                </div>

                                {/* Notifications */}
                                <div className="relative">
                                    <button className="rounded-xl p-2 text-slate-600 transition-all duration-200 hover:scale-105 hover:bg-slate-100 hover:text-slate-900">
                                        <Bell className="h-5 w-5" />
                                        {statistics.alertsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                                {statistics.alertsCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Enhanced User Profile - MODIFIED: Removed Settings and Analytics */}
                                <div className="group relative">
                                    <button className="flex cursor-pointer items-center space-x-3 rounded-full bg-gradient-to-r from-white to-slate-50 p-2 pr-4 shadow-sm ring-1 ring-slate-200/50 transition-all duration-200 hover:scale-105 hover:shadow-md hover:ring-green-300/50">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-md transition-all duration-200 group-hover:from-green-600 group-hover:to-emerald-700">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-green-700">
                                                {user.name}
                                            </div>
                                            {user.email && (
                                                <div className="text-xs text-slate-500 transition-colors group-hover:text-green-600">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-slate-400 transition-colors group-hover:text-green-600" />
                                    </button>

                                    {/* Dropdown Menu - MODIFIED: Only Profile and Logout */}
                                    <div className="ring-opacity-5 invisible absolute top-full right-0 z-50 mt-2 w-48 rounded-xl bg-white opacity-0 shadow-lg ring-1 ring-black transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Lihat Profile
                                            </Link>
                                            <hr className="my-1" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                    />
                                                </svg>
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Enhanced Main Content */}
                <main className="z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Enhanced Welcome Section - MODIFIED: Removed Weather Info and Seasonal Indicator */}
                    <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 p-8 text-white shadow-2xl ring-1 ring-green-200/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="mb-2 text-3xl font-bold">Selamat Datang, {user.name}! 👋</h2>
                                <div className="flex flex-wrap items-center gap-4 text-green-100">
                                    <span className="flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Pantau kondisi tanah Anda secara real-time
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        {new Date().toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        {statistics.totalSensors} sensor aktif
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Battery className="h-4 w-4" />
                                        Battery {statistics.batteryLevel}%
                                    </span>
                                </div>
                            </div>

                            {/* Simple Decorative Element */}
                            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                                <div className="text-2xl">🌱</div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Main Moisture Display */}
                    <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200/50">
                        <div className="text-center">
                            {/* Large Moisture Circle with Animation */}
                            <div className="relative mx-auto mb-6 h-64 w-64">
                                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                    {/* Background Circle */}
                                    <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="opacity-20" />
                                    {/* Progress Circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="url(#moistureGradient)"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${sensorData.moisture * 2.827} ${283}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                        style={{
                                            filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))',
                                        }}
                                    />
                                    <defs>
                                        <linearGradient id="moistureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Center Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-6xl font-bold text-transparent">
                                        {sensorData.moisture}%
                                    </div>
                                    <div className="mt-2 text-xl font-medium text-slate-600">Terlalu Basah</div>
                                    <Droplets className="mt-1 h-6 w-6 animate-bounce text-green-500" />
                                </div>
                            </div>

                            {/* Enhanced Status Bar */}
                            <div className="mx-auto mb-4 max-w-md">
                                <div className="mb-2 text-sm font-medium text-slate-700">
                                    Kelembaban berlebih, perhatikan drainase! (Target: 30-60%)
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${sensorData.moisture}%` }}
                                    ></div>
                                    {/* Target Range Indicators */}
                                    <div className="absolute top-0 left-[30%] h-full w-0.5 bg-yellow-500"></div>
                                    <div className="absolute top-0 left-[60%] h-full w-0.5 bg-yellow-500"></div>
                                </div>
                                <div className="mt-1 flex justify-between text-xs text-slate-500">
                                    <span>0%</span>
                                    <span className="flex items-center gap-1">
                                        <span>30%</span>
                                        <span className="text-yellow-600">|</span>
                                        <span>60%</span>
                                    </span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Sensor Cards - MODIFIED: Removed Temperature Card */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Moisture Card */}
                        <div
                            className={`group cursor-pointer rounded-2xl border-2 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                cardHovered === 'moisture' ? 'scale-105 border-blue-300' : 'border-blue-200'
                            }`}
                            onMouseEnter={() => setCardHovered('moisture')}
                            onMouseLeave={() => setCardHovered(null)}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    <Droplets className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-blue-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">Live</span>
                                </div>
                            </div>
                            <div className="mb-2 text-4xl font-bold text-blue-700">{sensorData.moisture}%</div>
                            <p className="text-lg font-semibold text-blue-600">Kelembapan Tanah</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${currentMoistureStatus.bg} ${currentMoistureStatus.color} ring-1 ${currentMoistureStatus.border}`}
                                >
                                    {currentMoistureStatus.status}
                                </span>
                                <ChevronRight className="h-4 w-4 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        </div>

                        {/* pH Card */}
                        <div
                            className={`group cursor-pointer rounded-2xl border-2 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                cardHovered === 'ph' ? 'scale-105 border-green-300' : 'border-green-200'
                            }`}
                            onMouseEnter={() => setCardHovered('ph')}
                            onMouseLeave={() => setCardHovered(null)}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    <Leaf className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex items-center gap-1 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">Optimal</span>
                                </div>
                            </div>
                            <div className="mb-2 text-4xl font-bold text-green-700">{sensorData.ph}</div>
                            <p className="text-lg font-semibold text-green-600">pH Tanah</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                                    Netral
                                </span>
                                <ChevronRight className="h-4 w-4 text-green-400 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        </div>
                    </div>

                    {/* MODIFIED: Weekly Performance (was Seasonal Performance) */}
                    <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200/50">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-slate-900">Performa Setiap Minggu (1 Bulan)</h3>
                            <button
                                onClick={() => setShowDetailedAnalytics(!showDetailedAnalytics)}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                            >
                                <BarChart3 className="h-4 w-4" />
                                Lihat Detail
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Week 1 */}
                            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                                        <Sun className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-emerald-700">🌱 Minggu ke-1</h4>
                                        <p className="text-sm text-emerald-600">Data performa minggu pertama</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-emerald-600">Kelembapan Rata-rata</span>
                                        <span className="font-bold text-emerald-700">45.2%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-600">Efisiensi Solar</span>
                                        <span className="font-bold text-emerald-700">85%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-600">Frekuensi Irigasi</span>
                                        <span className="font-bold text-emerald-700">2.3x/hari</span>
                                    </div>
                                </div>
                            </div>

                            {/* Week 2 */}
                            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                                        <CloudRain className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-blue-700">🌿 Minggu ke-2</h4>
                                        <p className="text-sm text-blue-600">Data performa minggu kedua</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Kelembapan Rata-rata</span>
                                        <span className="font-bold text-blue-700">68.7%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Efisiensi Solar</span>
                                        <span className="font-bold text-blue-700">65%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Frekuensi Irigasi</span>
                                        <span className="font-bold text-blue-700">0.8x/hari</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Week 3 */}
                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                                        <Sprout className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-purple-700">🌸 Minggu ke-3</h4>
                                        <p className="text-sm text-purple-600">Data performa minggu ketiga</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-purple-600">Kelembapan Rata-rata</span>
                                        <span className="font-bold text-purple-700">52.3%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-purple-600">Efisiensi Solar</span>
                                        <span className="font-bold text-purple-700">78%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-purple-600">Frekuensi Irigasi</span>
                                        <span className="font-bold text-purple-700">1.5x/hari</span>
                                    </div>
                                </div>
                            </div>

                            {/* Week 4 */}
                            <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-yellow-700">🌻 Minggu ke-4</h4>
                                        <p className="text-sm text-yellow-600">Data performa minggu keempat</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-yellow-600">Kelembapan Rata-rata</span>
                                        <span className="font-bold text-yellow-700">48.9%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-yellow-600">Efisiensi Solar</span>
                                        <span className="font-bold text-yellow-700">92%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-yellow-600">Frekuensi Irigasi</span>
                                        <span className="font-bold text-yellow-700">1.8x/hari</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Plant Type Selection */}
                    <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200/50">
                        <div className="mb-6 flex items-center gap-3">
                            <Lightbulb className="h-8 w-8 flex-shrink-0 animate-bounce text-yellow-500" />
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Mau Tanam Lagi? 🌱</h3>
                                <p className="text-slate-600">Wow kamu semangat banget, mau tanam dimana?</p>
                            </div>
                        </div>

                        {/* Primary Plant Types (Main Focus) */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {primaryPlants.map((plant) => {
                                const Icon = plant.icon;
                                const isSelected = selectedPlant === plant.id;
                                return (
                                    <button
                                        key={plant.id}
                                        onClick={() => setSelectedPlant(plant.id)}
                                        className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                                            isSelected
                                                ? 'scale-105 border-green-300 ring-4 ring-green-100'
                                                : 'border-slate-200 hover:border-green-200'
                                        } ${plant.bgGradient}`}
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <div
                                                className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                                                    isSelected ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-white'
                                                }`}
                                            >
                                                <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : plant.color}`} />
                                            </div>
                                            {isSelected && <CheckCircle className="h-6 w-6 animate-bounce text-green-500" />}
                                        </div>
                                        <h4 className="mb-2 text-xl font-bold text-slate-800">{plant.name}</h4>
                                        <p className="mb-3 text-sm text-slate-600">{plant.description}</p>
                                        <div className="flex items-center justify-end">
                                            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-green-600 shadow-sm">
                                                POPULER ⭐
                                            </span>
                                        </div>

                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Secondary Plant Types (Smaller, Additional Feature) */}
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="mb-4 text-sm font-semibold tracking-wider text-slate-600 uppercase">Fitur Tambahan</h4>
                            <div className="grid grid-cols-1">
                                {secondaryPlants.map((plant) => {
                                    const Icon = plant.icon;
                                    const isSelected = selectedPlant === plant.id;
                                    return (
                                        <button
                                            key={plant.id}
                                            onClick={() => setSelectedPlant(plant.id)}
                                            className={`group flex items-center rounded-xl border bg-gradient-to-r p-4 text-left transition-all duration-200 hover:scale-102 hover:shadow-md ${
                                                isSelected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'
                                            } ${plant.bgGradient}`}
                                        >
                                            <div
                                                className={`mr-4 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                                                    isSelected ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-white'
                                                }`}
                                            >
                                                <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : plant.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-bold text-slate-800">{plant.name}</h5>
                                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">MODERN</span>
                                                </div>
                                                <p className="text-xs text-slate-600">{plant.description}</p>
                                            </div>
                                            <div className="text-right">
                                                {isSelected && <CheckCircle className="ml-auto h-4 w-4 text-blue-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced NPK Section */}
                    <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200/50">
                        <h3 className="mb-6 text-2xl font-bold text-slate-900">Nutrisi Tanah (NPK)</h3>
                        <div className="space-y-6">
                            {/* Nitrogen */}
                            <div className="group">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg">
                                            <span className="text-sm font-bold text-white">N</span>
                                        </div>
                                        <span className="text-lg font-semibold text-slate-800">Nitrogen (N)</span>
                                    </div>
                                    <span className="text-3xl font-bold text-purple-600">{sensorData.npk.nitrogen}%</span>
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-purple-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${sensorData.npk.nitrogen}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Phosphorus */}
                            <div className="group">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                                            <span className="text-sm font-bold text-white">P</span>
                                        </div>
                                        <span className="text-lg font-semibold text-slate-800">Phosphorus (P)</span>
                                    </div>
                                    <span className="text-3xl font-bold text-pink-600">{sensorData.npk.phosphorus}%</span>
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-pink-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${sensorData.npk.phosphorus}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Potassium */}
                            <div className="group">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                                            <span className="text-sm font-bold text-white">K</span>
                                        </div>
                                        <span className="text-lg font-semibold text-slate-800">Potassium (K)</span>
                                    </div>
                                    <span className="text-3xl font-bold text-blue-600">{sensorData.npk.potassium}%</span>
                                </div>
                                <div className="relative h-3 overflow-hidden rounded-full bg-blue-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${sensorData.npk.potassium}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* NPK Analysis */}
                        <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                            <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                                <Target className="h-5 w-5" />
                                Analisis Nutrisi
                            </h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{sensorData.npk.nitrogen}%</div>
                                    <div className="text-sm text-slate-600">Nitrogen cukup baik</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-pink-600">{sensorData.npk.phosphorus}%</div>
                                    <div className="text-sm text-slate-600">Phosphorus optimal</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{sensorData.npk.potassium}%</div>
                                    <div className="text-sm text-slate-600">Potassium sangat baik</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - MODIFIED: Removed Settings and Alert buttons */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <button className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg transition-transform group-hover:scale-110">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">Lihat Laporan</div>
                                <div className="text-xs text-slate-500">Data lengkap</div>
                            </div>
                        </button>

                        <button className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg transition-transform group-hover:scale-110">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">Tips & Saran</div>
                                <div className="text-xs text-slate-500">AI Recommendation</div>
                            </div>
                        </button>
                    </div>
                </main>
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

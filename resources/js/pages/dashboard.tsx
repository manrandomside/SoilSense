import { Head, Link } from '@inertiajs/react';
import { Bell, ChevronRight, Droplets, Leaf, Settings, Sprout, Thermometer, TreePine, TrendingUp, User, Wheat } from 'lucide-react';
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

interface HomeProps {
    user: {
        name: string;
        avatar?: string;
    };
    sensorData: SensorData;
}

const SoilSenseHome: React.FC<HomeProps> = ({ user, sensorData }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPlantType, setSelectedPlantType] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fungsi untuk menentukan status kelembapan
    const getMoistureStatus = (moisture: number) => {
        if (moisture < 30)
            return {
                status: 'Kering',
                message: 'Tanaman membutuhkan air segera!',
                color: 'text-red-600',
                bgColor: 'bg-red-100',
            };
        if (moisture < 50)
            return {
                status: 'Sedang Haus',
                message: 'Hmm, sepertinya baru haus, lihat kondisi tanaman kamu dulu!',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
            };
        if (moisture < 70)
            return {
                status: 'Cukup Baik',
                message: 'Kondisi tanah cukup lembap, tanaman senang!',
                color: 'text-green-600',
                bgColor: 'bg-green-100',
            };
        return {
            status: 'Sangat Baik',
            message: 'Perfect! Tanaman dalam kondisi optimal!',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        };
    };

    // Fungsi untuk menentukan warna progress bar
    const getMoistureBarColor = (moisture: number) => {
        if (moisture < 30) return 'bg-gradient-to-r from-red-500 to-red-400';
        if (moisture < 50) return 'bg-gradient-to-r from-yellow-500 to-orange-400';
        if (moisture < 70) return 'bg-gradient-to-r from-green-500 to-green-400';
        return 'bg-gradient-to-r from-blue-500 to-green-400';
    };

    const moistureStatus = getMoistureStatus(sensorData.moisture);

    const plantTypes = [
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
                                <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600">
                                    <Bell className="h-5 w-5" />
                                </button>
                                <button className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600">
                                    <Settings className="h-5 w-5" />
                                </button>
                                <div className="flex items-center space-x-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
                        <p className="text-gray-600">Pantau kondisi tanah Anda secara real-time • {currentTime.toLocaleTimeString('id-ID')}</p>
                    </div>

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

                            <p className="mx-auto max-w-md text-lg text-gray-600">{moistureStatus.message}</p>

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
            </div>
        </>
    );
};

export default SoilSenseHome;

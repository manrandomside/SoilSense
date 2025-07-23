import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowRight, BarChart3, Droplets, Leaf, Smartphone, Sprout, Target, User, Wheat, Wifi } from 'lucide-react';
import React, { useState } from 'react';

interface HomepageProps {
    // Optional user jika sudah login
    user?: {
        name: string;
        email?: string;
        avatar?: string;
        plant_preference?: string;
        profile_completed?: boolean;
    };
}

interface FeatureItem {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: string;
    requireAuth: boolean;
}

interface PlantType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    color: string;
}

export default function Homepage({ user }: HomepageProps) {
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

    // Demo data untuk showcase
    const demoSensorData = {
        moisture: 63,
        ph: 6.8,
        temperature: 28.5,
        npk: {
            nitrogen: 45,
            phosphorus: 32,
            potassium: 78,
        },
    };

    const features: FeatureItem[] = [
        {
            id: 'monitoring',
            icon: Activity,
            title: 'Real-time Monitoring',
            description: 'Monitor kondisi tanah 24/7 dengan sensor IoT canggih',
            color: 'from-blue-500 to-cyan-500',
            requireAuth: true,
        },
        {
            id: 'analytics',
            icon: BarChart3,
            title: 'Analisis Mendalam',
            description: 'Laporan dan grafik analisis kondisi tanah lengkap',
            color: 'from-green-500 to-emerald-500',
            requireAuth: true,
        },
        {
            id: 'recommendations',
            icon: Target,
            title: 'Rekomendasi Cerdas',
            description: 'Saran perawatan tanaman berdasarkan data sensor',
            color: 'from-purple-500 to-pink-500',
            requireAuth: true,
        },
        {
            id: 'profile',
            icon: User,
            title: 'Profil Pengguna',
            description: 'Kelola data diri dan preferensi tanaman',
            color: 'from-indigo-500 to-blue-500',
            requireAuth: true,
        },
    ];

    const plantTypes: PlantType[] = [
        {
            id: 'sawah',
            name: 'Tanaman Sawah',
            icon: Wheat,
            description: 'Optimal untuk padi dan tanaman air',
            color: 'from-green-400 to-emerald-500',
        },
        {
            id: 'lahan-kering',
            name: 'Lahan Kering',
            icon: Sprout,
            description: 'Cocok untuk jagung, kacang, dan sayuran',
            color: 'from-amber-400 to-orange-500',
        },
        {
            id: 'hidroponik',
            name: 'Hidroponik',
            icon: Droplets,
            description: 'Sistem tanpa tanah modern',
            color: 'from-blue-400 to-cyan-500',
        },
    ];

    const handleFeatureClick = (feature: FeatureItem) => {
        if (feature.requireAuth && !user) {
            setSelectedFeature(feature.title);
            setShowLoginPrompt(true);
        } else {
            // Navigate to feature
            if (feature.id === 'monitoring' || feature.id === 'analytics') {
                window.location.href = '/dashboard';
            } else if (feature.id === 'profile') {
                window.location.href = '/profile';
            } else if (feature.id === 'settings') {
                window.location.href = '/settings';
            }
        }
    };

    const LoginPromptModal = () =>
        showLoginPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                            <Smartphone className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">Akses Fitur {selectedFeature}</h3>
                        <p className="mb-6 text-gray-600">
                            Untuk menggunakan fitur ini, Anda perlu login dengan barcode yang didapat setelah pembelian produk SoilSense.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                            <Link
                                href="/login"
                                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-center font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
                            >
                                Login Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );

    return (
        <>
            <Head title="SoilSense - Smart Agriculture Monitoring" />
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
                <div className="absolute top-40 right-20 h-32 w-32 animate-pulse rounded-full bg-emerald-200/20 blur-2xl delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 h-24 w-24 animate-pulse rounded-full bg-cyan-200/25 blur-xl delay-2000"></div>

                {/* Header - UPDATED CONSISTENT NAVBAR */}
                <header className="sticky top-0 z-40 border-b border-emerald-200/30 bg-white/90 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Consistent Logo - Same as Dashboard */}
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg ring-2 ring-green-200">
                                        <Leaf className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-bold text-transparent">
                                        SoilSense
                                    </h1>
                                    <p className="text-xs text-slate-500">Smart Agriculture System</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center gap-4">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-700">Halo, {user.name}</span>
                                        <Link
                                            href="/dashboard"
                                            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
                                        >
                                            Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
                                    >
                                        Login dengan Barcode
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main>
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                                Smart Agriculture
                                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Monitoring System
                                </span>
                            </h1>
                            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                                Monitor kondisi tanah secara real-time dengan teknologi IoT canggih. Dapatkan rekomendasi cerdas untuk hasil panen
                                yang optimal.
                            </p>

                            {!user && (
                                <div className="mb-12">
                                    <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                                        <h3 className="mb-2 text-xl font-bold">Harga Spesial: Rp 600.000</h3>
                                        <p className="mb-4">Dapatkan 1 unit SoilSense lengkap dengan sensor IoT dan akses aplikasi selamanya</p>
                                        <div className="text-sm opacity-90">* Setelah pembelian, Anda akan mendapat barcode untuk login</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Demo Sensor Data - MODIFIED SECTION */}
                        <div className="mb-12 rounded-2xl border border-emerald-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Preview Data Monitoring</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {/* Card 1: Kelembaban Tanah - Modified */}
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                        <Droplets className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="mb-1 text-lg font-bold text-blue-600">Dapat mengukur</div>
                                    <div className="text-sm text-gray-600">kelembapan tanah dengan akurat</div>
                                    <div className="mt-1 text-xs text-gray-500">Real-time monitoring</div>
                                </div>

                                {/* Card 2: pH Tanah - Modified */}
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
                                        <Activity className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="mb-1 text-lg font-bold text-green-600">Menganalisis</div>
                                    <div className="text-sm text-gray-600">tingkat keasaman tanah</div>
                                    <div className="mt-1 text-xs text-gray-500">pH monitoring</div>
                                </div>

                                {/* Card 3: NPK - Modified */}
                                <div className="text-center">
                                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                                        <Leaf className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="mb-1 text-lg font-bold text-purple-600">Mengukur nutrisi</div>
                                    <div className="text-sm text-gray-600">nitrogen, fosfor & kalium</div>
                                    <div className="mt-1 text-xs text-gray-500">NPK sensor</div>
                                </div>

                                {/* Card Suhu Tanah telah dihapus */}
                            </div>
                        </div>

                        {/* Fitur-fitur */}
                        <div className="mb-12">
                            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Fitur Unggulan</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <div
                                        key={feature.id}
                                        onClick={() => handleFeatureClick(feature)}
                                        className="group cursor-pointer rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                    >
                                        <div
                                            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-110`}
                                        >
                                            <feature.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                                        <p className="mb-4 text-gray-600">{feature.description}</p>
                                        <div className="flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
                                            {feature.requireAuth && !user ? 'Login untuk akses' : 'Jelajahi fitur'}
                                            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Jenis Tanaman */}
                        <div className="mb-12">
                            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Jenis Tanaman yang Didukung</h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {plantTypes.map((plant) => (
                                    <div
                                        key={plant.id}
                                        className="group cursor-pointer rounded-2xl border border-white/20 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                    >
                                        <div
                                            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${plant.color} shadow-lg transition-transform group-hover:scale-110`}
                                        >
                                            <plant.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">{plant.name}</h3>
                                        <p className="text-gray-600">{plant.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Section */}
                        {!user && (
                            <div className="text-center">
                                <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
                                    <h2 className="mb-4 text-3xl font-bold">Mulai Monitoring Sekarang!</h2>
                                    <p className="mb-6 text-lg opacity-90">
                                        Dapatkan SoilSense dan rasakan kemudahan monitoring tanah dengan teknologi IoT
                                    </p>
                                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Wifi className="h-5 w-5" />
                                            <span>Koneksi IoT Stabil</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Smartphone className="h-5 w-5" />
                                            <span>Aplikasi User-Friendly</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Target className="h-5 w-5" />
                                            <span>Rekomendasi Akurat</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Login Prompt Modal */}
                <LoginPromptModal />
            </div>
        </>
    );
}

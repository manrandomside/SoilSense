import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Droplets, Eye, EyeOff, Lock, Shield, Sprout, User, Wheat } from 'lucide-react';
import React, { useState } from 'react';

// ===============================================
// KOMPONEN PROFILE SETUP - UPDATED WITH PASSWORD
// ===============================================

interface ProfileSetupProps {
    errors?: Record<string, string>;
}

export default function ProfileSetup({ errors = {} }: ProfileSetupProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing } = useForm({
        name: '',
        phone: '',
        email: '',
        plant_preference: '', // 'sawah', 'lahan-kering', 'hidroponik'
        password: '', // BARU
        password_confirmation: '', // BARU
    });

    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const plantOptions = [
        {
            id: 'sawah',
            name: 'Tanaman Sawah',
            description: 'Optimal untuk padi dan tanaman air',
            icon: Wheat,
            color: 'from-green-400 to-emerald-500',
            features: ['Monitor kelembaban tinggi', 'pH optimal 5.5-7.0', 'Sistem drainase otomatis'],
        },
        {
            id: 'lahan-kering',
            name: 'Lahan Kering',
            description: 'Cocok untuk jagung, kacang, dan sayuran',
            icon: Sprout,
            color: 'from-amber-400 to-orange-500',
            features: ['Kelembaban sedang', 'pH fleksibel 6.0-7.5', 'Irigasi efisien'],
        },
        {
            id: 'hidroponik',
            name: 'Hidroponik',
            description: 'Sistem tanpa tanah modern',
            icon: Droplets,
            color: 'from-blue-400 to-cyan-500',
            features: ['Kontrol nutrisi presisi', 'pH ketat 5.5-6.5', 'Sirkulasi optimal'],
        },
    ];

    const checkEmailAvailability = async (email: string) => {
        if (!email || !email.includes('@')) return;

        setCheckingEmail(true);
        try {
            const response = await fetch('/api/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email }),
            });
            const result = await response.json();
            setEmailAvailable(result.available);
        } catch (error) {
            console.error('Error checking email:', error);
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        checkEmailAvailability(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile-setup');
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1); // UPDATE: 3 steps sekarang
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // BARU: Password validation helpers
    const passwordRequirements = [
        { met: data.password.length >= 8, text: 'Minimal 8 karakter' },
        { met: data.password === data.password_confirmation && data.password.length > 0, text: 'Konfirmasi password sama' },
    ];

    return (
        <>
            <Head title="Setup Profil - SoilSense" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 px-4 py-12">
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

                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Setup Profil SoilSense</h1>
                        <p className="mt-2 text-gray-600">Lengkapi profil Anda untuk mendapatkan rekomendasi yang tepat</p>
                    </div>

                    {/* Progress Indicator - UPDATED: 3 steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    1
                                </div>
                                <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    2
                                </div>
                                <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    3
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto mt-2 flex max-w-48 justify-between">
                            <span className="text-xs text-gray-600">Data Diri</span>
                            <span className="text-xs text-gray-600">Keamanan</span>
                            <span className="text-xs text-gray-600">Preferensi</span>
                        </div>
                    </div>

                    {/* Global Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-red-900">Perlu diperbaiki:</h4>
                                    {Object.entries(errors).map(([key, message]) => (
                                        <p key={key} className="text-sm text-red-600">
                                            • {message}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Data Diri */}
                        {currentStep === 1 && (
                            <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Data Diri</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Nomor Telepon *</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Email *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            onBlur={handleEmailBlur}
                                            placeholder="email@contoh.com"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            required
                                        />
                                        {checkingEmail && (
                                            <div className="mt-2 flex items-center gap-2 text-blue-600">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="text-sm">Memeriksa ketersediaan email...</span>
                                            </div>
                                        )}
                                        {emailAvailable === false && (
                                            <div className="mt-2 flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">Email sudah digunakan oleh pengguna lain</span>
                                            </div>
                                        )}
                                        {emailAvailable === true && (
                                            <div className="mt-2 flex items-center gap-2 text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-sm">Email tersedia</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!data.name || !data.phone || !data.email || emailAvailable === false}
                                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Lanjutkan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Password Setup - BARU */}
                        {currentStep === 2 && (
                            <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                                <div className="mb-6 flex items-center space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                                        <Lock className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
                                        <p className="text-sm text-gray-600">Buat password untuk login selanjutnya</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Password Field */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Minimal 8 karakter"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Confirmation Field */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Konfirmasi Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Ulangi password"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h4 className="mb-3 text-sm font-medium text-gray-900">Password harus memenuhi:</h4>
                                        <div className="space-y-2">
                                            {passwordRequirements.map((req, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center space-x-2 ${req.met ? 'text-green-600' : 'text-gray-500'}`}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm">{req.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="rounded-xl bg-blue-50 p-4">
                                        <div className="flex items-start space-x-3">
                                            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                                            <div className="text-left">
                                                <h4 className="text-sm font-medium text-blue-900">Penting!</h4>
                                                <p className="mt-1 text-xs text-blue-700">
                                                    Setelah profil dilengkapi, Anda dapat login kembali menggunakan email dan password yang telah
                                                    dibuat.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!data.password || data.password.length < 8 || data.password !== data.password_confirmation}
                                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Lanjutkan
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Preferensi Tanaman - UPDATED: sekarang step 3 */}
                        {currentStep === 3 && (
                            <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                                <h2 className="mb-6 text-xl font-bold text-gray-900">Pilih Jenis Tanaman</h2>

                                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {plantOptions.map((plant) => (
                                        <div
                                            key={plant.id}
                                            onClick={() => setData('plant_preference', plant.id)}
                                            className={`cursor-pointer rounded-2xl border-2 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl ${
                                                data.plant_preference === plant.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 bg-white hover:border-green-300'
                                            }`}
                                        >
                                            <div
                                                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${plant.color} shadow-lg`}
                                            >
                                                <plant.icon className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-gray-900">{plant.name}</h3>
                                            <p className="mb-4 text-gray-600">{plant.description}</p>
                                            <div className="text-left">
                                                {plant.features.map((feature, index) => (
                                                    <div key={index} className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Kembali
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.plant_preference}
                                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Selesai Setup'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}

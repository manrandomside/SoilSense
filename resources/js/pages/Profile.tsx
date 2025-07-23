// File: resources/js/pages/Profile.tsx
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Camera, Check, Droplets, Edit, Leaf, Mail, Phone, Save, Sprout, User, Wheat, X } from 'lucide-react';
import React, { useState } from 'react';

interface ProfileProps {
    user: {
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
        plant_preference?: string;
        profile_completed: boolean;
        barcode?: string;
        first_login_at?: string;
    };
    errors?: Record<string, string>;
}

export default function Profile({ user, errors = {} }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        plant_preference: user.plant_preference || '',
        avatar: null as File | null,
    });

    const plantOptions = [
        {
            id: 'sawah',
            name: 'Tanaman Sawah',
            description: 'Optimal untuk padi dan tanaman air',
            icon: Wheat,
            color: 'from-green-400 to-emerald-500',
        },
        {
            id: 'lahan-kering',
            name: 'Lahan Kering',
            description: 'Cocok untuk jagung, kacang, dan sayuran',
            icon: Sprout,
            color: 'from-amber-400 to-orange-500',
        },
        {
            id: 'hidroponik',
            name: 'Hidroponik',
            description: 'Sistem tanpa tanah modern',
            icon: Droplets,
            color: 'from-blue-400 to-cyan-500',
        },
    ];

    const getPlantInfo = (preference: string) => {
        return plantOptions.find((plant) => plant.id === preference) || plantOptions[1];
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('avatar', file);

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/update', {
            onSuccess: () => {
                setIsEditing(false);
                setAvatarPreview(null);
            },
        });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setAvatarPreview(null);
        setData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            plant_preference: user.plant_preference || '',
            avatar: null,
        });
    };

    const currentPlant = getPlantInfo(user.plant_preference || 'lahan-kering');

    return (
        <>
            <Head title="Profile - SoilSense" />
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

                {/* Header - UPDATED CONSISTENT NAVBAR */}
                <header className="relative z-10 bg-white/80 shadow-sm backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Consistent Logo - Same as Dashboard */}
                                <Link href="/" className="flex items-center space-x-3">
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
                                </Link>
                                <span className="text-sm text-gray-500">Profile</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 rounded-xl px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Kembali ke Dashboard</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        {/* Profile Header */}
                        <div className="rounded-3xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white transition-all hover:from-green-600 hover:to-emerald-600"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit Profil</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="flex items-center space-x-2 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Batal</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!isEditing ? (
                                // View Mode
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    {/* Avatar Section */}
                                    <div className="text-center">
                                        <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                            {user.avatar || avatarPreview ? (
                                                <img src={avatarPreview || user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <User className="h-16 w-16 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                        <p className="text-gray-600">Member SoilSense</p>
                                    </div>

                                    {/* Info Section */}
                                    <div className="space-y-6 md:col-span-2">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="flex items-center space-x-3 rounded-xl bg-gray-50 p-4">
                                                <Mail className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Email</p>
                                                    <p className="text-gray-900">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 rounded-xl bg-gray-50 p-4">
                                                <Phone className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Telepon</p>
                                                    <p className="text-gray-900">{user.phone || 'Belum diisi'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plant Preference */}
                                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
                                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Preferensi Tanaman</h3>
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${currentPlant.color} shadow-md`}
                                                >
                                                    <currentPlant.icon className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{currentPlant.name}</p>
                                                    <p className="text-sm text-gray-600">{currentPlant.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                        {/* Avatar Edit */}
                                        <div className="text-center">
                                            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                                {user.avatar || avatarPreview ? (
                                                    <img src={avatarPreview || user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <User className="h-16 w-16 text-white" />
                                                    </div>
                                                )}
                                                <label className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110">
                                                    <Camera className="h-4 w-4 text-gray-600" />
                                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-6 md:col-span-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                                    required
                                                />
                                                {errors.name && (
                                                    <div className="mt-2 flex items-center gap-2 text-red-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-sm">{errors.name}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                                                    <input
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <div className="mt-2 flex items-center gap-2 text-red-600">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span className="text-sm">{errors.email}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Telepon</label>
                                                    <input
                                                        type="tel"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        placeholder="08xxxxxxxxxx"
                                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                                    />
                                                    {errors.phone && (
                                                        <div className="mt-2 flex items-center gap-2 text-red-600">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span className="text-sm">{errors.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Plant Preference Selection */}
                                            <div>
                                                <label className="mb-4 block text-sm font-medium text-gray-700">Preferensi Tanaman</label>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                    {plantOptions.map((plant) => (
                                                        <div
                                                            key={plant.id}
                                                            onClick={() => setData('plant_preference', plant.id)}
                                                            className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                                                                data.plant_preference === plant.id
                                                                    ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20'
                                                                    : 'border-gray-200 bg-white hover:border-green-300'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plant.color} shadow-md`}
                                                            >
                                                                <plant.icon className="h-6 w-6 text-white" />
                                                            </div>
                                                            <h3 className="text-sm font-semibold text-gray-900">{plant.name}</h3>
                                                            <p className="text-xs text-gray-600">{plant.description}</p>
                                                            {data.plant_preference === plant.id && (
                                                                <Check className="mx-auto mt-2 h-4 w-4 text-green-600" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {errors.plant_preference && (
                                                    <div className="mt-2 flex items-center gap-2 text-red-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-sm">{errors.plant_preference}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Account Info */}
                            <div className="rounded-2xl border border-white/20 bg-white/90 p-6 shadow-xl backdrop-blur-xl">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Informasi Akun</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status Profil:</span>
                                        <span className="font-medium text-green-600">{user.profile_completed ? 'Lengkap' : 'Belum Lengkap'}</span>
                                    </div>
                                    {user.barcode && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Barcode:</span>
                                            <span className="font-mono text-sm text-gray-900">{user.barcode}</span>
                                        </div>
                                    )}
                                    {user.first_login_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bergabung:</span>
                                            <span className="text-gray-900">{new Date(user.first_login_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions - WITH LOGOUT BUTTON */}
                            <div className="rounded-2xl border border-white/20 bg-white/90 p-6 shadow-xl backdrop-blur-xl">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">Aksi Cepat</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center justify-between rounded-xl bg-green-50 p-3 transition-colors hover:bg-green-100"
                                    >
                                        <span className="text-green-700">Lihat Dashboard</span>
                                        <ArrowLeft className="h-4 w-4 rotate-180 text-green-600" />
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                    >
                                        <span className="text-gray-700">Pengaturan</span>
                                        <ArrowLeft className="h-4 w-4 rotate-180 text-gray-600" />
                                    </Link>
                                    <Link
                                        href="/analytics"
                                        className="flex items-center justify-between rounded-xl bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                                    >
                                        <span className="text-blue-700">Analitik</span>
                                        <ArrowLeft className="h-4 w-4 rotate-180 text-blue-600" />
                                    </Link>

                                    {/* LOGOUT BUTTON - NEW */}
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 transition-colors hover:border-red-300 hover:bg-red-100"
                                    >
                                        <span className="font-medium text-red-700">Logout</span>
                                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

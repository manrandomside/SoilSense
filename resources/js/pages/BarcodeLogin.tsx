import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Leaf, Mail, QrCode, Users } from 'lucide-react';
import React, { useState } from 'react';

interface LoginProps {
    errors?: Record<string, string>;
}

export default function BarcodeLogin({ errors = {} }: LoginProps) {
    const [showBarcode, setShowBarcode] = useState(false);
    const { data, setData, post, processing } = useForm({
        barcode: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login-barcode');
    };

    return (
        <>
            <Head title="Login dengan Barcode - SoilSense" />
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

                {/* Header - CONSISTENT NAVBAR */}
                <header className="relative z-10 bg-white/90 shadow-sm backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
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

                            {/* Navigation */}
                            <nav className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    Kembali ke Home
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                    <QrCode className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Login SoilSense</h1>
                                <p className="mt-2 text-gray-600">Masukkan barcode yang Anda dapatkan setelah pembelian produk</p>
                            </div>

                            {/* Error Messages */}
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                                        <div className="space-y-1">
                                            {Object.entries(errors).map(([key, message]) => (
                                                <p key={key} className="text-sm text-red-600">
                                                    {message}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Barcode Number</label>
                                    <div className="relative">
                                        <input
                                            type={showBarcode ? 'text' : 'password'}
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            placeholder="Masukkan 12 digit barcode"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-center font-mono text-lg tracking-widest text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            maxLength={12}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowBarcode(!showBarcode)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showBarcode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || data.barcode.length !== 12}
                                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Memverifikasi...' : 'Login'}
                                </button>
                            </form>

                            {/* Divider - BARU */}
                            <div className="my-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">atau</span>
                                    </div>
                                </div>
                            </div>

                            {/* Link to Email Login - FITUR BARU */}
                            <div className="space-y-4">
                                <Link
                                    href="/login-email"
                                    className="flex w-full items-center justify-center space-x-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 font-medium text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Sudah pernah login? Masuk dengan Email</span>
                                </Link>
                            </div>

                            {/* Help */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Belum punya barcode?{' '}
                                    <Link href="/" className="font-medium text-green-600 hover:text-green-700">
                                        Beli SoilSense sekarang
                                    </Link>
                                </p>
                            </div>

                            {/* Info Box - BARU */}
                            <div className="mt-6 rounded-xl bg-gray-50 p-4">
                                <div className="flex items-start space-x-3">
                                    <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                                    <div className="text-left">
                                        <h4 className="text-sm font-medium text-gray-900">Untuk User Baru</h4>
                                        <p className="mt-1 text-xs text-gray-600">
                                            Halaman ini untuk pendaftaran pertama kali. Setelah melengkapi profil, Anda dapat login menggunakan email
                                            dan password.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Back to Homepage */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-green-600"
                                >
                                    <Leaf className="h-4 w-4" />
                                    Kembali ke Homepage
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

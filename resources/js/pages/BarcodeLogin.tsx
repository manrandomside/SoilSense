import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Leaf, QrCode, Smartphone } from 'lucide-react';
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 px-4 py-12">
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

                <div className="relative w-full max-w-md">
                    <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                <QrCode className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Login SoilSense</h1>
                            <p className="mt-2 text-gray-600">Masukkan barcode yang Anda dapatkan setelah pembelian produk</p>
                        </div>

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
                                {errors.barcode && (
                                    <div className="mt-2 flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{errors.barcode}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.barcode.length !== 12}
                                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Memverifikasi...' : 'Login'}
                            </button>
                        </form>

                        {/* Help */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Belum punya barcode?{' '}
                                <a href="/" className="font-medium text-green-600 hover:text-green-700">
                                    Beli SoilSense sekarang
                                </a>
                            </p>
                        </div>

                        {/* Demo Info */}
                        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <Smartphone className="mt-0.5 h-5 w-5 text-blue-600" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Demo Mode</h4>
                                    <p className="mt-1 text-sm text-blue-700">
                                        Gunakan barcode: <span className="font-mono font-bold">123456789012</span> untuk testing
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Back to Homepage */}
                        <div className="mt-6 text-center">
                            <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-green-600">
                                <Leaf className="h-4 w-4" />
                                Kembali ke Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

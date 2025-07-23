import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Leaf, Mail, Shield } from 'lucide-react';
import React, { useState } from 'react';

interface EmailLoginProps {
    errors?: Record<string, string>;
}

export default function EmailLogin({ errors = {} }: EmailLoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login-email');
    };

    return (
        <>
            <Head title="Login dengan Email - SoilSense" />
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

                {/* Header */}
                <header className="relative z-10 bg-white/90 shadow-sm backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
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
                            {/* Back to Barcode Login */}
                            <div className="mb-6">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center space-x-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Kembali ke login barcode</span>
                                </Link>
                            </div>

                            {/* Header */}
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                    <Mail className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Masuk Kembali</h1>
                                <p className="mt-2 text-gray-600">Login dengan email dan password yang sudah Anda daftarkan</p>
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
                                {/* Email Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Masukkan email Anda"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Masukkan password Anda"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                            required
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

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                        Ingat saya
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Login'}
                                </button>
                            </form>

                            {/* Footer Info */}
                            <div className="mt-8 text-center">
                                <div className="rounded-xl bg-green-50 p-4">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                        <div className="text-left">
                                            <h4 className="text-sm font-medium text-green-900">Login untuk User Terdaftar</h4>
                                            <p className="mt-1 text-xs text-green-700">
                                                Halaman ini khusus untuk user yang sudah pernah melengkapi profil sebelumnya.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Link to Barcode Login */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Belum punya akun?{' '}
                                    <Link href="/login" className="font-medium text-green-600 transition-colors hover:text-green-700">
                                        Login dengan barcode
                                    </Link>
                                </p>
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

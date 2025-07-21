import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Droplets, Leaf, Thermometer } from 'lucide-react';
import React from 'react';

interface PlantingGuideProps {
    type: string;
}

const PlantingGuide: React.FC<PlantingGuideProps> = ({ type }) => {
    const getPlantInfo = (plantType: string) => {
        const plants = {
            sawah: {
                name: 'Sawah',
                description: 'Panduan menanam padi dan tanaman sereal lainnya',
                moisture: '60-80%',
                ph: '6.0-7.0',
                temp: '25-35°C',
                tips: [
                    'Pastikan lahan memiliki sistem irigasi yang baik',
                    'pH tanah ideal antara 6.0-7.0 untuk pertumbuhan optimal',
                    'Kelembapan tanah harus dijaga konsisten',
                    'Monitor suhu air dan tanah secara berkala',
                ],
            },
            'lahan-kering': {
                name: 'Lahan Kering',
                description: 'Panduan menanam sayuran dan buah-buahan',
                moisture: '40-60%',
                ph: '6.5-7.5',
                temp: '20-30°C',
                tips: [
                    'Sistem drainase yang baik untuk mencegah genangan',
                    'Mulsa organik membantu menjaga kelembapan',
                    'Rotasi tanaman untuk menjaga kesuburan tanah',
                    'Pemupukan berkala sesuai kebutuhan tanaman',
                ],
            },
            hidroponik: {
                name: 'Hidroponik',
                description: 'Sistem tanam modern tanpa tanah',
                moisture: '70-90%',
                ph: '5.5-6.5',
                temp: '18-25°C',
                tips: [
                    'Kontrol pH larutan nutrisi secara ketat',
                    'Pastikan sirkulasi oksigen dalam air',
                    'Monitor EC (electrical conductivity) larutan',
                    'Bersihkan sistem secara berkala',
                ],
            },
        };

        return plants[plantType as keyof typeof plants] || plants['lahan-kering'];
    };

    const plantInfo = getPlantInfo(type);

    return (
        <>
            <Head title={`Panduan ${plantInfo.name} - SoilSense`} />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
                {/* Header */}
                <header className="border-b border-green-200 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center">
                            <Link href="/dashboard" className="flex items-center text-green-600 hover:text-green-700">
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-green-100 bg-white p-8 shadow-lg">
                        <h1 className="mb-4 text-3xl font-bold text-gray-900">Panduan {plantInfo.name}</h1>
                        <p className="mb-8 text-gray-600">{plantInfo.description}</p>

                        {/* Kondisi Optimal */}
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-xl bg-blue-50 p-6 text-center">
                                <Droplets className="mx-auto mb-3 h-8 w-8 text-blue-500" />
                                <h3 className="mb-2 font-semibold text-blue-700">Kelembapan</h3>
                                <p className="text-2xl font-bold text-blue-600">{plantInfo.moisture}</p>
                            </div>
                            <div className="rounded-xl bg-green-50 p-6 text-center">
                                <Leaf className="mx-auto mb-3 h-8 w-8 text-green-500" />
                                <h3 className="mb-2 font-semibold text-green-700">pH Tanah</h3>
                                <p className="text-2xl font-bold text-green-600">{plantInfo.ph}</p>
                            </div>
                            <div className="rounded-xl bg-orange-50 p-6 text-center">
                                <Thermometer className="mx-auto mb-3 h-8 w-8 text-orange-500" />
                                <h3 className="mb-2 font-semibold text-orange-700">Suhu</h3>
                                <p className="text-2xl font-bold text-orange-600">{plantInfo.temp}</p>
                            </div>
                        </div>

                        {/* Tips */}
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-gray-900">Tips Penanaman</h2>
                            <div className="space-y-4">
                                {plantInfo.tips.map((tip, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                                            {index + 1}
                                        </div>
                                        <p className="flex-1 text-gray-700">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-8 text-center">
                            <Link
                                href="/dashboard"
                                className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-600"
                            >
                                Mulai Monitoring
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default PlantingGuide;

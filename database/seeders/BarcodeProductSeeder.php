<?php

namespace Database\Seeders;

use App\Models\BarcodeProduct;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarcodeProductSeeder extends Seeder
{
    /**
     * Run the database seeds untuk SoilSense barcode products.
     * 
     * Membuat 10 barcode murni untuk login system tanpa data demo
     */
    public function run()
    {
        // Clear existing barcode products untuk fresh start
        DB::table('barcode_products')->truncate();
        
        // Array berisi 10 barcode unik dengan format realistic
        $barcodes = [
            'SS2024000001',
            'SS2024000002',
            'SS2024000003', 
            'SS2024000004',
            'SS2024000005',
            'SS2024000006',
            'SS2024000007',
            'SS2024000008',
            'SS2024000009',
            'SS2024000010',
        ];

        // Insert barcode ke database
        foreach ($barcodes as $barcode) {
            BarcodeProduct::create([
                'barcode' => $barcode,
                'status' => 'available',
                'user_id' => null,
                'activated_at' => null,
                'expires_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Output informasi untuk developer
        $this->command->info('✅ SoilSense Barcode Products berhasil dibuat!');
        $this->command->info('📊 Total barcode: ' . count($barcodes));
        $this->command->line('');
        $this->command->info('🎯 Barcode yang tersedia:');
        $this->command->table(
            ['No', 'Barcode', 'Status'],
            collect($barcodes)->map(function ($barcode, $index) {
                return [
                    $index + 1,
                    $barcode,
                    'available'
                ];
            })->toArray()
        );
        
        $this->command->line('');
        $this->command->info('💡 Gunakan salah satu barcode di atas untuk login pertama kali');
        $this->command->info('   Setelah login, Anda akan diarahkan untuk mengisi profil lengkap');
        $this->command->line('');
    }
}
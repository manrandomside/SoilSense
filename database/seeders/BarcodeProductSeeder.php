<?php

namespace Database\Seeders;

use App\Models\BarcodeProduct;
use Illuminate\Database\Seeder;

class BarcodeProductSeeder extends Seeder
{
    public function run()
    {
        // Demo barcode untuk testing
        BarcodeProduct::create([
            'barcode' => '123456789012',
            'status' => 'available',
        ]);

        // Generate 10 barcode tambahan
        for ($i = 1; $i <= 10; $i++) {
            BarcodeProduct::create([
                'barcode' => sprintf('SS%010d', $i),
                'status' => 'available',
            ]);
        }
    }
}
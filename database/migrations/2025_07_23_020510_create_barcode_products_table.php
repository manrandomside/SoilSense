<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('barcode_products', function (Blueprint $table) {
            $table->id();
            $table->string('barcode', 12)->unique();
            $table->enum('status', ['available', 'used', 'expired'])->default('available');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('barcode_products');
    }
};
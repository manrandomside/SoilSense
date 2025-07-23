<?php

// ===============================================
// 1. MIGRATION - CREATE USERS TABLE (Enhanced)
// ===============================================

// File: database/migrations/xxxx_xx_xx_xxxxxx_enhance_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add barcode and profile fields
            $table->string('barcode', 12)->unique()->nullable()->after('email');
            $table->string('phone')->nullable()->after('barcode');
            $table->enum('plant_preference', ['sawah', 'lahan-kering', 'hidroponik'])->nullable()->after('phone');
            $table->boolean('profile_completed')->default(false)->after('plant_preference');
            $table->timestamp('first_login_at')->nullable()->after('profile_completed');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'phone', 'plant_preference', 'profile_completed', 'first_login_at']);
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('seasonal_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('season_mode', ['auto', 'manual_dry', 'manual_wet'])->default('auto');
            $table->enum('current_season', ['dry', 'wet'])->default('dry');
            
            // Threshold settings per season
            $table->json('dry_season_settings'); // {moisture_min, moisture_max, ph_min, ph_max, monitoring_interval}
            $table->json('wet_season_settings'); // Same structure
            
            $table->boolean('power_conservation_enabled')->default(false);
            $table->integer('monitoring_interval_dry')->default(30); // minutes
            $table->integer('monitoring_interval_wet')->default(60); // minutes
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('seasonal_settings');
    }
};
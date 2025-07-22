<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('seasonal_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Default Dry Season", "Tomato Wet Season"
            $table->enum('season_type', ['dry', 'wet']);
            $table->text('description')->nullable();
            
            // Preset threshold values
            $table->json('threshold_settings'); // {moisture_min, moisture_max, ph_min, ph_max, etc}
            
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('seasonal_presets');
    }
};
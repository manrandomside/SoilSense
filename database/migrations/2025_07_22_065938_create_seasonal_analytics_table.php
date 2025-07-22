<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('seasonal_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('season', ['dry', 'wet']);
            $table->date('date');
            
            // Daily averages
            $table->decimal('avg_moisture', 5, 2);
            $table->decimal('avg_ph', 3, 1);
            $table->decimal('avg_temperature', 4, 1);
            
            // Performance metrics
            $table->decimal('solar_efficiency', 5, 2); // percentage
            $table->integer('irrigation_count')->default(0);
            $table->json('npk_avg'); // {nitrogen, phosphorus, potassium}
            
            $table->timestamps();
            
            $table->unique(['user_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('seasonal_analytics');
    }
};
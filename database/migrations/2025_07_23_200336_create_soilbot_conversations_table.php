<?php
// File: database/migrations/xxxx_xx_xx_xxxxxx_create_soilbot_conversations_table.php
// Run: php artisan make:migration create_soilbot_conversations_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('soilbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('conversation_id')->index();
            $table->text('message');
            $table->enum('sender', ['user', 'bot']);
            $table->enum('message_type', ['text', 'analysis', 'suggestion', 'error'])->default('text');
            $table->string('question_id')->nullable(); // For predefined questions
            $table->json('sensor_data')->nullable(); // Store sensor data context
            $table->json('metadata')->nullable(); // Additional context
            $table->string('user_ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->boolean('is_helpful')->nullable(); // User feedback
            $table->timestamps();

            // Indexes for performance
            $table->index(['conversation_id', 'created_at']);
            $table->index(['sender', 'created_at']);
            $table->index('question_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soilbot_conversations');
    }
};

// =====================================================
// OPTIONAL: Feedback and Analytics Tables
// =====================================================

// File: database/migrations/xxxx_xx_xx_xxxxxx_create_soilbot_analytics_table.php
// Run: php artisan make:migration create_soilbot_analytics_table

/*
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soilbot_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('total_conversations')->default(0);
            $table->integer('total_messages')->default(0);
            $table->integer('unique_users')->default(0);
            $table->json('popular_questions')->nullable(); // Top asked questions
            $table->json('sensor_data_usage')->nullable(); // How often sensor data is used
            $table->decimal('average_session_duration', 8, 2)->nullable(); // In minutes
            $table->json('user_satisfaction')->nullable(); // Feedback scores
            $table->timestamps();

            $table->unique('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soilbot_analytics');
    }
};
*/

// =====================================================
// SEEDERS FOR PREDEFINED RESPONSES
// =====================================================

// File: database/seeders/SoilBotResponsesSeeder.php
// Run: php artisan make:seeder SoilBotResponsesSeeder

/*
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SoilBotResponsesSeeder extends Seeder
{
    public function run(): void
    {
        $responses = [
            [
                'question_id' => 'npk-analysis',
                'template_name' => 'NPK Analysis',
                'response_template' => '📊 **Analisis NPK Real-time:**\n\n🔸 **Nitrogen (N): {nitrogen}%**\n{nitrogen_status}\n\n🔸 **Phosphorus (P): {phosphorus}%**\n{phosphorus_status}\n\n🔸 **Potassium (K): {potassium}%**\n{potassium_status}\n\n📈 **Skor Total: {total}%**\n{overall_recommendation}',
                'variables' => json_encode(['nitrogen', 'phosphorus', 'potassium', 'nitrogen_status', 'phosphorus_status', 'potassium_status', 'total', 'overall_recommendation']),
                'category' => 'nutrition',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'question_id' => 'moisture-level',
                'template_name' => 'Moisture Analysis',
                'response_template' => '💧 **Analisis Kelembaban Tanah:**\n\n🔸 **Kelembaban saat ini: {moisture}%**\n\n{moisture_status}\n\n💡 **{action_plan}**\n{recommendations}',
                'variables' => json_encode(['moisture', 'moisture_status', 'action_plan', 'recommendations']),
                'category' => 'irrigation',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            // Add more predefined responses...
        ];

        // You would need to create soilbot_response_templates table first
        // DB::table('soilbot_response_templates')->insert($responses);
    }
}
*/

// =====================================================
// ARTISAN COMMANDS
// =====================================================

/*
// File: app/Console/Commands/SoilBotAnalytics.php
// Run: php artisan make:command SoilBotAnalytics

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SoilBotAnalytics extends Command
{
    protected $signature = 'soilbot:analytics {--date=}';
    protected $description = 'Generate daily analytics for SoilBot usage';

    public function handle()
    {
        $date = $this->option('date') ?: now()->format('Y-m-d');
        
        $analytics = DB::table('soilbot_conversations')
            ->whereDate('created_at', $date)
            ->select([
                DB::raw('COUNT(DISTINCT conversation_id) as total_conversations'),
                DB::raw('COUNT(*) as total_messages'),
                DB::raw('COUNT(DISTINCT user_ip) as unique_users'),
            ])
            ->first();

        $popularQuestions = DB::table('soilbot_conversations')
            ->whereDate('created_at', $date)
            ->whereNotNull('question_id')
            ->select('question_id', DB::raw('COUNT(*) as count'))
            ->groupBy('question_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Store analytics
        DB::table('soilbot_analytics')->updateOrInsert(
            ['date' => $date],
            [
                'total_conversations' => $analytics->total_conversations ?? 0,
                'total_messages' => $analytics->total_messages ?? 0,
                'unique_users' => $analytics->unique_users ?? 0,
                'popular_questions' => json_encode($popularQuestions),
                'updated_at' => now()
            ]
        );

        $this->info("Analytics generated for {$date}");
        $this->info("Conversations: {$analytics->total_conversations}");
        $this->info("Messages: {$analytics->total_messages}");
        $this->info("Unique Users: {$analytics->unique_users}");
    }
}
*/
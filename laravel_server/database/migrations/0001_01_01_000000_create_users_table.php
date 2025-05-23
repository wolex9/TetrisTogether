<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Friendship;
use App\Models\Game;
use Illuminate\Support\Facades\DB;


return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('country_code', 2);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // ---

        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user1_id')->constrained(table: 'users');
            $table->foreignId('user2_id')->constrained(table: 'users');
            $table->timestamps();

            $table->unique(['user1_id', 'user2_id']);
        });

        DB::statement('ALTER TABLE friendships ADD CHECK (user1_id < user2_id)');

        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->ulid()->unique();
            $table->enum('mode', ['blitz', '40lines', 'quickplay', 'custom']);
            $table->timestamps();
        });

        Schema::create('moves', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Game::class);
            $table->foreignId('player_id')->constrained(table: 'users');
            $table->string('type', 32);
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Friendship::class);
            $table->foreignId('sender_id')->constrained(table: 'users');
            $table->text('message');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('moves');
        Schema::dropIfExists('games');
        Schema::dropIfExists('friendships');

        // ---

        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};

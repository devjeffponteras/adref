<?php

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
        Schema::create('biddings', function (Blueprint $table) {
            $table->id();

            // Core Relationships
            $table->foreignId('asset_id')
                ->constrained()
                ->noActionOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->noActionOnDelete();

            // Bidder Information
            $table->string('bidder_name')->nullable();
            $table->string('bidder_contact_number')->nullable();
            $table->string('bidder_classification')->nullable();
            $table->string('department')->nullable();
            $table->date('date_hired')->nullable();

            // Bidding Metrics
            $table->integer('bidding_cycle')->nullable();
            $table->decimal('bidding_price', 15, 2)->nullable();

            // Operational Fields
            $table->string('bid_status')->default('pending');
            $table->text('remarks')->nullable();
            $table->string('reference_number')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biddings');
    }
};

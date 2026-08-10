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
        Schema::create('temporary_asset_requests', function (Blueprint $table) {
            $table->id();
            
            // Tracking & Status
            $table->string('refno')->nullable()->index();
            $table->string('transid')->nullable()->index();
            $table->enum('status', ['pending', 'approved', 'on-going', 'rejected', 'hold'])->default('pending');
            $table->string('control_number')->nullable();
            
            // User Link
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Core Asset Information
            $table->string('accountable_personnel')->nullable();
            $table->string('model')->nullable();
            $table->string('brand_make')->nullable();
            $table->string('serial_plate_id_number')->nullable();
            $table->string('end_user_department')->nullable();
            $table->string('asset_classification_id')->nullable();
            $table->string('others_description')->nullable();
            $table->string('asset_location')->nullable();
            $table->text('description')->nullable();
            $table->text('reasons_for_disposal')->nullable();

            // JSON payloads for multi-file metadata & paths
            $table->json('assessment_reports')->nullable();
            $table->json('asset_photos')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temporary_asset_requests');
    }
};
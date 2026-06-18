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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            // Foreign key from users table
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('control_number');
            $table->string('accountable_personnel');
            $table->string('model')->nullable();
            $table->text('description')->nullable();
            $table->string('brand_make')->nullable();
            $table->string('serial_plate_id_number')->unique()->nullable(); // Unique if it acts as a primary identifier
            $table->string('end_user_department');

            // Dropdown & Additional Details
            $table->foreignId('asset_classification_id')
                ->constrained('asset_classifications')
                ->noActionOnDelete();

            $table->text('reasons_for_disposal')->nullable();
            $table->string('asset_location')->nullable();
            $table->string('status')->default('Pending');

            // File Upload Paths (Form Row 4)
            $table->string('assessment_report_path')->nullable(); // Stores the uploaded file path
            $table->string('asset_photo_path')->nullable();       // Stores the uploaded image path

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};

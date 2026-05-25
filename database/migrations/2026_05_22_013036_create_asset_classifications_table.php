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
        Schema::create('asset_classifications', function (Blueprint $table) {
            $table->id();

            $table->string('name')->unique(); // e.g., "IT Equipment", "Furniture", "Vehicles"
            $table->string('code')->unique()->nullable(); // e.g., "IT", "FUR", "VEH" (Optional, useful for asset tagging)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true); // Allows you to soft-disable options in your dropdown
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_classifications');
    }
};

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
        Schema::create('mepeo_information', function (Blueprint $table) {
            $table->id();

           $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('waste_classification_id')->nullable()->constrained('waste_classifications');
            $table->foreignId('waste_characteristic_id')->nullable()->constrained('waste_characteristics');
            $table->text('remarks')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mepeo_information');
    }
};

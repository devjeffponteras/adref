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
        Schema::create('mcd_information', function (Blueprint $table) {
            $table->id();

            $table->foreignId('asset_id')
                  ->constrained('assets')
                  ->cascadeOnDelete();

            $table->string('role')->nullable();
            $table->string('par_number')->nullable();
            $table->text('remarks')->nullable();

            $table->foreignId('approver_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            
            $table->enum('status', ['Approved', 'On-going', 'Pending', 'Rejected'])
                  ->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mcd_information');
    }
};

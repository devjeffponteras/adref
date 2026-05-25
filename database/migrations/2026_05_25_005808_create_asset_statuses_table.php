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
        Schema::create('asset_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')
                  ->constrained('assets')
                  ->cascadeOnDelete();
                  
            $table->integer('seq_no');
            
            $table->boolean('is_current')->default(false);
            
            $table->foreignId('approver_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            
            $table->enum('status', ['Approved', 'On-going', 'Pending', 'Rejected'])
                  ->default('Pending');
                  
            $table->dateTime('approval_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['asset_id', 'is_current']);
            $table->unique(['asset_id', 'seq_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_statuses');
    }
};

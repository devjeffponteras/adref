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
        Schema::create('asset_scraps', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users')->cascadeOnDelete();
            
            // JSON fields for arrays of file paths/data
            $table->json('img_proofs')->nullable();
            $table->text('img_proof_desc')->nullable();
            $table->json('doc_proofs')->nullable();
            $table->text('doc_proof_desc')->nullable();
            
            // Additional metadata
            $table->string('status')->default('pending');
            $table->text('others')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_scraps');
    }
};

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
        Schema::create('asset_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->onDelete('cascade');
            $table->integer('seq_no'); // 1, 2, 3, etc.
            $table->boolean('is_current')->default(false); // Flag for the active stage needing approval
            $table->foreignId('approver_id')->nullable()->constrained('users'); // Tracks who did the action
            $table->string('status')->default('Pending'); // e.g., 'Approved', 'On-going', 'Pending'
            $table->timestamp('approval_date')->nullable();
            $table->text('remarks')->nullable(); // Replaces note/comments
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_approvals');
    }
};

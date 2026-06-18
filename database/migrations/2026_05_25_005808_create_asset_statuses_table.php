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
                ->noActionOnDelete();

            $table->integer('seq_no');

            // $table->boolean('is_current')->default(false); // remove kay murag dili needed

            $table->foreignId('approver_id')
                ->nullable()
                ->constrained('users')
                ->noActionOnDelete();

            $table->enum('status', ['Approved', 'On-going', 'Pending', 'Rejected'])
                ->default('Pending');

            $table->dateTime('approval_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['asset_id']);
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

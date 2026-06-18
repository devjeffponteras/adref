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
        Schema::create('asset_biddings', function (Blueprint $table) {
            $table->id();
            // primary() or unique() ensures an asset can only be listed for bidding ONCE at a time.
            $table->foreignId('asset_id')
                ->unique()
                ->constrained('assets')
                ->noActionOnDelete();

            $table->string('status')->default('active');

            $table->timestamp('listed_at')->useCurrent();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_biddings');
    }
};

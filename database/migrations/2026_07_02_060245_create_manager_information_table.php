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
        Schema::create('manager_information', function (Blueprint $table) {
            $table->id();

            $table->foreignId('asset_id')
                ->constrained('assets')
                ->onDelete('cascade');
            
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('no action');
            
            $table->string('asset_direction');
            
            $table->text('manager_disposition')->nullable();
            
            $table->decimal('bidding_price', 15, 2)->default(0.00);
            
            $table->string('reviewed_by');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manager_information');
    }
};

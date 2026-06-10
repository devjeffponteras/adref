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
        Schema::table('assets', function (Blueprint $table) {
            // Using json type lets you store the array of strings cleanly
            $table->json('assessment_reports')->nullable()->after('asset_location');
            $table->json('asset_photos')->nullable()->after('assessment_reports');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['assessment_reports', 'asset_photos']);
        });
    }
};

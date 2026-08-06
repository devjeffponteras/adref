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
        Schema::table('mcd_information', function (Blueprint $table) {
            $table->text('manager_remarks')->nullable()->after('remarks');
            $table->boolean('manager_check')->default(false)->after('manager_remarks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mcd_information', function (Blueprint $table) {
            $table->dropColumn(['manager_remarks', 'manager_check']);
        });
    }
};
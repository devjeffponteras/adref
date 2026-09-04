<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_biddings', function (Blueprint $table) {
            $table->string('category')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('asset_biddings', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_disposals', function (Blueprint $table) {
            $table->dropForeign('asset_disposals_user_id_foreign');

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('no action');
        });
    }

    public function down(): void
    {
        Schema::table('asset_disposals', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('assets');
        });
    }
};

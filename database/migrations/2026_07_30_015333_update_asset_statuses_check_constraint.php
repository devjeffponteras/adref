<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE asset_statuses DROP CONSTRAINT CK__asset_sta__statu__4C6B5938;");

        DB::statement("
            ALTER TABLE asset_statuses 
            ADD CONSTRAINT CK_asset_statuses_status 
            CHECK (status IN ('Approved', 'On-going', 'Pending', 'Rejected', 'Returned'));
        ");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE asset_statuses DROP CONSTRAINT CK_asset_statuses_status;");

        DB::statement("
            ALTER TABLE asset_statuses 
            ADD CONSTRAINT CK__asset_sta__statu__4C6B5938 
            CHECK (status IN ('Approved', 'On-going', 'Pending', 'Rejected'));
        ");
    }
};

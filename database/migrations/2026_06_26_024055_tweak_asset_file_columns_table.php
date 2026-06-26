<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['assessment_reports_desc', 'asset_photos_desc']);
        });

        Schema::table('assets', function (Blueprint $table) {
            // Dropping and re-adding is the safest path for SQL Server to avoid conversion failures
            $table->dropColumn(['assessment_reports', 'asset_photos']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->text('assessment_reports')->nullable();
            $table->text('asset_photos')->nullable();
        });

        // This acts exactly like a native MySQL JSON column constraint
        DB::statement('ALTER TABLE assets ADD CONSTRAINT [CK_assets_assessment_reports_json] CHECK (ISJSON(assessment_reports) = 1)');
        DB::statement('ALTER TABLE assets ADD CONSTRAINT [CK_assets_asset_photos_json] CHECK (ISJSON(asset_photos) = 1)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropConstraintIfNameExists('CK_assets_assessment_reports_json');
            $table->dropConstraintIfNameExists('CK_assets_asset_photos_json');
            
            $table->string('assessment_reports_desc')->nullable();
            $table->string('asset_photos_desc')->nullable();
        });
    }
};

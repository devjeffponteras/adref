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
        Schema::create('forms', function (Blueprint $table) {
            $table->id();

            // The user who uploaded the file
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // The file path on your server storage
            $table->string('document_path');

            // original name add ta para diloi malibog
            $table->string('original_name')->nullable();

            // The reason or purpose for uploading the document
            $table->text('purpose');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};

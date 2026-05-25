<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetClassification extends Model
{
    use HasFactory;

    // Explicitly point to your exact table name
    protected $table = 'asset_classifications';

    // Mass assignable attributes
    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    /**
     * Get the assets belonging to this classification.
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'asset_classification_id');
    }
}
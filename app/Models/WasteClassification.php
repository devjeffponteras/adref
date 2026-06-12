<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WasteClassification extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'waste_classifications';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get all mepeo information evaluations linked to this waste classification.
     * * This allows you to do: $classification->mepeoEntries
     */
    public function mepeoEntries(): HasMany
    {
        return $this->hasMany(MepeoInformation::class, 'waste_classification_id');
    }
}

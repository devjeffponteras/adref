<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WasteCharacteristic extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'waste_characteristics';

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
     * Get all mepeo information evaluations logged with this waste characteristic.
     * This allows you to run: $characteristic->mepeoEntries
     *
     * @return HasMany
     */
    public function mepeoEntries(): HasMany
    {
        return $this->hasMany(MepeoInformation::class, 'waste_characteristic_id');
    }
}

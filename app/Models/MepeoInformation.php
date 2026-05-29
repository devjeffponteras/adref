<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MepeoInformation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'mepeo_information';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'asset_id',
        'waste_classification_id',
        'waste_characteristic_id',
        'remarks',
    ];

    /**
     * Get the core asset profile record tied to this MEPEO entry.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    /**
     * Get the referenced waste classification type details.
     */
    public function wasteClassification(): BelongsTo
    {
        return $this->belongsTo(WasteClassification::class, 'waste_classification_id');
    }

    /**
     * Get the referenced waste characteristic properties details.
     */
    public function wasteCharacteristic(): BelongsTo
    {
        return $this->belongsTo(WasteCharacteristic::class, 'waste_characteristic_id');
    }
}
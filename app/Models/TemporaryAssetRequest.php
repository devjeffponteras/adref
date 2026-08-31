<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemporaryAssetRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'refno',
        'transid',
        'status',
        'control_number',
        'user_id',
        'accountable_personnel',
        'model',
        'brand_make',
        'serial_plate_id_number',
        'end_user_department',
        'asset_classification_id',
        'others_description',
        'asset_location',
        'description',
        'reasons_for_disposal',
        'assessment_reports',
        'asset_photos',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'assessment_reports' => 'array',
        'asset_photos' => 'array',
    ];

    /**
     * Relationship to User (if applicable).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
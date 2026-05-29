<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'control_number',
        'accountable_personnel',
        'model',
        'description',
        'brand_make',
        'serial_plate_id_number',
        'end_user_department',
        'asset_classification_id', // The foreign key column link to asset_classifications
        'reasons_for_disposal',
        'asset_location',
        'status',
        'assessment_report_path',
        'asset_photo_path',
    ];

    protected $attributes = [
        'status' => 'Pending',
    ];

    public function approvals(): HasMany
    {
        return $this->hasMany(AssetApproval::class, 'asset_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function classification(): BelongsTo
    {
        return $this->belongsTo(AssetClassification::class, 'asset_classification_id');
    }
    
    public function assetStatuses(): HasMany
    {
        return $this->hasMany(AssetStatus::class, 'asset_id');
    }

    public function accounting_information(): HasOne
    {
        return $this->hasOne(AccountingInformation::class, 'asset_id');
    }

    public function mcd_information(): HasOne
    {
        return $this->hasOne(McdInformation::class, 'asset_id');
    }
}
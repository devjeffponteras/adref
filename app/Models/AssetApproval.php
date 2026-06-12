<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetApproval extends Model
{
    // Allows mass-assignment for your specific tracking column criteria
    protected $fillable = [
        'asset_id',
        'is_current',
        'seq_no',
        'approver_id',
        'status',
        'approval_date',
        'remarks',
    ];

    /**
     * Get the asset that owns this approval step record.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}

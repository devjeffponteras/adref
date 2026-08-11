<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetScrap extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'approver_id',
        'img_proofs',
        'img_proof_desc',
        'doc_proofs',
        'doc_proof_desc',
        'status',
        'others',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'img_proofs' => 'array',
        'doc_proofs' => 'array',
    ];

    /**
     * Get the associated asset.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the user who approved or recorded the scrap.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
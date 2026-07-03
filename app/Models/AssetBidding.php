<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetBidding extends Model implements Auditable 
{
    use AuditableTrait;
    use HasFactory;

    protected $table = 'asset_biddings';

    protected $fillable = [
        'asset_id',
        'status',
        'listed_at',
    ];

    protected $casts = [
        'listed_at' => 'datetime',
    ];

    /**
     * Get the core Asset that this bidding listing connects to.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    /**
     * Get the management/pricing info tied to the underlying asset.
     */
    public function manager_information(): HasOne
    {
        return $this->hasOne(ManagerInformation::class, 'asset_id', 'asset_id');
    }

    /**
     * Get all bids submitted for this specific asset listing.
     */
    public function biddings(): HasMany
    {
        return $this->hasMany(Bidding::class, 'asset_id', 'asset_id');
    }
    
}
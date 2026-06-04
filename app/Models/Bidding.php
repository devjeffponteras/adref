<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bidding extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'biddings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'asset_id',
        'user_id',
        'bidder_name',
        'bidder_contact_number',
        'bidder_classification',
        'department',
        'date_hired',
        'bidding_cycle',
        'bidding_price',
        'bid_status',
        'remarks',
        'reference_number',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_hired' => 'date',
        'bidding_cycle' => 'integer',
        'bidding_price' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the Asset that this bidding record belongs to.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    /**
     * Get the User (Admin/Staff) who registered or managed this bid.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManagerInformation extends Model implements Auditable 
{
    use AuditableTrait;
    
    protected $table = 'manager_information';

    protected $fillable = [
        'asset_id',
        'user_id',
        'asset_direction',
        'bidding_price',
        'manager_disposition',
        'reviewed_by',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model implements Auditable 
{
    use HasFactory, AuditableTrait;

    protected $table = 'workflows';

    protected $fillable = [
        'asset_id',
        'status',
        'workflow_step',
    ];

    protected $casts = [
        'asset_id' => 'integer',
        'workflow_step' => 'integer',
    ];
}

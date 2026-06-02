<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workflow extends Model
{
    use HasFactory;

    protected $table = 'workflows';

    protected $fillable = [
        'asset_id',
        'status',
        'workflow_step',
    ];

    protected $casts = [
        'asset_id'      => 'integer',
        'workflow_step' => 'integer',
    ];
}
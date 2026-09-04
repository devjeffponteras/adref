<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiddingCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_from',
        'date_to',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
    ];
}

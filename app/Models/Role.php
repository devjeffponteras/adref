<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Allows massive assignments safely
    protected $fillable = ['name', 'description'];

    /**
     * Relationship: A role can belong to many users.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}

<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Auditable as AuditableTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model implements Auditable 
{
    use AuditableTrait;

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
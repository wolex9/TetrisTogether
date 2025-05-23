<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'ulid',
        'mode',
    ];

    public function moves()
    {
        return $this->hasMany(Move::class)->orderBy('created_at');
    }
}

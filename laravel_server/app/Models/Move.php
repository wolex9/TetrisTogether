<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Move extends Model
{
    protected $fillable = [
        'game_id',
        'player_id',
        'type',
    ];
}

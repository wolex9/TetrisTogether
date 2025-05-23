<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'friendship_id',
        'sender_id',
        'message',
    ];
}

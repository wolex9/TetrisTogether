<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', function () {
    return Inertia::render('main');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::post('/check-username', function (Request $request) {
    $request->validate([
        'username' => 'required|string|max:255',
    ]);

    return response()->json([
        'userExists' => User::where('username', $request->username)->exists(),
    ]);
})->name('check-username');

Route::get('/lobby', function () {
    return Inertia::render('lobby-index');
})->name('lobby-index');

Route::get('/lobby/{roomId}', function (string $roomId) {
    return Inertia::render('lobby-room', [
        'roomId' => $roomId
    ]);
})->where('roomId', '[A-Za-z0-9]{4}')->name('lobby-room');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

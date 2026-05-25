<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AssetController;
use App\Http\Controllers\DashboardController;

Route::inertia('/', 'welcome')->name('home');

// Add routes here for GLOBAL account
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('bidding', 'bidding')->name('bidding');
    Route::inertia('forms', 'forms')->name('forms');
    Route::inertia('profile', 'profile')->name('profile');

    Route::get('assets/{id}/asset-status', [AssetController::class, 'assetStatus'])->name('asset-status');
});

// Add routes here for admin account
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('reports', 'reports')->name('reports');

    Route::get('disposals', [AssetController::class, 'disposals'])->name('disposals');
});

// Add routes here for ASID account
Route::middleware(['auth', 'verified', 'role:asid'])->group(function () {
    Route::get('asid-dashboard', [DashboardController::class, 'asidDashboard'])->name('asid-dashboard');
    Route::get('asid-evaluate/{id}', [AssetController::class, 'asidEvaluate'])->name('asid-evaluate');
});

// Add routes here for MCD account
Route::middleware(['auth', 'verified', 'role:mcd'])->group(function () {
    Route::get('mcd-dashboard', [DashboardController::class, 'mcdDashboard'])->name('mcd-dashboard');
});

// Add routes here for standard user account
Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::inertia('scan-log-asset', 'scan-log-asset')->name('scan-log-asset');

    Route::get('user-dashboard', [DashboardController::class, 'userDashboard'])->name('user-dashboard');

    Route::get('my-assets', [AssetController::class, 'myAssets'])->name('my-assets');
    Route::get('create-asset', [AssetController::class, 'create'])->name('create-asset');
    Route::post('store-asset', [AssetController::class, 'store'])->name('store-asset');

    Route::post('assets/{id}/asset-approve', [AssetController::class, 'assetApprove'])->name('asset-approve');
});

require __DIR__.'/settings.php';

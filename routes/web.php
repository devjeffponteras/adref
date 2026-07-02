<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');
Route::inertia('/', 'auth/login')->name('home');

// Add routes here for GLOBAL account
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('profile', 'profile')->name('profile');
    Route::get('bidding', [AssetController::class, 'userBidding'])->name('bidding');
    Route::post('user/bidding/entry/{id}', [AssetController::class, 'userBiddingEntry'])->name('bidding.entry');
    Route::get('assets/{id}/asset-status', [AssetController::class, 'assetStatus'])->name('asset-status');

    Route::get('forms', [AssetController::class, 'forms'])->name('forms');
    Route::post('forms/form-upload', [AssetController::class, 'formUpload'])->name('form-upload');
    Route::post('forms/form-update/{id}', [AssetController::class, 'formUpdate'])->name('form-update');
    Route::post('forms/form-delete/{id}', [AssetController::class, 'formDelete'])->name('form-delete');
});

// Add routes here for admin account
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('dashboard', [DashboardController::class, 'adminDashboard'])->name('dashboard');
    Route::inertia('reports', 'reports')->name('reports');

    Route::get('disposals', [AssetController::class, 'disposals'])->name('disposals');

    Route::get('admin/user-management/index', [AdminController::class, 'userManagementIndex'])->name('user-management.index');
    Route::get('admin/user-management/create', [AdminController::class, 'userManagementCreate'])->name('user-management.create');
    Route::post('admin/user-management/store', [AdminController::class, 'userManagementStore'])->name('user-management.store');
    Route::get('admin/user-management/edit/{id}', [AdminController::class, 'userManagementEdit'])->name('user-management.edit');
    Route::post('admin/user-management/update', [AdminController::class, 'userManagementUpdate'])->name('user-management.update');
    Route::post('admin/user-management/delete/{id}', [AdminController::class, 'userManagementDelete'])->name('user-management.delete');

    Route::get('admin/bidding/index', [AdminController::class, 'biddingIndex'])->name('bidding.index');
    Route::get('admin/bidding/create', [AdminController::class, 'biddingCreate'])->name('bidding.create');
    Route::post('admin/bidding/store/{id}', [AdminController::class, 'biddingStore'])->name('bidding.store');

    // Secret Options
    Route::get('admin/secret/assets', [AdminController::class, 'assetPass'])->name('admin.asset-pass');
    Route::post('/admin/secret/assets/{id}/approve', [AdminController::class, 'approveAssetPass'])
    ->name('assets.approve-pass');
});

// Add routes here for ASID account
Route::middleware(['auth', 'verified', 'role:asid'])->group(function () {
    Route::get('asid-dashboard', [DashboardController::class, 'asidDashboard'])->name('asid-dashboard');
    Route::get('asid-view/{id}', [AssetController::class, 'asidViewAsset'])->name('asid-view-asset');
    Route::post('asid-view/{id}/action', [AssetController::class, 'asidViewAssetAction'])->name('asid-view-asset-action');
    Route::get('asid-evaluate/{id}', [AssetController::class, 'asidEvaluate'])->name('asid-evaluate');
    Route::post('asid-evaluate/{id}/action', [AssetController::class, 'asidEvaluateAction'])->name('asid-evaluate-action');

    Route::get('asid-evaluate-manager/{id}', [AssetController::class, 'asidEvaluateManager'])->name('asid-evaluate-manager');

});

// Add routes here for MANAGER account
Route::middleware(['auth', 'verified', 'role:manager'])->group(function () {
    Route::get('manager-dashboard', [DashboardController::class, 'managerDashboard'])->name('manager-dashboard');
    Route::get('manager-evaluate/{id}', [AssetController::class, 'managerEvaluate'])->name('manager-evaluate');
    Route::post('manager-evaluate/{id}/action', [AssetController::class, 'managerEvaluateAction'])->name('manager-evaluate-action');
});

// Add routes here for Accounting account
Route::middleware(['auth', 'verified', 'role:accounting'])->group(function () {
    Route::get('accounting-dashboard', [DashboardController::class, 'accountingDashboard'])->name('accounting-dashboard');
    Route::get('accounting-evaluate/{id}', [AssetController::class, 'accountingEvaluate'])->name('accounting-evaluate');
    Route::post('accounting-evaluate/{id}/action', [AssetController::class, 'accountingEvaluateAction'])->name('accounting-evaluate-action');

    Route::post('accounting-evaluate/{id}/save-only', [AssetController::class, 'accountingEvaluateSaveOnly'])->name('accounting-evaluate-save-only');
    Route::post('accounting-evaluate/{id}/workflow-action', [AssetController::class, 'accountingEvaluateWorkflowAction'])->name('accounting-evaluate-workflow-action');
});

// Add routes here for MCD account
Route::middleware(['auth', 'verified', 'role:mcd'])->group(function () {
    Route::get('mcd-dashboard', [DashboardController::class, 'mcdDashboard'])->name('mcd-dashboard');
    Route::get('mcd-evaluate/{id}', [AssetController::class, 'mcdEvaluate'])->name('mcd-evaluate');
    Route::post('mcd-evaluate/{id}/action', [AssetController::class, 'mcdEvaluateAction'])->name('mcd-evaluate-action');
});

// Add routes here for MEPEO account
Route::middleware(['auth', 'verified', 'role:mepeo'])->group(function () {
    Route::get('mepeo-dashboard', [DashboardController::class, 'mepeoDashboard'])->name('mepeo-dashboard');
    Route::get('mepeo-evaluate/{id}', [AssetController::class, 'mepeoEvaluate'])->name('mepeo-evaluate');
    Route::post('mepeo-evaluate/{id}/action', [AssetController::class, 'mepeoEvaluateAction'])->name('mepeo-evaluate-action');
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

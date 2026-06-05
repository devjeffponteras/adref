<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Dashboards

    public function adminDashboard(): Response
    {   
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.user.role'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function asidDashboard(): Response
    {   
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('asid/dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function accountingDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.accounting_information'])
                        ->whereHas('asset', function ($query) {
                            $query->whereNotNull('control_number')
                                ->where('control_number', '!=', '');
                        })
                        ->orderBy('created_at', 'desc')
                        ->get();
                        
        // dd($assetStatuses->toArray());
        return Inertia::render('accounting/dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function mcdDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.accounting_information', 'asset.mcd_information'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('mcd/dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function mepeoDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.mcd_information'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('mepeo/dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function userDashboard(): Response
    {
        return Inertia::render('user/dashboard');
    }
}
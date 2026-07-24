<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetStatus;
use App\Models\AssetBidding;
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
            'assetStatuses' => $assetStatuses,
        ]);
    }

    public function asidDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.classification'])
            ->orderBy('created_at', 'desc')
            ->get();

        $assets = Asset::with(['mepeo_information'])
            ->whereHas('mepeo_information', function ($query) {
                $query->where('waste_characteristic_id', 13); // 13 is SCRAP
            })
            ->orderBy('created_at', 'desc')
            ->get();
// dd($assets);
        return Inertia::render('asid/dashboard', [
            'assetStatuses' => $assetStatuses,
            'assets' => $assets
        ]);
    }

    public function managerDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.classification', 'asset.manager_information', 'asset.asid_information'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $assets = Asset::with(['mepeo_information'])
            ->where('status', 'Completed')
            ->whereHas('mepeo_information', function ($query) {
                $query->where('waste_characteristic_id', '!=', 13); // 13 is SCRAP
            })
            ->whereDoesntHave('biddingListing')
            ->get();
// dd($assets);
        $assetOnBidding = AssetBidding::with('asset.accounting_information')->get();
// dd($assetOnBidding);
        return Inertia::render('manager/dashboard', [
            'assetStatuses' => $assetStatuses,
            'assetOnBidding' => $assetOnBidding,
            'assets' => $assets,
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
            'assetStatuses' => $assetStatuses,
        ]);
    }

    public function mcdDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.accounting_information', 'asset.mcd_information'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('mcd/dashboard', [
            'assetStatuses' => $assetStatuses,
        ]);
    }

    public function mepeoDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.mcd_information', 'asset.mepeo_information'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('mepeo/dashboard', [
            'assetStatuses' => $assetStatuses,
        ]);
    }

    public function userDashboard(): Response
    {
        return Inertia::render('user/dashboard');
    }
}

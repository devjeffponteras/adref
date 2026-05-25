<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function asidDashboard(): Response
    {   
        $assetStatuses = AssetStatus::with(['asset', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('asid/dashboard', [
            'assetStatuses' => $assetStatuses
        ]);
    }

    public function mcdDashboard(): Response
    {
        return Inertia::render('mcd/dashboard');
    }

    public function userDashboard(): Response
    {
        return Inertia::render('user/dashboard');
    }
}
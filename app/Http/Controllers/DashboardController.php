<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

use App\Models\Asset;
use App\Models\AssetStatus;
use App\Models\AssetBidding;
use App\Models\ManagerInformation;
use App\Models\TemporaryAssetRequest;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Dashboards

    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $roleName = is_object($user->role) ? ($user->role->name ?? '') : ($user->role ?? 'user');
        $role = strtolower((string) $roleName);

        return match ($role) {
            'admin'       => redirect()->route('admin-dashboard'),
            'asid'        => redirect()->route('asid-dashboard'),
            'manager'     => redirect()->route('manager-dashboard'),
            'accounting'  => redirect()->route('accounting-dashboard'),
            'mcd'         => redirect()->route('mcd-dashboard'),
            'mcd-manager' => redirect()->route('mcd-manager-dashboard'),
            'mepeo'       => redirect()->route('mepeo-dashboard'),
            default       => redirect()->route('user-dashboard'),
        };
    }

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
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.classification', 'asset.assetDisposal'])
            ->orderBy('created_at', 'desc')
            ->get();

        $assets = Asset::with(['mepeo_information', 'manager_information', 'assetDisposal', 'mepeo_information', 'asset_scraps', 'biddingListing'])
            ->orderBy('created_at', 'desc')
            ->get();

        // dd($assetStatuses->toArray());

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

    public function mcdManagerDashboard(): Response
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.user', 'approver', 'asset.accounting_information', 'asset.mcd_information'])
            ->orderBy('created_at', 'desc')
            ->get();

            return Inertia::render('mcd-manager/dashboard', [
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

    public function userDashboard(Request $request): Response
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $sortColumn = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSorts = ['refno', 'transid', 'status', 'accountable_personnel', 'brand_make', 'model', 'end_user_department', 'created_at'];
        if (!in_array($sortColumn, $allowedSorts)) {
            $sortColumn = 'created_at';
        }

        $temporaryAssets = TemporaryAssetRequest::query()
            ->select([
                'id',
                'refno',
                'transid',
                'status',
                'accountable_personnel',
                'brand_make',
                'model',
                'end_user_department',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('refno', 'like', "%{$search}%")
                      ->orWhere('transid', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhere('accountable_personnel', 'like', "%{$search}%")
                      ->orWhere('brand_make', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('end_user_department', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        $assets = Asset::with('manager_information', 'asset_scraps')->get();
        // dd($assets);
        return Inertia::render('user/dashboard', [
            'temporaryAssets' => $temporaryAssets,
            'assets' => $assets,
            'filters' => [
                'search'   => $search,
                'per_page' => (int) $perPage,
                'sort_by'  => $sortColumn,
                'sort_dir' => $sortDirection,
            ],
        ]);
    }
}

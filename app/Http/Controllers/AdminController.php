<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

use App\Models\Asset;
use App\Models\AssetBidding;
use App\Models\Role;
use App\Models\User;
use App\Models\AssetStatus;
use App\Models\AssetApproval;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Http;

class AdminController extends Controller
{
    /**
     * Display a listing of the end user's data.
     */
    public function userManagementIndex(): Response
    {
        $users = User::with('role')->get();

        return Inertia::render('admin/user-management/index', [
            'users' => $users,
        ]);
    }

    /**
     * Buhat ta ug users
     */
    public function userManagementCreate(): Response
    {
        return Inertia::render('admin/user-management/create', [
            'roles' => Role::all(),
        ]);
    }

    /**
     * Save ta ug user
     */
    public function userManagementStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
        ]);

        return redirect('/admin/user-management/index')->with('success', 'User registered successfully!');
    }

    /**
     * Edit ta ug user
     */
    public function userManagementEdit($id): Response
    {
        $user = User::findOrFail($id);
        $roles = Role::all(); 

        return Inertia::render('admin/user-management/edit', [ 
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update ta ug existing user
     */
    public function userManagementUpdate(Request $request)
    {
        $user = User::findOrFail($request->id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect('/admin/user-management/index')->with('success', 'User updated successfully!');
    }

    /**
     * Delete a user
     */
    public function userManagementDelete($id)
    {
        $user = User::findOrFail($id);

        if (Auth::id() == $user->id) {
            return redirect('/admin/user-management/index')
                ->with('error', 'You cannot delete your own account!');
        }

        $user->delete();

        return redirect('/admin/user-management/index')
            ->with('success', 'User deleted successfully!');
    }

    // admin bidding
    public function biddingIndex(): Response
    {
        $assets = Asset::where('status', 'Approved')
        ->whereDoesntHave('biddingListing')
        ->get();

        $assetOnBidding = AssetBidding::with([
            'asset.accounting_information', 
            'asset.manager_information',
            'biddings' 
        ])->get();

        return Inertia::render('admin/bidding/index', [
            'assets' => $assets,
            'assetOnBidding' => $assetOnBidding,
        ]);
    }

    public function biddingStore(Request $request, $id)
    {
        $asset = Asset::where('status', 'Approved')->findOrFail($id);

        AssetBidding::create([
            'asset_id' => $asset->id,
        ]);

        return redirect()->back()->with('/admin/bidding/index')->with('success', 'Asset successfully published for bidding entry!');
    }

    // updated controller para ma set up and workflow og tarong
    public function assetPass()
    {
        $assetStatuses = AssetStatus::with(['asset', 'asset.approvals'])
            ->where('seq_no', '>=', 6)
            ->where('seq_no', '!=', 8)
            ->get();

            return Inertia::render('admin/workflow/asset-pass', [
            'assetStatuses' => $assetStatuses,
        ]);
    }

    public function approveAssetPass(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $asset = Asset::findOrFail($id);
            $asset->update([
                'status' => 'Approved'
            ]);

            AssetStatus::where('asset_id', $id)->update([
                'seq_no' => 8,
                'status' => 'Approved'
            ]);

            AssetApproval::where('asset_id', $id)->update([
                'status' => 'Approved',
                'is_current' => 0
            ]);

            $lastApproval = AssetApproval::where('asset_id', $id)
                ->orderBy('id', 'desc')
                ->first();

            if ($lastApproval) {
                $lastApproval->update([
                    'is_current' => 1
                ]);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Asset has been fully approved successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Asset Approval Failed for ID {$id}: " . $e->getMessage());

            return redirect()->back()->with('error', 'Failed to approve asset. Please try again.');
        }
    }

    // WORKFLOW CONTROLLER
    public function workflowTransactions() {

        // kuha tag sample data from WFS using 20.28 network
        $apiUrl = 'http://172.16.20.28/PMC-WFS/public/api/transactions';
        $transactions = [];

        try {
            $response = Http::timeout(10)->get($apiUrl);
            if ($response->successful()) {
                $data = $response->json();
                $transactions = $data['transactions'] ?? [];
            }
        } catch (\Exception $e) {
            // Log error
        }

        // pasa sa front end
        return Inertia::render('admin/workflow/index', [
            'transactions' => $transactions
        ]);
    }


    // End WORKFLOW CONTROLLER
}

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Role;
use App\Models\User;
use App\Models\Asset;
use App\Models\AssetBidding;

class AdminController extends Controller
{
    /**
     * Display a listing of the end user's data.
     */
    public function userManagementIndex(): Response
    {
        $users = User::with('role')->get();

        return Inertia::render('admin/user-management/index', [
            'users' => $users
        ]);
    }

    /**
     * Buhat ta ug users
     */
    public function userManagementCreate(): Response
    {
        return Inertia::render('admin/user-management/create', [
            'roles' => Role::all()
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

    // bidding
    public function biddingIndex(): Response
    {
        $assets = Asset::where('status', 'Approved')
            ->whereDoesntHave('biddingListing')
            ->get();

        $assetOnBidding = AssetBidding::with('asset.accounting_information')->get();

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

        return redirect('/admin/bidding/index')->with('success', 'Asset successfully published for bidding entry!');
    }
}
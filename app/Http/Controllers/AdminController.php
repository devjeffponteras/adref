<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

use App\Models\Asset;
use App\Models\AssetBidding;
use App\Models\Role;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

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

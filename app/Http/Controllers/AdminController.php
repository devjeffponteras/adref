<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Role;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * Display a listing of the end user's data.
     */
    public function userManagement(): Response
    {
        $users = User::with('role')->get();

        return Inertia::render('admin/user-management', [
            'users' => $users
        ]);
    }

    /**
     * Buhat ta ug users
     */
    public function userManagementCreate(): Response
    {
        return Inertia::render('admin/user-management-create', [
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
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
        ]);

        return redirect('/users')->with('success', 'User account registered seamlessly!');
    }
}
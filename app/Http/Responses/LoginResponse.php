<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        // 💡 Grab the logged-in user's descriptive role name
        $role = strtolower(Auth::user()->role->name ?? 'user');

        // 💡 Direct admins to the dashboard, normal users to their profile
        if ($role === 'admin') {
            return redirect()->intended(route('dashboard'));
        }

        return redirect()->intended(route('bidding'));
    }
}
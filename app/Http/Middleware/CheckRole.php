<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Ensure the user is logged in
        // 2. Check if their role name matches the required route parameter (e.g., 'admin')
        if (!$request->user() || strtolower($request->user()->role->name) !== strtolower($role)) {
            
            // If they are regular users trying to hit an admin route, bounce them to safety
            if ($request->user() && strtolower($request->user()->role->name) === 'user') {
                return redirect()->route('forms'); // Or wherever your standard user landing page is
            }

            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}

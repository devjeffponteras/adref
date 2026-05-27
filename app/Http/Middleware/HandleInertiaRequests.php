<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Role;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // 1. Get the current logged-in user
        $user = $request->user();

        // 2. If a user is logged in, attach their role data to the user object
        if ($user) {
                $user->loadMissing('role'); // This eager-loads the 'role' relationship
            }

            return [
                ...parent::share($request),
                'name' => config('app.name'),
                'auth' => [
                    'user' => $user, // Passes the user complete with their role relationship
                ],
                'roles' => Role::select('id', 'name')->get(),
                'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
                'flash' => [
                    'success' => fn () => $request->session()->get('success'),
                    'error'   => fn () => $request->session()->get('error'),
                ],
            ];
    }
}

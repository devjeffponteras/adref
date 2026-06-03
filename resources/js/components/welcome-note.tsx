import { usePage } from '@inertiajs/react';

export function WelcomeNote() {

    const { auth } = usePage().props as any;

    return (
        <>
            <div className="flex flex-row bg-linear-to-tr from-emerald-800 to-emerald-500 p-5 rounded-xl shadow-sm mr-2">
                <div className="flex flex-col text-white">
                    <h3 className="font-bold text-2xl tracking-tight capitalize">
                        Hello, {auth.user?.name || 'User'}!
                    </h3>
                    <p className="text-xs text-emerald-100 mt-1">
                        Welcome to Automated Asset for Disposal System
                    </p>
                </div>
            </div>
        </>
    )
}
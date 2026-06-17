import { usePage } from '@inertiajs/react';

export function WelcomeNote() {

    const { auth } = usePage().props as any;

    return (
        <>
            <div className="flex flex-row bg-slate-900 p-5 rounded-xl shadow-sm mr-2 mt-2">
                <div className="flex flex-col text-slate-100">
                    <h3 className="font-bold text-2xl tracking-tight capitalize">
                        Hello, {auth.user?.name || 'User'}!
                    </h3>
                    <p className="text-xs text-slate-200 mt-1">
                        Welcome to Automated Asset for Disposal System
                    </p>
                </div>
            </div>
        </>
    )
}
import { usePage } from '@inertiajs/react';

export function WelcomeNote() {

    const { auth } = usePage().props as any;

    return (
        <>
            <div className="relative overflow-hidden bg-gray-100 border border-zinc-200 shadow p-6 rounded-xl mr-2 mt-2">
                {/* Subtle background structural accent */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-zinc-100/50 rounded-full blur-xl pointer-events-none" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
                    
                    {/* Left Section: User Identity with a modern profile ring */}
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-0.5">
                                Welcome Back
                            </span>
                            <h3 className="font-black text-2xl text-zinc-800 tracking-tight capitalize leading-none">
                                Hello, {auth.user?.name || 'User'}!
                            </h3>
                        </div>
                    </div>

                    {/* Right Section: System context transformed into an app-status badge */}
                    <div className="flex flex-col items-start sm:items-end gap-1.5 border-t border-zinc-200/60 pt-3 sm:border-t-0 sm:pt-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white shadow rounded-xl border border-zinc-300/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold text-zinc-600 tracking-wide uppercase">
                                Asset Disposal System Active
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
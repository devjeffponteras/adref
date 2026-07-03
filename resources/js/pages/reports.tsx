import { Head, useForm, usePage } from '@inertiajs/react';
import { TrafficCone, Loader, Sparkles } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import { reports } from '@/routes';

export default function Reports() {
    return (
        <>
            <Head title="Assets for Bidding" />
            {/* <WelcomeNote /> */}

            {/* Content Container */}
            <div className="container-fluid p-4 min-h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 p-8 text-center shadow-xl shadow-emerald-900/5 backdrop-blur-md">
                    
                    {/* Decorative Background Glows */}
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-leaf/10 blur-2xl animate-pulse delay-700" />

                    {/* Icon Stack */}
                    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                        <div className="absolute inset-0 rounded-full border border-emerald-200/50 animate-ping opacity-25" />
                        <TrafficCone className="h-10 w-10 text-rose-600 animate-bounce" />
                        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-pulse" />
                    </div>

                    {/* Typography */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 mb-3 uppercase tracking-wider">
                        Developmental phase
                    </span>
                    
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#004d40] mb-3">
                        My Reports Page
                    </h2>
                    
                    <p className="text-sm leading-relaxed text-gray-500 mb-6 max-w-sm mx-auto">
                        We are currently fine-tuning the auction parameters and compliance frameworks. Digital bidding forms and real-time asset evaluations are coming soon.
                    </p>

                    {/* Divider Line */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-emerald-100/60" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 font-mono text-xs text-emerald-700/60">UNDER CONSTRUCTION</span>
                        </div>
                    </div>

                    {/* Mini Status Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="rounded-xl border border-gray-100 bg-white/60 p-3 text-left">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
                            <p className="text-sm font-bold text-amber-600 inline-flex items-center gap-1.5 mt-0.5">
                                <Loader className="h-3.5 w-3.5 animate-spin" /> In Progress
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white/60 p-3 text-left">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Target Next</p>
                            <p className="text-sm font-bold text-emerald-700 mt-0.5">v2.1 Release</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Reports.layout = {
    breadcrumbs: [{ title: 'Reports', href: reports() }],
};
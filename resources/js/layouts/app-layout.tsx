import { usePage } from '@inertiajs/react';
import { CircleCheck, XIcon, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;
    
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {/* --- Global Floating Notification Overlay Stack --- */}
            <div className="fixed top-5 right-5 z-50 max-w-md w-full space-y-3 pointer-events-none">
                {/* Success Banner */}
                {visible && flash?.success && (
                    <div className="pointer-events-auto p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start shadow-lg transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
                        <CircleCheck className="h-5 w-5 mr-3 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-emerald-900">Success</p>
                            <p className="text-emerald-700/90 mt-0.5">{flash.success}</p>
                        </div>
                        <button onClick={() => setVisible(false)} className="text-emerald-400 hover:text-emerald-600 ml-3 cursor-pointer focus:outline-hidden">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Error Banner */}
                {visible && flash?.error && (
                    <div className="pointer-events-auto p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start shadow-lg transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
                        <AlertCircle className="h-5 w-5 mr-3 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-red-900">Error</p>
                            <p className="text-red-700/90 mt-0.5">{flash.error}</p>
                        </div>
                        <button onClick={() => setVisible(false)} className="text-red-400 hover:text-red-600 ml-3 cursor-pointer focus:outline-hidden">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Render the core dashboard page content slot */}
            {children}
        </AppLayoutTemplate>
    );
}
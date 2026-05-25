import { usePage } from '@inertiajs/react';

export function WelcomeNoteMini() {

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            {/* Cleaned up 'row' and replaced with clean spacing styling */}
            <div className="flex flex-col gap-0.5 pb-4 text-gray-700">
                <span className="text-xs font-bold text-gray-900 tracking-wide">
                    My ADREF’s Today!
                </span>
                <span className="text-xs text-gray-400 font-medium">
                    {currentDate}
                </span>
            </div>
        </>
    );
}
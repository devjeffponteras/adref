import { usePage } from '@inertiajs/react';

export function WelcomeNoteMini() {

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
  <div className="relative overflow-hidden rounded-xl w-fit border border-indigo-100/80 bg-linear-to-br from-white to-indigo-50/30 px-4 py-2 mb-4 shadow-sm backdrop-blur-sm">
    {/* Decorative abstract glow in the background */}
    <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-indigo-400/10 blur-xl" />
    
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
          My ADREF’s Today!
        </h3>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-500/80">
          {currentDate}
        </p>
      </div>
    </div>
  </div>
);
}
import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, CircleCheck, Plus, XCircle } from 'lucide-react';
import { FormEvent } from 'react';
import { WelcomeNote } from '@/components/welcome-note';

interface BiddingCycle {
    id: number;
    date_from: string;
    date_to: string;
    created_at: string;
    updated_at: string;
}

interface CyclePageProps {
    biddingCycles: BiddingCycle[];
}

interface FlashProps {
    success?: string;
    error?: string;
}

export default function BiddingCycle({ biddingCycles = [] }: CyclePageProps) {
    const { flash } = usePage().props as { flash?: FlashProps };
    const { data, setData, post, processing, errors, reset } = useForm({
        date_from: '',
        date_to: '',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        post('/admin/bidding/cycle', {
            onSuccess: () => reset(),
        });
    };

    const formatDate = (date: string) => {
        const parsedDate = new Date(date.includes('T') ? date : `${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) return 'Invalid Date';

        return parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="Bidding Cycles" />
            <WelcomeNote />

            <main className="container-fluid p-6">
                {flash?.success && (
                    <div className="mb-6 flex items-center rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <CircleCheck className="mr-2 h-5 w-5 text-emerald-600" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 flex items-center rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <XCircle className="mr-2 h-5 w-5 text-red-600" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bidding Cycles</h1>
                    <p className="mt-1 text-sm text-slate-500">Create and review date ranges used to identify bidding cycles.</p>
                </div>

                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Add Bidding Cycle</h2>
                            <p className="text-xs text-slate-500">Set the opening and closing dates for a new cycle.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
                        <div>
                            <label htmlFor="date-from" className="mb-1.5 block text-sm font-semibold text-slate-700">Date From</label>
                            <input
                                id="date-from"
                                type="date"
                                value={data.date_from}
                                onChange={(event) => setData('date_from', event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                            />
                            {errors.date_from && <p className="mt-1 text-xs font-medium text-red-600">{errors.date_from}</p>}
                        </div>

                        <div>
                            <label htmlFor="date-to" className="mb-1.5 block text-sm font-semibold text-slate-700">Date To</label>
                            <input
                                id="date-to"
                                type="date"
                                min={data.date_from || undefined}
                                value={data.date_to}
                                onChange={(event) => setData('date_to', event.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                            />
                            {errors.date_to && <p className="mt-1 text-xs font-medium text-red-600">{errors.date_to}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus className="h-4 w-4" />
                            {processing ? 'Adding...' : 'Add Cycle'}
                        </button>
                    </form>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Bidding Cycle Registry</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                                <tr>
                                    <th className="px-6 py-3.5">Cycle Number</th>
                                    <th className="px-6 py-3.5">Date From</th>
                                    <th className="px-6 py-3.5">Date To</th>
                                    <th className="px-6 py-3.5">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {biddingCycles.length > 0 ? biddingCycles.map((cycle) => (
                                    <tr key={cycle.id} className="transition-colors hover:bg-emerald-50/30">
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-800">#{cycle.id}</td>
                                        <td className="px-6 py-4 text-slate-700">{formatDate(cycle.date_from)}</td>
                                        <td className="px-6 py-4 text-slate-700">{formatDate(cycle.date_to)}</td>
                                        <td className="px-6 py-4 text-slate-500">{formatDate(cycle.created_at.slice(0, 10))}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">No bidding cycles have been added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </>
    );
}

BiddingCycle.layout = {
    breadcrumbs: [
        {
            title: 'Bidding Cycle',
            href: '/admin/bidding/cycle',
        },
    ],
};

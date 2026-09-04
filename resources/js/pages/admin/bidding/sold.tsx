import { Head } from '@inertiajs/react';
import { Award, CalendarDays, PackageCheck } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';

interface Asset {
    id: number;
    control_number: string | null;
    brand_make: string | null;
    model: string | null;
    end_user_department: string | null;
}

interface BiddingCycle {
    id: number;
    date_from: string;
    date_to: string;
}

interface Winner {
    id: number;
    bidder_name: string | null;
    bidder_contact_number: string | null;
    bidder_classification: string | null;
    bidding_price: string | number | null;
    bid_status: string | null;
    remarks: string | null;
    processor?: { name: string } | null;
}

interface SoldAsset {
    asset: Asset;
    cycle: BiddingCycle;
    bid_count: number;
    winner: Winner;
}

interface SoldAssetsProps {
    soldAssets: SoldAsset[];
}

const formatDate = (value: string) => {
    const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function SoldAssets({ soldAssets = [] }: SoldAssetsProps) {
    return (
        <>
            <Head title="Sold Assets" />
            <WelcomeNote />

            <main className="container-fluid p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sold Assets</h1>
                    <p className="mt-1 text-sm text-slate-500">Assets from completed bidding cycles and their highest bidders.</p>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <PackageCheck className="h-5 w-5 text-emerald-700" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Sold Asset Registry</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                                <tr>
                                    <th className="px-6 py-3.5">Asset</th>
                                    <th className="px-6 py-3.5">Bidding Cycle</th>
                                    <th className="px-6 py-3.5">Bids</th>
                                    <th className="px-6 py-3.5">Winner</th>
                                    <th className="px-6 py-3.5 text-right">Highest Offer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {soldAssets.length > 0 ? soldAssets.map((item) => (
                                    <tr key={`${item.asset.id}-${item.cycle.id}`} className="transition-colors hover:bg-emerald-50/30">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-bold text-emerald-800">{item.asset.control_number || 'N/A'}</div>
                                            <div className="mt-1 font-medium text-slate-800">{item.asset.brand_make || ''} {item.asset.model || 'Asset'}</div>
                                            <div className="text-xs text-slate-500">{item.asset.end_user_department || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            <div className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-emerald-700" />Cycle {item.cycle.id}</div>
                                            <div className="mt-1 text-xs text-slate-500">{formatDate(item.cycle.date_from)} to {formatDate(item.cycle.date_to)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{item.bid_count}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-semibold text-slate-800"><Award className="h-4 w-4 text-amber-600" />{item.winner.bidder_name || 'N/A'}</div>
                                            <div className="mt-1 text-xs text-slate-500">{item.winner.bidder_classification || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-800">₱{Number(item.winner.bidding_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No completed bidding cycles with bid entries found.</td>
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

SoldAssets.layout = {
    breadcrumbs: [{ title: 'Sold Assets', href: '/admin/bidding/sold' }],
};

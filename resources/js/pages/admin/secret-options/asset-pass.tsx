import { useState } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { 
    CircleCheck
} from 'lucide-react';
import type { AssetStatusData } from '@/types/models';

interface DashboardProps {
    assetStatuses: AssetStatusData[];
}

export default function AssetPass({ assetStatuses = [] }: DashboardProps) {
    const { flash } = usePage().props as any;

    return (
        <>
            <Head title="Assets for Disposal" />

            {/* Main Content Container */}
            <div className="w-full p-6 bg-gray-50/50 min-h-screen">

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    
                    {/* Card Header component wrapper */}
                    <div className="flex items-center justify-between border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
                        <div className="flex items-center gap-3">
                            <h5 className="text-lg font-bold tracking-tight text-slate-800">
                            Assets for Auto Forward
                            </h5>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Brand / Model</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                            {assetStatuses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-400 font-medium bg-white">
                                        No active asset disposal data found.
                                    </td>
                                </tr>
                            ) : (
                                assetStatuses.map((item) => {
                                    // Safe fallback for date handling
                                    const dateSource = item.created_at || item.created_at;
                                    const formattedDate = dateSource 
                                        ? new Date(dateSource).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'No Date Recorded';

                                    return (
                                        <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                {formattedDate}
                                            </td>
                                            <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                {item.seq_no || item.seq_no}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-700">
                                                {item.asset?.brand_make || 'System Auto'} {item.asset?.model || ''}
                                            </td>
                                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                <Link 
                                                    method="post"
                                                    as="button"
                                                    href={`/admin/secret/assets/${item.asset?.id}/approve`} 
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg 
                                                            text-green-500 hover:text-green-700 hover:bg-green-100/80 border border-green-200 shadow-sm"
                                                >
                                                    <CircleCheck className="h-4 w-4" />
                                                    Pass
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    );
}

AssetPass.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Asset Secret Options' },
    ],
};
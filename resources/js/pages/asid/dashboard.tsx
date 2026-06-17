import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Folder, FolderCheck, SearchCheckIcon, FileSearch2, FolderOpen } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import { WelcomeNoteMini } from '@/components/welcome-note-mini';
import type { AssetStatusData } from '@/types/models';

interface DashboardProps {
    assetStatuses: AssetStatusData[];
}

export default function AsidDashboard({ assetStatuses }: DashboardProps) {
    const pendingTransactions = assetStatuses?.filter(item => item.status === 'Pending') || [];

    const historyTransactions = assetStatuses?.filter(item => item.asset?.control_number && item.asset.control_number.trim() !== '' && item.seq_no > 4) || [];

    return (
        <>
            <Head title="Asid Dashboard" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                {/* mini sub header */}
                <WelcomeNoteMini />
                
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Pending Transactions */}
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-100/80">Pending Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{pendingTransactions.length}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <Folder className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>

                    {/* Final Stages */}
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/80">Final Stages</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{historyTransactions.length || 0}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <FolderCheck className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>

                    {/* All Transactions */}
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-700 to-[#004d40] p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-100/80">All Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{assetStatuses.length || 0}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <FolderOpen className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-4 py-2 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex gap-2 '><Folder className='w-5 h-5' /> Pending Transactions</h3>
                        <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Applicant</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {pendingTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No pending asset evaluations waiting.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingTransactions.map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
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
                                                <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent capitalize">
                                                    {item.asset?.user?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'The Users Department'}</div>
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/asid-view/${item.asset_id}`} 
                                                        className="inline-flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emarald-700 font-medium transition-colors outline-1 outline-emerald-300 px-3 py-2 rounded hover:bg-emerald-50"
                                                    >
                                                        <SearchCheckIcon className='w-5 h-5' />
                                                        View
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

                <hr className="border-gray-100" />

                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-4 py-2 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex gap-2 '><FolderOpen className='w-5 h-5' />All Transactions</h3>
                        <table className="w-full min-w-full divide-y divide-slate-100 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status</th>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {historyTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    assetStatuses.map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : 'No Date Recorded';

                                        return (
                                            <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/assets/${item.asset_id}/asset-status`} 
                                                        className="inline-flex items-center gap-1.5 text-sm text-white font-medium transition-colors outline-1 px-2 py-2 rounded-full shadow bg-linear-to-br from-cyan-700 to-[#01a78b]"
                                                        title='View Status'
                                                    >
                                                        <FileSearch2 className='w-5 h-5'  />
                                                    </Link>
                                                </td>
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    Stage {item.seq_no}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr className="border-gray-100" />

                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <h3 className='gap-2 font-bold text-sm px-4 py-2 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex'><FolderCheck className='w-5 h-5' /> Final Stages</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {historyTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    historyTransactions.map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
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
                                                    {item.asset?.control_number}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-semibold text-emerald-800">
                                                    Step {item.seq_no}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/asid-evaluate/${item.asset_id}`} 
                                                        className="inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-700 font-medium transition-colors outline-1 outline-amber-300 px-3 py-2 rounded hover:bg-amber-50"
                                                    >
                                                        {item.status === 'Pending' ? 'Evaluate' : 'View Logs'}
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

AsidDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard',
        },
    ],
};
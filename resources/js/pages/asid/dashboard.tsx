import { Head } from '@inertiajs/react';
import { Folder, FolderCheck, SearchCheckIcon } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import { WelcomeNoteMini } from '@/components/welcome-note-mini';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    control_number: string;
    accountable_personnel: string;
    department?: string;
    user?: User;
}

interface Approver {
    id: number;
    name: string;
}

interface AssetStatusData {
    id: number;
    seq_no: number;
    is_current: boolean;
    status: string;
    remarks: string | null;
    created_at: string;
    asset_id: number;
    asset: Asset | null;
    approver: Approver | null;
}

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
                
                <div className="flex flex-col md:flex-row gap-4 mb-5">
                    <div className="w-full md:w-1/4">
                        <div className="stat-card bg-green-900 text-white p-4 rounded-xl border-0 shadow-sm h-20 hover:-translate-y-1.5 transition-all">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="mb-1 opacity-75 text-sm">Pending Transactions</p>
                                    <h2 className="font-bold text-2xl">{pendingTransactions.length}</h2>
                                </div>
                                <Folder className='h-8 w-8 opacity-80' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/3">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
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
                                                    <div className="font-medium text-gray-800">{item.asset?.department || 'The Users Department'}</div>
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/asid-view/${item.asset_id}`} 
                                                        className="inline-flex items-center gap-1.5 text-sm text-green-500 hover:text-green-700 font-medium transition-colors outline-1 outline-green-300 px-3 py-2 rounded hover:bg-green-50"
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

                <div className="flex flex-col md:flex-row gap-4 my-6">
                    <div className="w-full md:w-1/4">
                        <div className="stat-card bg-emerald-950 text-white p-4 rounded-xl border-0 shadow-sm h-20 hover:-translate-y-1.5 transition-all">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="mb-1 opacity-75 text-sm">Total History Log Entries</p>
                                    <h2 className="font-bold text-2xl">{historyTransactions.length || 0}</h2>
                                </div>
                                <FolderCheck className='h-8 w-8 opacity-80' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/3">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created / Approved By</th>
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
                                                    <div className="font-medium text-gray-800">{item.asset?.department || 'Asset Department'}</div>
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
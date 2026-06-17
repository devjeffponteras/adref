import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Folder, CircleCheck, XIcon, FolderCheck } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface inWorkflow {
    id: number;
    asset_id: number;
    workflow_step: number;
    status: string;
}

interface AccountingInformation {
    id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    status: string;
}

interface Asset {
    id: number;
    control_number: string | null;
    accountable_personnel: string;
    model: string | null;
    brand_make: string | null;
    serial_plate_id_number: string | null;
    end_user_department: string;
    description: string | null;
    status: string;
    user?: User;
    accounting_information?: AccountingInformation | null;
    inWorkflow?: inWorkflow | null;
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

export default function AccountingDashboard({ assetStatuses }: DashboardProps) {

    const { flash } = usePage().props as any;

    const pendingTransactions = assetStatuses?.filter(item => item.status === 'On-going') || [];
    const evaluatedTransactions = assetStatuses?.filter(item => item.asset?.accounting_information).length || 0;

    // const onWorkflow = assetStatuses?.filter(item => item.asset?.inWorkflow) || [];

    return (
        <>
            <Head title="Asid Dashboard" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                {flash?.success && (
                    <div className="mb-4 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/80">Pending Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{pendingTransactions.length || 0}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <Folder className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cyan-700 to-[#004d40] p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-100/80">Evaluated Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{evaluatedTransactions}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <FolderCheck className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Submitted By</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {!assetStatuses || assetStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    assetStatuses.map((item) => {

                                        const isLogged = !!item.asset?.accounting_information;

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
                                                    {item.asset?.control_number || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/accounting-evaluate/${item.asset_id}`} 
                                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg
                                                            ${isLogged 
                                                                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 border border-gray-200 shadow-sm' 
                                                                : 'text-amber-500 hover:text-amber-700 outline-1 outline-amber-300 hover:bg-amber-50'
                                                            }`}
                                                    >
                                                        {isLogged ? 'View' : 'Evaluate'}
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

AccountingDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/accounting-dashboard',
        },
    ],
};
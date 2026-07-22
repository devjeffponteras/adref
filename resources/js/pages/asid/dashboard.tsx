import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Folder, FolderCheck, SearchCheckIcon, FileSearch2, FolderOpen, LucideMap } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { AssetStatusData } from '@/types/models';

interface DashboardProps {
    assetStatuses: AssetStatusData[];
}

// Reusable Table Footer Component with Per-Page Limit Dropdown and Zinc Number Pagination
function TableFooter({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems,
    currentItemsCount,
    startIndex,
    itemsPerPage,
    onItemsPerPageChange
}: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
    currentItemsCount: number;
    startIndex: number;
    itemsPerPage: number;
    onItemsPerPageChange: (limit: number) => void;
}) {
    if (totalItems === 0) return null;

    // Generate array of page numbers to display
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
            {/* Entries Information & Limit Dropdown */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div>
                    Showing {startIndex + 1} to {startIndex + currentItemsCount} of {totalItems} entries
                </div>
            </div>
            
            
            <div className='flex flex-row gap-4 items-center'>
                <div className="flex items-center text-xs font-medium text-slate-500 gap-1.5 pe-4">
                    <span>Rows</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="bg-white text-xs border border-slate-200 text-slate-700 rounded-md py-1 px-2 font-medium focus:outline-hidden focus:border-slate-400 cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Zinc-styled Number Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page) => {
                            const isActive = page === currentPage;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        isActive 
                                            ? 'bg-zinc-700 text-white' 
                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            
        </div>
    );
}

export default function AsidDashboard({ assetStatuses }: DashboardProps) {
    const safeStatuses = assetStatuses || [];

    // --- Dynamic Items Per Page Limits ---
    const [pendingLimit, setPendingLimit] = useState(5);
    const [allLimit, setAllLimit] = useState(5);
    const [finalLimit, setFinalLimit] = useState(5);
    const [scrapsLimit, setScrapsLimit] = useState(5);

    // --- Pagination Current Page State ---
    const [pendingPage, setPendingPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [finalPage, setFinalPage] = useState(1);
    const [scrapsPage, setScrapsPage] = useState(1);

    // --- Core Data Filtering ---
    const pendingTransactions = safeStatuses.filter(item => item.status === 'Pending');

    const historyTransactions = safeStatuses.filter(item => 
        item.asset?.control_number && 
        item.asset.control_number.trim() !== '' && 
        Number(item.seq_no) > 3
    );

    const scrapTransactions = safeStatuses.filter(item => 
        item.asset?.mepeo_information?.waste_characteristic_id == 13  &&
        Number(item.seq_no) > 3
    );

    // --- Pagination Logic Helpers ---
    const getPaginatedData = (items: any[], currentPage: number, limit: number) => {
        const startIndex = (currentPage - 1) * limit;
        return items.slice(startIndex, startIndex + limit);
    };

    const getTotalPages = (items: any[], limit: number) => Math.ceil(items.length / limit) || 1;

    // Helper to safely reset page position when limit dropdown changes
    const handleLimitChange = (setLimit: (l: number) => void, setPage: (p: number) => void) => (newLimit: number) => {
        setLimit(newLimit);
        setPage(1); 
    };

    return (
        <>
            <Head title="Asid Dashboard" />
            <WelcomeNote />
            
            <div className="container-fluid p-4">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-orange-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-amber-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">Pending Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-amber-950">{pendingTransactions.length}</h2>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-100">
                                <Folder className='h-6 w-6 text-amber-600' />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 to-cyan-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-cyan-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-cyan-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700/80">Final Stages</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-cyan-950">{historyTransactions.length}</h2>
                            </div>
                            <div className="rounded-xl bg-cyan-50 p-3 border border-cyan-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-cyan-100">
                                <FolderCheck className='h-6 w-6 text-cyan-600' />
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-emerald-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-emerald-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">All Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{safeStatuses.length}</h2>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                <FolderOpen className='h-6 w-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================
                 Pending Transactions Table 
                   ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'><Folder className='w-5 h-5 text-amber-600' /> Pending Transactions</h3>
                        <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Applicant</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
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
                                    getPaginatedData(pendingTransactions, pendingPage, pendingLimit).map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

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
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{item.asset?.brand_make || 'Asset Brand / Make'} {item.asset?.model || 'Asset Model'}</div>
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/asid-view/${item.asset_id}`} 
                                                        className="inline-flex items-center gap-1.5 text-sm text-emerald-500 hover:text-emerald-700 font-medium transition-colors outline-1 outline-emerald-300 px-3 py-2 rounded hover:bg-emerald-50"
                                                    >
                                                        <SearchCheckIcon className='w-5 h-5' /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={pendingPage}
                        totalPages={getTotalPages(pendingTransactions, pendingLimit)}
                        onPageChange={setPendingPage}
                        totalItems={pendingTransactions.length}
                        currentItemsCount={getPaginatedData(pendingTransactions, pendingPage, pendingLimit).length}
                        startIndex={(pendingPage - 1) * pendingLimit}
                        itemsPerPage={pendingLimit}
                        onItemsPerPageChange={handleLimitChange(setPendingLimit, setPendingPage)}
                    />
                </div>

                <hr className="border-gray-100" />

                {/* ========================================================
                     All Transactions Table Section
                   ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'><FolderOpen className='w-5 h-5 text-emerald-600' />All Transactions</h3>
                        <table className="w-full min-w-full divide-y divide-slate-100 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {safeStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    getPaginatedData(safeStatuses, allPage, allLimit).map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

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
                                                <td className="px-4 py-4 font-mono text-base font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number || '—'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-base font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    Stage {item.seq_no}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={allPage}
                        totalPages={getTotalPages(safeStatuses, allLimit)}
                        onPageChange={setAllPage}
                        totalItems={safeStatuses.length}
                        currentItemsCount={getPaginatedData(safeStatuses, allPage, allLimit).length}
                        startIndex={(allPage - 1) * allLimit}
                        itemsPerPage={allLimit}
                        onItemsPerPageChange={handleLimitChange(setAllLimit, setAllPage)}
                    />
                </div>

                <hr className="border-gray-100" />

                {/* ========================================================
                     Final Stages Table Section
                   ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='gap-2 font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex items-center'><FolderCheck className='w-5 h-5 text-cyan-600' /> Final Stages</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
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
                                    getPaginatedData(historyTransactions, finalPage, finalLimit).map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

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
                                                        {item.status === 'On-going' ? 'Evaluate' : 'View Logs'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={finalPage}
                        totalPages={getTotalPages(historyTransactions, finalLimit)}
                        onPageChange={setFinalPage}
                        totalItems={historyTransactions.length}
                        currentItemsCount={getPaginatedData(historyTransactions, finalPage, finalLimit).length}
                        startIndex={(finalPage - 1) * finalLimit}
                        itemsPerPage={finalLimit}
                        onItemsPerPageChange={handleLimitChange(setFinalLimit, setFinalPage)}
                    />
                </div>

                <hr className="border-gray-100" />

                {/* ========================================================
                     SCRAPS Table Section
                   ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='gap-2 font-bold text-sm px-6 py-4 text-gray-900 uppercase mb-0 bg-gray-50 border-b border-slate-200 flex items-center'><LucideMap className='w-5 h-5 text-indigo-600' /> SCRAPS</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {scrapTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No SCRAP asset/s data found.
                                        </td>
                                    </tr>
                                ) : (
                                    getPaginatedData(scrapTransactions, scrapsPage, scrapsLimit).map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

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
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={scrapsPage}
                        totalPages={getTotalPages(scrapTransactions, scrapsLimit)}
                        onPageChange={setScrapsPage}
                        totalItems={scrapTransactions.length}
                        currentItemsCount={getPaginatedData(scrapTransactions, scrapsPage, scrapsLimit).length}
                        startIndex={(scrapsPage - 1) * scrapsLimit}
                        itemsPerPage={scrapsLimit}
                        onItemsPerPageChange={handleLimitChange(setScrapsLimit, setScrapsPage)}
                    />
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
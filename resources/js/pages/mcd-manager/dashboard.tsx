import { Head, Link, useForm } from '@inertiajs/react';
import { FolderCheck, FileSearch2, FolderOpen, Gavel, Folder, XIcon, ChevronUp, ChevronDown, ChevronsUpDown, FolderClockIcon } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { AssetStatusData } from '@/types/models';
import { useState, useMemo } from 'react';

interface DashboardProps {
    assetStatuses: AssetStatusData[];
    assetOnBidding: AssetBiddingData[];
    assets: Asset[]; 
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
}

interface User {
    id: number;
    name: string;
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    assets?: Asset; 
}

type SortDirection = 'asc' | 'desc' | null;

export default function managerDashboard({ assetStatuses, assets, assetOnBidding }: DashboardProps) {
    const safeStatuses = assetStatuses || [];
    const approvedAssets = assets || [];
    
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { post, processing } = useForm({});

    const historyTransactions = useMemo(() => {
        return safeStatuses.filter(item => 
            item.asset?.mcd_information &&
            (item.asset?.mcd_information?.manager_check == '0' || item?.asset?.mcd_information?.manager_remarks != null) &&
            Number(item.seq_no) < 5
        );
    }, [safeStatuses]);

    // --- Table 1: Approved Assets Pagination & Sorting ---
    const [t1PageSize, setT1PageSize] = useState<number>(5);
    const [t1Page, setT1Page] = useState<number>(1);
    const [t1SortField, setT1SortField] = useState<string | null>(null);
    const [t1SortDir, setT1SortDir] = useState<SortDirection>(null);

    const handleT1Sort = (field: string) => {
        if (t1SortField !== field) {
            setT1SortField(field);
            setT1SortDir('asc');
        } else if (t1SortDir === 'asc') {
            setT1SortDir('desc');
        } else if (t1SortDir === 'desc') {
            setT1SortField(null);
            setT1SortDir(null);
        }
        setT1Page(1);
    };

    const sortedT1Data = useMemo(() => {
        let data = [...approvedAssets];
        if (!t1SortField || !t1SortDir) return data;
        return data.sort((a, b) => {
            let valA = a[t1SortField as keyof Asset] ?? '';
            let valB = b[t1SortField as keyof Asset] ?? '';
            return t1SortDir === 'asc' 
                ? String(valA).localeCompare(String(valB)) 
                : String(valB).localeCompare(String(valA));
        });
    }, [approvedAssets, t1SortField, t1SortDir]);

    const paginatedT1Data = useMemo(() => {
        const start = (t1Page - 1) * t1PageSize;
        return sortedT1Data.slice(start, start + t1PageSize);
    }, [sortedT1Data, t1Page, t1PageSize]);

    const t1TotalPages = Math.ceil(sortedT1Data.length / t1PageSize) || 1;

    // --- Table 2: Final Stages Pagination & Sorting ---
    const [t2PageSize, setT2PageSize] = useState<number>(5);
    const [t2Page, setT2Page] = useState<number>(1);
    const [t2SortField, setT2SortField] = useState<string | null>(null);
    const [t2SortDir, setT2SortDir] = useState<SortDirection>(null);

    const handleT2Sort = (field: string) => {
        if (t2SortField !== field) {
            setT2SortField(field);
            setT2SortDir('asc');
        } else if (t2SortDir === 'asc') {
            setT2SortDir('desc');
        } else if (t2SortDir === 'desc') {
            setT2SortField(null);
            setT2SortDir(null);
        }
        setT2Page(1);
    };

    const sortedT2Data = useMemo(() => {
        let data = [...historyTransactions];
        if (!t2SortField || !t2SortDir) return data;
        return data.sort((a, b) => {
            let valA = t2SortField === 'control_number' ? (a.asset?.control_number ?? '') : (a[t2SortField as keyof AssetStatusData] ?? '');
            let valB = t2SortField === 'control_number' ? (b.asset?.control_number ?? '') : (b[t2SortField as keyof AssetStatusData] ?? '');
            return t2SortDir === 'asc' 
                ? String(valA).localeCompare(String(valB)) 
                : String(valB).localeCompare(String(valA));
        });
    }, [historyTransactions, t2SortField, t2SortDir]);

    const paginatedT2Data = useMemo(() => {
        const start = (t2Page - 1) * t2PageSize;
        return sortedT2Data.slice(start, start + t2PageSize);
    }, [sortedT2Data, t2Page, t2PageSize]);

    const t2TotalPages = Math.ceil(sortedT2Data.length / t2PageSize) || 1;

    // --- Table 3: All Transactions Pagination & Sorting ---
    const [t3PageSize, setT3PageSize] = useState<number>(5);
    const [t3Page, setT3Page] = useState<number>(1);
    const [t3SortField, setT3SortField] = useState<string | null>(null);
    const [t3SortDir, setT3SortDir] = useState<SortDirection>(null);

    const handleT3Sort = (field: string) => {
        if (t3SortField !== field) {
            setT3SortField(field);
            setT3SortDir('asc');
        } else if (t3SortDir === 'asc') {
            setT3SortDir('desc');
        } else if (t3SortDir === 'desc') {
            setT3SortField(null);
            setT3SortDir(null);
        }
        setT3Page(1);
    };

    const sortedT3Data = useMemo(() => {
        let data = [...safeStatuses];
        if (!t3SortField || !t3SortDir) return data;
        return data.sort((a, b) => {
            let valA = t3SortField === 'control_number' ? (a.asset?.control_number ?? '') : (a[t3SortField as keyof AssetStatusData] ?? '');
            let valB = t3SortField === 'control_number' ? (b.asset?.control_number ?? '') : (b[t3SortField as keyof AssetStatusData] ?? '');
            return t3SortDir === 'asc' 
                ? String(valA).localeCompare(String(valB)) 
                : String(valB).localeCompare(String(valA));
        });
    }, [safeStatuses, t3SortField, t3SortDir]);

    const paginatedT3Data = useMemo(() => {
        const start = (t3Page - 1) * t3PageSize;
        return sortedT3Data.slice(start, start + t3PageSize);
    }, [sortedT3Data, t3Page, t3PageSize]);

    const t3TotalPages = Math.ceil(sortedT3Data.length / t3PageSize) || 1;

    // --- Core Action Handlers ---
    const handleOpenConfirmModal = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
    };

    const handleConfirmPublish = () => {
        if (!selectedAsset) return;
        post(`/admin/bidding/store/${selectedAsset.id}`, {
            onSuccess: () => handleCloseModal(),
        });
    };

    // Helper dynamically injecting sorted arrow states
    const renderSortIcon = (field: string, currentField: string | null, currentDir: SortDirection) => {
        if (currentField !== field || !currentDir) return <ChevronsUpDown className="h-3 w-3 text-gray-400 ml-1.5 inline-block shrink-0" />;
        return currentDir === 'asc' 
            ? <ChevronUp className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" /> 
            : <ChevronDown className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" />;
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">Need Approval</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-amber-950">{historyTransactions.length}</h2>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-100">
                                <FolderClockIcon className='h-6 w-6 text-amber-600' />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-emerald-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-emerald-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{safeStatuses.length}</h2>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                <FolderCheck className='h-6 w-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 my-4 hidden" />

                {/* Final Stages Table Section */}
                <div className="my-6 overflow-hidden rounded-2xl border border-zinc-100 shadow-sm bg-white">
                    <h3 className='gap-2 font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-zinc-50 border-b border-zinc-200 flex items-center'><FolderClockIcon className='w-5 h-5' /> Need Approval</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-zinc-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" onClick={() => handleT2Sort('control_number')} className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Asset Control Number {renderSortIcon('control_number', t2SortField, t2SortDir)}</span>
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                                    <th scope="col" onClick={() => handleT2Sort('created_at')} className="py-3.5 pl-6 pr-3 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Application Date {renderSortIcon('created_at', t2SortField, t2SortDir)}</span>
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Brand & Model</span>
                                    </th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100/30 text-gray-600">
                                {historyTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">No active asset disposal data found.</td>
                                    </tr>
                                ) : (
                                    paginatedT2Data.map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

                                        return (
                                            <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="px-4 py-4 font-mono text-base font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium capitalize text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 text-base font-semibold text-emerald-800">
                                                    {item.asset?.brand_make}
                                                    &nbsp;
                                                    {item.asset?.model}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/mcd-manager-evaluate/${item.asset_id}`} 
                                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors outline-1 px-3 py-2 rounded hover:bg-amber-50 ${
                                                            item.asset?.mcd_information?.manager_check == '0'
                                                                ? "text-gray-500 hover:text-gray-700 outline-gray-300"
                                                                : "text-amber-500 hover:text-amber-700 outline-amber-300"
                                                        }`}
                                                    >
                                                        {item.asset?.mcd_information?.manager_check == '0' ? 'Evaluate' : 'View Logs'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {historyTransactions.length > 0 && (
                        <div className="bg-zinc-50 border-t border-zinc-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Showing {Math.min(sortedT2Data.length, (t2Page - 1) * t2PageSize + 1)}–{Math.min(sortedT2Data.length, t2Page * t2PageSize)} of {sortedT2Data.length} records</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 pe-5">
                                    <span className='text-xs'>Rows:</span>
                                    <select 
                                        value={t2PageSize} 
                                        onChange={(e) => { setT2PageSize(Number(e.target.value)); setT2Page(1); }}
                                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1 pr-5 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                                    >
                                        {[5, 10, 25, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                    </select>
                                </div>
                                {Array.from({ length: t2TotalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setT2Page(idx + 1)}
                                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors cursor-pointer ${t2Page === idx + 1 ? 'bg-zinc-700 border-zinc-800 text-white shadow-xs' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <hr className="border-gray-100 my-4" />

                {/* All Transactions Table Section */}
                <div className="my-6 overflow-hidden rounded-2xl border border-zinc-100 shadow-sm bg-white">
                    <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-zinc-50 border-b border-zinc-200 flex gap-2 items-center'><FolderCheck className='w-5 h-5' />All Transactions</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-slate-100 text-left align-middle text-sm">
                            <thead className="bg-zinc-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center w-20">Status</th>
                                    <th scope="col" onClick={() => handleT3Sort('control_number')} className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Asset Control Number {renderSortIcon('control_number', t3SortField, t3SortDir)}</span>
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                                    <th scope="col" onClick={() => handleT3Sort('created_at')} className="py-3.5 pl-6 pr-3 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Application Date {renderSortIcon('created_at', t3SortField, t3SortDir)}</span>
                                    </th>
                                    <th scope="col" onClick={() => handleT3Sort('seq_no')} className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:bg-zinc-200">
                                        <span className="flex items-center">Current Step {renderSortIcon('seq_no', t3SortField, t3SortDir)}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100/30 text-gray-600">
                                {safeStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">No active asset disposal data found.</td>
                                    </tr>
                                ) : (
                                    paginatedT3Data.map((item) => {
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
                                                        className="inline-flex items-center gap-1.5 text-sm text-white font-medium transition-colors px-2 py-2 rounded-full shadow bg-linear-to-br from-cyan-700 to-[#01a78b]"
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
                    {safeStatuses.length > 0 && (
                        <div className="bg-zinc-50 border-t border-zinc-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>Showing {Math.min(sortedT3Data.length, (t3Page - 1) * t3PageSize + 1)}–{Math.min(sortedT3Data.length, t3Page * t3PageSize)} of {sortedT3Data.length} records</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 pe-5">
                                    <span className='text-xs'>Rows:</span>
                                    <select 
                                        value={t3PageSize} 
                                        onChange={(e) => { setT3PageSize(Number(e.target.value)); setT3Page(1); }}
                                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1 pr-5 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                                    >
                                        {[5, 10, 25, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                    </select>
                                </div>
                                {Array.from({ length: t3TotalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setT3Page(idx + 1)}
                                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors cursor-pointer ${t3Page === idx + 1 ? 'bg-zinc-700 border-zinc-800 text-white shadow-xs' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scale-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Gavel className="h-5 w-5" />
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Bidding Deployment</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to open bidding for asset <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-xs">{selectedAsset.control_number}</span>?
                            </p>
                            <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                                <span className="font-semibold text-gray-800">Item:</span> {selectedAsset.brand_make} {selectedAsset.model} <br/>
                                <span className="font-semibold text-gray-800">Accountable Personnel:</span> {selectedAsset.accountable_personnel}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPublish}
                                disabled={processing}
                                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center"
                            >
                                {processing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    'Confirm & Publish'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

managerDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/manager-dashboard',
        },
    ],
};
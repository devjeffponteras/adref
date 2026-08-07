import { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    Folder, 
    FolderCheck, 
    SearchCheckIcon, 
    FileSearch2, 
    FolderOpen, 
    LucideMap, 
    ChevronsUpDown, 
    ChevronUp, 
    ChevronDown, 
    Gavel, 
    XIcon, 
    FolderSync,
    LucideBox,
    PackageOpenIcon,
    MessageCircleWarningIcon,
    CheckCircle,
    CircleCheck,
    Recycle,
    BookmarkCheckIcon
 } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { AssetStatusData, Asset } from '@/types/models';

interface DashboardProps {
    assetStatuses: AssetStatusData[];
    assets: Asset[];
    assetOnBidding: AssetBiddingData[];
    assetsForDisposal: AssetDisposals[];
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    assets?: Asset; 
}

interface AssetDisposals {
    id: number;
    asset_id: number;
    user_id: number;
    others: string;
}

interface AssetDisposalForm {
    asset_id: number | null;
    others: string;
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

type SortDirection = 'asc' | 'desc' | null;

export default function AsidDashboard({ assetStatuses, assets, assetOnBidding, assetsForDisposal }: DashboardProps) {
    const { flash } = usePage().props as any;
    
    const safeStatuses = assetStatuses || [];
    const assetsInfo = assets || [];

    const approvedAssets = assets || [];
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm<AssetDisposalForm>({
        asset_id: null,
        others: '',
    });
    
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

    // --- Bidding Approved Assets Pagination & Sorting ---
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

    // --- Dynamic Items Per Page Limits ---
    const [completedLimit, setCompletedLimit] = useState(5);
    const [pendingLimit, setPendingLimit] = useState(5);
    const [allLimit, setAllLimit] = useState(5);
    const [finalLimit, setFinalLimit] = useState(5);
    const [scrapsLimit, setScrapsLimit] = useState(5);

    // --- Pagination Current Page State ---
    const [completedPage, setCompletedPage] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [finalPage, setFinalPage] = useState(1);
    const [scrapsPage, setScrapsPage] = useState(1);

    const assetsToDispose = assetsForDisposal || [];
    
    // --- Core Data Filtering ---
    const completedTransactions = safeStatuses.filter(item => item.asset?.status === 'Completed');
    const pendingTransactions = safeStatuses.filter(item => item.status === 'Pending');

    // const completedTransactions = safeStatuses.filter(item => 
    //     item.status === 'Completed' 
    // );

    // console.log(completedTransactions);
    const historyTransactions = safeStatuses.filter(item => 
        item.asset?.control_number && 
        item.asset.control_number.trim() !== '' && 
        Number(item.seq_no) > 3
    );

    const scrapTransactions = assetsInfo.filter(item => 
        item?.mepeo_information?.waste_characteristic_id == 13
    );

    const assetsForBiddingEntry = assetsInfo.filter(item => 
        item?.status === 'Completed' &&
        item?.manager_information?.asset_direction === 'For Bidding' &&
        item?.mepeo_information?.waste_classification_id != 13 &&
        !item?.asset_disposal
    );

    console.log(assetsInfo.filter(item => 
        item?.status === 'Completed' &&
        item?.manager_information?.asset_direction === 'For Bidding' &&
        item?.mepeo_information?.waste_classification_id != 13
    ).map(item => ({
        id: item.id,
        asset_disposal: item.asset_disposal,
        disposal_type: typeof item.asset_disposal,
        is_array: Array.isArray(item.asset_disposal)
    })));

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

    // Helper dynamically injecting sorted arrow states
    const renderSortIcon = (field: string, currentField: string | null, currentDir: SortDirection) => {
        if (currentField !== field || !currentDir) return <ChevronsUpDown className="h-3 w-3 text-gray-400 ml-1.5 inline-block shrink-0" />;
        return currentDir === 'asc' 
            ? <ChevronUp className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" /> 
            : <ChevronDown className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" />;
    };

    // Sa ubos kay modal popup of asset disposal button
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

    const openDisposeModal = (assetId: number) => {
        setSelectedAssetId(assetId);
        setData('asset_id', assetId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmitModal = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAssetId) return;

        post(`/dispose/${selectedAssetId}/action`, {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <>
            <Head title="Asid Dashboard" />

            <WelcomeNote />

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

                {/* APPROVED STAGING REGISTRY */}
                <div className="mt-8">
                    <div className="my-4">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Approved Assets Registry for Bidding</h1>
                        <p className="text-sm text-gray-500 mt-1">Review approved items and deploy them directly into active bidding cycles.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
                        {assetsForBiddingEntry.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-emerald-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-900">
                                                <th onClick={() => handleT1Sort('control_number')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                    <span className="flex items-center">Control No. / Model {renderSortIcon('control_number', t1SortField, t1SortDir)}</span>
                                                </th>
                                                <th onClick={() => handleT1Sort('accountable_personnel')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                    <span className="flex items-center">Accountable Personnel {renderSortIcon('accountable_personnel', t1SortField, t1SortDir)}</span>
                                                </th>
                                                <th onClick={() => handleT1Sort('end_user_department')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                    <span className="flex items-center">Department {renderSortIcon('end_user_department', t1SortField, t1SortDir)}</span>
                                                </th>
                                                <th className="py-4 px-5">Description</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                            {paginatedT1Data.map((item) => (
                                                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors duration-150 group">
                                                    <td className="py-4 px-5">
                                                        <div className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                                                            {item.control_number || 'N/A'}
                                                        </div>
                                                        <div className="font-medium text-gray-900">
                                                            {item.brand_make || ''} {item.model || ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <div className="font-medium text-gray-900">{item.accountable_personnel}</div>
                                                        <div className="text-xs text-gray-400">Created by: {item.user?.name || 'System'}</div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <span className="text-sm font-medium">
                                                            {item.end_user_department}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle max-w-xs">
                                                        <p className="truncate text-gray-500 text-sm" title={item.description || ''}>
                                                            {item.description || <span className="italic text-gray-300">No descriptive brief available</span>}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-5 text-right align-middle">
                                                        {item?.asset_disposal ? 
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 shadow-xs transition-all duration-150 cursor-not-allowed focus:outline-hidden"
                                                        >
                                                            <BookmarkCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                                                            Published
                                                        </button>
                                                        :
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenConfirmModal(item)}
                                                            className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden"
                                                        >
                                                            <Gavel className="h-3.5 w-3.5 mr-1.5" />
                                                            Publish
                                                        </button>
                                                        }
                                                        
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Footer row pagination control unit */}
                                <div className="bg-zinc-50 border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>Showing {Math.min(sortedT1Data.length, (t1Page - 1) * t1PageSize + 1)}–{Math.min(sortedT1Data.length, t1Page * t1PageSize)} of {sortedT1Data.length} records</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-1.5 pe-5">
                                            <span className='text-xs'>Rows:</span>
                                            <select 
                                                value={t1PageSize} 
                                                onChange={(e) => { setT1PageSize(Number(e.target.value)); setT1Page(1); }}
                                                className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1 pr-5 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                                            >
                                                {[5, 10, 25, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                            </select>
                                        </div>
                                        {Array.from({ length: t1TotalPages }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setT1Page(idx + 1)}
                                                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors cursor-pointer ${t1Page === idx + 1 ? 'bg-zinc-700 border-zinc-800 text-white shadow-xs' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 border border-purple-100">
                                    <FolderSync className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">No Approved Assets Available for Bidding</h3>
                                <p className="text-xs text-gray-500 max-w-sm mt-1 mx-auto">There are currently no asset items holding for bidding cycle.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================
                    Completed Transactions Table 
                ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'>
                            <LucideBox className='w-5 h-5 text-emerald-600' /> Asset Disposal
                        </h3>
                        <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Accountable Personnel</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {completedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No completed asset requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    getPaginatedData(completedTransactions, completedPage, completedLimit).map((item) => {
                                        const formattedDate = item.asset?.created_at 
                                            ? new Date(item.asset?.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

                                        return (
                                            <tr key={item.asset?.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent capitalize">
                                                    {item.asset?.accountable_personnel || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'The Users Department'}</div>
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{item.asset?.brand_make || 'Asset Brand / Make'} {item.asset?.model || 'Asset Model'}</div>
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    { (item.asset?.asset_disposal) ? 
                                                        <button 
                                                            type="button"
                                                            disabled
                                                            id={`asset_dispose_${item.asset?.id}`}
                                                            className="shadow inline-flex items-center gap-1.5 cursor-not-allowed text-sm text-white hover:text-amber-200 bg-amber-700 font-medium transition-colors outline-1 px-3 py-2 rounded-lg hover:bg-amber-800"
                                                        >
                                                            <Recycle className="w-5 h-5" /> 
                                                            Asset Disposed
                                                        </button>
                                                    : 
                                                        <button 
                                                            type="button"
                                                            id={`asset_dispose_${item.asset?.id}`}
                                                            onClick={() => openDisposeModal(item.asset?.id)}
                                                            className="shadow inline-flex items-center gap-1.5 cursor-pointer text-sm text-white hover:text-emerald-200 bg-emerald-700 font-medium transition-colors outline-1 px-3 py-2 rounded-lg hover:bg-emerald-800"
                                                        >
                                                            <PackageOpenIcon className="w-5 h-5" /> 
                                                            Asset Disposal Completed
                                                        </button>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={completedPage}
                        totalPages={getTotalPages(completedTransactions, completedLimit)}
                        onPageChange={setCompletedPage}
                        totalItems={completedTransactions.length}
                        currentItemsCount={getPaginatedData(completedTransactions, completedPage, completedLimit).length}
                        startIndex={(completedPage - 1) * completedLimit}
                        itemsPerPage={completedLimit}
                        onItemsPerPageChange={handleLimitChange(setCompletedLimit, setCompletedPage)}
                    />
                </div>

                <hr className="border-gray-100 my-4" />

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
                        <h3 className='gap-2 font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex items-center'><FolderCheck className='w-5 h-5 text-cyan-600' /> Evaluation of DISPOSITION</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created by</th>
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
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.brand_make} 
                                                    {item.asset?.model}
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
                                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors outline-1 px-3 py-2 rounded ${
                                                        item.asset.status === 'Completed'
                                                            ? 'text-zinc-600 hover:text-zinc-700 outline-zinc-300 hover:bg-zinc-50'
                                                            : 'text-amber-500 hover:text-amber-700 outline-amber-300 hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        {item.asset.status === 'Completed' ? 'View Logs' : 'Evaluate'}
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
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Accountable Personnel</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
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
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.control_number}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.accountable_personnel || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.reasons_for_disposal || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.brand_make || 'Item Brand'} {item.model || 'Item Model'}
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

            {/* Confirmation Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scale-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center gap-2">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Bidding Deployment</h3>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Background Overlay (Clickable to close) */}
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                        aria-hidden="true" 
                        onClick={closeModal} 
                    />

                    {/* Modern Modal Card */}
                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl shadow-slate-200/50 transform transition-all p-8 border border-slate-100">
                        
                        {/* Header Section */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight inline-flex gap-1">
                                <MessageCircleWarningIcon className='w-8 h-8 text-amber-600' />
                                Confirm Asset Disposal
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                You are about to record this asset as disposed. Please review your action.
                            </p>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmitModal} className="space-y-6">
                            {/* Input Field Group */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-800">
                                    Disposal Notes / Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                
                                <textarea
                                    value={data.others}
                                    onChange={(e) => setData('others', e.target.value)}
                                    rows={4}
                                    placeholder="Enter any necessary details or reasons for disposal..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm 
                                            text-slate-950 placeholder:text-slate-400
                                            focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 
                                            transition-all duration-150 resize-none"
                                />
                                
                                {errors.others && (
                                    <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.others}
                                    </p>
                                )}
                            </div>

                            {/* Sticky Action Footer */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-slate-100">
                                {/* Secondary 'Cancel' Action */}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 
                                            bg-white hover:bg-slate-50 rounded-xl border border-slate-200
                                            transition-all duration-150 active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                                >   
                                    <XIcon className='w-5 h-5' />
                                    Cancel, Back to List
                                </button>

                                {/* Primary 'Confirm' Action */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 
                                            text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 
                                            rounded-xl shadow-sm transition-all duration-150
                                            active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CheckCircle className='w-5 h-5' />
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Recording...
                                        </>
                                    ) : (
                                        'Record Asset Disposal'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
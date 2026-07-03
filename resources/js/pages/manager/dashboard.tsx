import { Head, Link, useForm } from '@inertiajs/react';
import { FolderCheck, FileSearch2, FolderOpen, Gavel, Folder, XIcon } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { AssetStatusData } from '@/types/models';
import { useState } from 'react';

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

export default function managerDashboard({ assetStatuses, assets, assetOnBidding }: DashboardProps) {
    // Standardized safe array fallback
    const safeStatuses = assetStatuses || [];

    const approvedAssets = assets || [];
    const activeBiddingList = assetOnBidding || [];

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const { post, processing } = useForm({});

    // Filter Final Stages - Using Number() to handle cases where SQL Server returns seq_no as a string
    const historyTransactions = safeStatuses.filter(item => 
        item.asset?.control_number && 
        item.asset?.asid_information &&
        item.asset.control_number.trim() !== '' && 
        Number(item.seq_no) < 5
    );

    const handleOpenConfirmModal = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
    };

    const handleConfirmPublish = () => {
        if (!selectedAsset) {
    return;
    }

    post(`/admin/bidding/store/${selectedAsset.id}`, {
            onSuccess: () => handleCloseModal(),
        });
    };

    return (
        <>
            <Head title="Asid Dashboard" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                {/* mini sub header */}
                {/* <WelcomeNoteMini /> */}
                
                {/* Metric Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Final Stages */}
                    <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-950/10 cursor-pointer">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/80">Final Stages</p>
                                <h2 className="font-extrabold text-3xl tracking-tight">{historyTransactions.length}</h2>
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
                                <h2 className="font-extrabold text-3xl tracking-tight">{safeStatuses.length}</h2>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <FolderOpen className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/*           APPROVED STAGING REGISTRY        */}
                {/* ========================================== */}
                <div>
                    <div className="my-4">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Approved Assets Registry</h1>
                        <p className="text-sm text-gray-500 mt-1">Review approved items and deploy them directly into active bidding cycles.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
                        {approvedAssets.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-emerald-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-900">
                                            <th className="py-4 px-5">Control No. / Model</th>
                                            <th className="py-4 px-5">Accountable Personnel</th>
                                            <th className="py-4 px-5">Department</th>
                                            <th className="py-4 px-5">Description</th>
                                            <th className="py-4 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {approvedAssets.map((item) => (
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
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {item.end_user_department}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 align-middle max-w-xs">
                                                    <p className="truncate text-gray-500 text-xs" title={item.description || ''}>
                                                        {item.description || <span className="italic text-gray-300">No descriptive brief available</span>}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5 text-right align-middle">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenConfirmModal(item)}
                                                        className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden"
                                                    >
                                                        <Gavel className="h-3.5 w-3.5 mr-1.5" />
                                                        Publish for Bidding
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                                    <Folder className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">No Approved Assets Available</h3>
                                <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                    There are currently no inventory items holding an approved status ready to pass onto staging.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Final Stages Table Section */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <h3 className='gap-2 font-bold text-sm px-4 py-2 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex'><FolderCheck className='w-5 h-5' /> Final Stages</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
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
                                                        href={`/manager-evaluate/${item.asset_id}`} 
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
                </div>

                <hr className="border-gray-100" />

                {/* All Transactions Table Section */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-4 py-2 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex gap-2 '><FolderOpen className='w-5 h-5' />All Transactions</h3>
                        <table className="w-full min-w-full divide-y divide-slate-100 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status</th>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {/* FIX 1: Verify layout emptiness using safeStatuses instead of historyTransactions */}
                                {safeStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    safeStatuses.map((item) => {
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
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number || '—'}
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
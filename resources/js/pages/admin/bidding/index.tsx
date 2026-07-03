import { useForm, Head, usePage, Link } from '@inertiajs/react';
import { Folder, CircleCheck, XIcon, Gavel, FileText, Activity, Users, Calendar } from 'lucide-react';
import { useState } from 'react';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface Approver {
    id: number;
    name: string;
}

interface AccountingInfo {
    id: number;
    asset_id: number;
    book_value: number | string | null;
}

interface ManagerInformation {
    id: number;
    asset_id: number;
    bidding_price: number | string | null;
}

interface BidderRecord {
    id: number;
    asset_id: number;
    bidder_name: string;
    bidding_price: string | number;
    submitted_at: string;
    user_id: number;
    bidder_contact_number: string;
    created_at: string;
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
    Approver?: Approver;
    accounting_information?: AccountingInfo;
    manager_information?: ManagerInformation;
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    asset?: Asset; 
    biddings?: BidderRecord[];
}

interface BiddingProps {
    assets: Asset[];
    assetOnBidding: AssetBiddingData[]; 
}

export default function BiddingIndex({ assets, assetOnBidding }: BiddingProps) {

    const { flash } = usePage().props as any;

    const approvedAssets = assets || [];
    const activeBiddingList = assetOnBidding || [];

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [selectedBiddingItem, setSelectedBiddingItem] = useState<AssetBiddingData | null>(null);
    const { post, processing } = useForm({});

    const handleOpenConfirmModal = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
    };

    const handleOpenBiddersModal = (item: AssetBiddingData) => {
        setSelectedBiddingItem(item);
    };

    const handleCloseBiddersModal = () => {
        setSelectedBiddingItem(null);
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
            <Head title="Bidding Dashboard" />

            {/* Main Content */}
            <div className="container-fluid p-4 space-y-10"> 

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* ========================================== */}
                {/* APPROVED STAGING REGISTRY        */}
                {/* ========================================== */}
                <div className='hidden'>
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Approved Assets Registry</h1>
                        <p className="text-sm text-gray-500 mt-1">Review approved items and deploy them directly into active bidding cycles.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
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

                {/* ========================================== */}
                {/* ACTIVE BIDDING REGISTRY         */}
                {/* ========================================== */}
                <hr className="border-gray-100" />

                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
                            Active Bidding Deployments
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Assets that have been deployed and are currently open to accommodate bidding records.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {activeBiddingList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-blue-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-blue-950">
                                            <th className="py-4 px-5">Control No. / Model</th>
                                            <th className="py-4 px-5">Department</th>
                                            <th className="py-4 px-5">Bidding Status</th>
                                            <th className="py-4 px-5">Minimum Bid</th>
                                            <th className="py-4 px-5">Deployment Date</th>
                                            <th className="py-4 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {activeBiddingList.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                                                <td className="py-4 px-5">
                                                    <div className="font-mono font-bold text-gray-700 text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md inline-block mb-1">
                                                        {item.asset?.control_number || 'N/A'}
                                                    </div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.asset?.brand_make || ''} {item.asset?.model || ''}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 align-middle">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {item.asset?.end_user_department || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 align-middle">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                                                        <Activity className="h-3 w-3 mr-1 animate-pulse" />
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 align-middle font-medium text-gray-900">
                                                    {item.asset?.manager_information?.bidding_price ? (
                                                        `₱${Number(item.asset.manager_information?.bidding_price).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })}`
                                                    ) : (
                                                        <span>₱10,000</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 align-middle text-xs text-gray-500">
                                                    {item.listed_at ? new Date(item.listed_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                                </td>
                                                <td className="py-4 px-5 text-right align-middle">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenBiddersModal(item)}
                                                        className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-xs transition-all duration-150 cursor-pointer"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                        View Bids
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-gray-200">
                                    <Gavel className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">No Active Deployments</h3>
                                <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                    There are currently no items deployed to active auction states.
                                </p>
                            </div>
                        )}
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

            {selectedBiddingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 flex flex-col max-h-[85vh] animate-scale-up">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Active Bids Registry</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Asset: <span className="font-mono font-bold text-blue-900 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">{selectedBiddingItem.asset?.control_number || 'N/A'}</span> — {selectedBiddingItem.asset?.brand_make} {selectedBiddingItem.asset?.model}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCloseBiddersModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="overflow-y-auto my-4 flex-1 rounded-xl border border-gray-100">
                            {selectedBiddingItem.biddings && selectedBiddingItem.biddings.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0 backdrop-blur-md">
                                            <th className="py-3 px-4">Bidder Info</th>
                                            <th className="py-3 px-4">Date/Time Submitted</th>
                                            <th className="py-3 px-4 text-right">Offer Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {[...selectedBiddingItem.biddings]
                                            .sort((a, b) => Number(b.bidding_price) - Number(a.bidding_price))
                                            .map((bidder, index) => (
                                                <tr key={bidder.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2">
                                                            {index === 0 && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 border border-amber-200 text-amber-800 rounded">
                                                                    Highest
                                                                </span>
                                                            )}
                                                            <span className="font-semibold text-gray-900">{bidder.bidder_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-500 align-middle">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                                            {new Date(bidder.created_at).toLocaleString(undefined, { 
                                                                dateStyle: 'medium', 
                                                                timeStyle: 'short' 
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right align-middle font-mono font-bold text-gray-900">
                                                        ₱{Number(bidder.bidding_price).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
                                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3 border border-gray-200">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900">No Bids Placed Yet</h4>
                                    <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                        This asset deployment has not received any bidders under asset ID: {selectedBiddingItem.asset_id}.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCloseBiddersModal}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

BiddingIndex.layout = {
    breadcrumbs: [
        {
            title: 'Bidding',
            href: '/admin/bidding/index',
        },
    ],
};
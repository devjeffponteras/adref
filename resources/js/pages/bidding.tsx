import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Loader, FileWarning, RefreshCw, Gavel, XIcon, FolderOpen, Send } from 'lucide-react';
import { useState } from 'react';
import { WelcomeNote } from '@/components/welcome-note';
import { bidding } from '@/routes';

interface AccountingInfo {
    id: number;
    book_price: number | string | null;
}

interface BidRecord {
    id: number;
    user_id: number;
    asset_id: number;
}

interface Asset {
    id: number;
    control_number: string | null;
    brand_make: string | null;
    model: string | null;
    end_user_department: string;
    description: string | null;
    accounting_information?: AccountingInfo;
    bids?: BidRecord[];
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    asset?: Asset;
}

interface BiddingProps {
    assetOnBidding: AssetBiddingData[];
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: {
            id: number;
            name: string;
            // add other user fields if necessary
        };
    };
    flash: {
        success?: string;
    };
    assetOnBidding?: AssetBiddingData[];
}

export default function Bidding({ assetOnBidding: propsAssetOnBidding = [] }: BiddingProps) {

    const { props } = usePage<PageProps>();
    const authUser = props.auth?.user;

    const assetOnBidding = propsAssetOnBidding.length > 0 
        ? propsAssetOnBidding 
        : (props.assetOnBidding || []);

    const flash = props.flash;
    const [selectedListing, setSelectedListing] = useState<AssetBiddingData | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        bidder_name: '',
        bidder_contact_number: '',
        bidding_cycle: '1',
        bidder_classification: '',
        department: '',
        date_hired: '',
        bidding_price: '',
        remarks: '',
        reference_number: ''
    });

    const hasCurrentUserBidded = (asset?: Asset) => {
        if (!asset || !asset.bids || !authUser) {
return false;
}

        return asset.bids.some(bid => Number(bid.user_id) === Number(authUser.id));
    };

    const handleOpenBidModal = (listing: AssetBiddingData) => {
        setSelectedListing(listing);
        reset(); 
    };

    const handleCloseBidModal = () => {
        setSelectedListing(null);
        reset();
    };

    const handleSubmittingBid = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedListing || !selectedListing.asset) {
return;
}

        post(`/user/bidding/entry/${selectedListing.asset.id}`, {
            onSuccess: () => handleCloseBidModal(),
        });
    };

    const isEmployee = data.bidder_classification === 'PMC Employee' || data.bidder_classification === 'MMPRC Employee';

    const currentDate = new Date();

    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    return (
        <>
            <Head title="Assets for Bidding" />
            <WelcomeNote />

            <div className="w-full p-6 bg-gray-50/50 min-h-screen">
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <span className="font-semibold">✓ {flash.success}</span>
                    </div>
                )}

                <div className="mb-6 overflow-hidden rounded-xl border border-emerald-900 bg-emerald-900 p-4 shadow shadow">
                    <div className="flex items-center justify-between">
                        <h5 className="text-lg font-bold tracking-wide text-white">
                            List of Assets for Bidding — {currentMonth} {currentYear} Bidding Cycle
                        </h5>
                    </div>
                </div>

                <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md">
                    <div className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-xs px-6 py-4">
                        <h5 className="text-center text-sm font-bold uppercase tracking-wider text-[#004d40]">
                            Active Marketplace Inventories Open for Bidding Proposals
                        </h5>
                    </div>

                    <div className="overflow-x-auto w-full">
                        {assetOnBidding.length > 0 ? (
                            <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                                <thead className="bg-gray-200 text-xs font-bold uppercase tracking-wider text-emerald-800">
                                    <tr>
                                        <th className="py-3.5 pl-6 pr-3 font-semibold">Control Number</th>
                                        <th className="px-4 py-3.5 font-semibold">Name of Asset / Details</th>
                                        <th className="px-4 py-3.5 font-semibold">Department</th>
                                        <th className="px-4 py-3.5 font-semibold">Appraised Value</th>
                                        <th className="py-3.5 pr-6 font-semibold text-center">Bidding Application</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                    {assetOnBidding.map((listing) => (
                                        <tr key={listing.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                                                {listing.asset?.control_number || 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-700">
                                                {listing.asset?.brand_make || ''} {listing.asset?.model || 'Generic Asset'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    {listing.asset?.end_user_department || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-gray-900">
                                                {listing.asset?.accounting_information?.book_price ? (
                                                    `₱${Number(listing.asset.accounting_information.book_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                ) : (
                                                    '₱0.00'
                                                )}
                                            </td>
                                            
                                            {/* Interactive Action Button Cell */}
                                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                {hasCurrentUserBidded(listing.asset) ? (
                                                    <button 
                                                        type="button" 
                                                        disabled
                                                        className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-gray-100 text-xs font-semibold text-gray-400 shadow-xs cursor-not-allowed border border-gray-200"
                                                    >
                                                        Done Bid
                                                    </button>
                                                ) : (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleOpenBidModal(listing)}
                                                        className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                                                    >
                                                        <Gavel className="w-3.5 h-3.5 mr-1" />
                                                        Post Bid Entry
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
                                <FolderOpen className="h-10 w-10 text-emerald-200 mb-2" />
                                <h4 className="text-sm font-bold text-gray-800">No Assets Under Active Bidding</h4>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* POPUP MODAL */}
            {selectedListing && selectedListing.asset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 my-8">
                        
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-2">
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Gavel className="h-4 w-4" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Confirm & Submit Bid Entry</h3>
                            </div>
                            <button type="button" onClick={handleCloseBidModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmittingBid} className="space-y-5">
                            
                            {/* SECTION: Bidder Details */}
                            <div>
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Bidder Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                        <input type="text" value={data.bidder_name} onChange={e => setData('bidder_name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" placeholder="Enter bidder full name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                                        <input type="text" value={data.bidder_contact_number} onChange={e => setData('bidder_contact_number', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" placeholder="Enter contact number" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Automated Info Card Layout Layer */}
                            <div>
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Asset Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Asset Control Number</label>
                                        <div className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-700">
                                            {selectedListing.asset.control_number || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Item Description</label>
                                        <div className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 truncate">
                                            {selectedListing.asset.brand_make} {selectedListing.asset.model}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bidding Cycle</label>
                                        <input type="number" min="1" value={data.bidding_cycle} onChange={e => setData('bidding_cycle', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Bidder Classification */}
                            <div>
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Bidder Classification</h4>
                                <div className="w-full sm:w-1/2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Asset Classification</label>
                                    <select value={data.bidder_classification} onChange={e => setData('bidder_classification', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden">
                                        <option value="">Select Classification..</option>
                                        <option value="PMC Employee">PMC Employee</option>
                                        <option value="MMPRC Employee">MMPRC Employee</option>
                                        <option value="Contractor">Contractor</option>
                                        <option value="Outsider">Outsider / Third-Party</option>
                                    </select>
                                </div>
                            </div>

                            {/* SECTION: Employee Conditional Subsection */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isEmployee ? 'text-emerald-900' : 'text-gray-400'}`}>
                                    If PMC or MMPRC Employee
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Department/Division</label>
                                        <input 
                                            type="text" 
                                            disabled={!isEmployee}
                                            required={isEmployee}
                                            value={isEmployee ? data.department : ''} 
                                            onChange={e => setData('department', e.target.value)} 
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
                                            placeholder={isEmployee ? "Enter department" : "N/A - Non Employee"} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date Hired</label>
                                        <input 
                                            type="date" 
                                            disabled={!isEmployee}
                                            required={isEmployee}
                                            value={isEmployee ? data.date_hired : ''} 
                                            onChange={e => setData('date_hired', e.target.value)} 
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Bidding Price */}
                            <div className="pt-2 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Bidding Price</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Your Offer Amount (PHP) <span className="text-red-500">*</span>
                                        </label>
                                        <input type="number" required min="0" step="0.01" value={data.bidding_price} onChange={e => setData('bidding_price', e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-base font-semibold text-emerald-700 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
                                    </div>
                                    <div className="text-xs text-gray-500 pb-2 italic">
                                        Base Value / Book Value Reference: 
                                        <span className="font-bold text-gray-800">
                                            {selectedListing.asset.accounting_information?.book_price ? ` ₱${Number(selectedListing.asset.accounting_information.book_price).toLocaleString()}` : ' ₱0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Submit Actions */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={handleCloseBidModal} disabled={processing} className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing || !data.bidding_price} className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer">
                                    {processing ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5 mr-1.5" />
                                            Submit Bid Entry
                                        </>
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

Bidding.layout = {
    breadcrumbs: [{ title: 'Bidding', href: bidding() }],
};
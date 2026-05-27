import { Head, Link, useForm } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { XIcon, CircleCheck, SquareArrowRightIcon } from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';

interface User {
    id: number;
    name: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface AssetData {
    id: number;
    user_id: number;
    control_number: string;
    accountable_personnel: string;
    model: string;
    description: string;
    brand_make: string;
    serial_plate_id_number: string;
    end_user_department: string;
    asset_classification_id: number;
    reasons_for_disposal: string;
    asset_location: string;
    status: string;
    assessment_report_path: string | null;
    asset_photo_path: string | null;
    created_at: string;
    user?: User;
    classification?: AssetClassification;
}

interface EvaluateProps {
    asset: AssetData;
}

export default function AccountingEvaluate({ asset }: EvaluateProps) {
    // Initialize Inertia form hook with your fields
    const { data, setData, post, processing, errors } = useForm({
        asset_number: '',
        acquisition_date: '',
        acquisition_cost: '',
        book_value: '',
        remarks: '',
        checked_by: 'Lou Agusin', // Pre-filled
        conformed_by: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Adjust this endpoint URL according to your web.php routes configuration
        post(`/accounting-evaluate/${asset.id}/action`);
    };

    return (
        <>
            <Head title="Asset Evaluation - Accounting" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                <AssetProfileCard asset={asset} />

                <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-100 rounded-xl shadow-xs p-6 my-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Accounting Information</h2>
                    
                    {/* First Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Asset Number Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Asset Number</label>
                            <input 
                                type="text"
                                placeholder="e.g. AD-26-01"
                                value={data.asset_number}
                                onChange={e => setData('asset_number', e.target.value)}
                                className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-2xs focus:outline-emerald-500 focus:border-emerald-500"
                            />
                            {errors.asset_number && <p className="text-xs text-red-500 mt-1">{errors.asset_number}</p>}
                        </div>

                        {/* Acquisition Date Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Date</label>
                            <input 
                                type="date"
                                value={data.acquisition_date}
                                onChange={e => setData('acquisition_date', e.target.value)}
                                className="w-full p-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg shadow-2xs focus:outline-emerald-500 focus:border-emerald-500"
                            />
                            {errors.acquisition_date && <p className="text-xs text-red-500 mt-1">{errors.acquisition_date}</p>}
                        </div>

                        {/* Acquisition Cost Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Cost</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.acquisition_cost}
                                    onChange={e => setData('acquisition_cost', e.target.value)}
                                    className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-r-lg focus:outline-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            {errors.acquisition_cost && <p className="text-xs text-red-500 mt-1">{errors.acquisition_cost}</p>}
                        </div>

                        {/* Book Value Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Book Value</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.book_value}
                                    onChange={e => setData('book_value', e.target.value)}
                                    className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-r-lg focus:outline-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            {errors.book_value && <p className="text-xs text-red-500 mt-1">{errors.book_value}</p>}
                        </div>
                    </div>

                    {/* Second Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Remarks Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <input 
                                type="text"
                                value={data.remarks}
                                onChange={e => setData('remarks', e.target.value)}
                                className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-2xs focus:outline-emerald-500 focus:border-emerald-500"
                            />
                            {errors.remarks && <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>}
                        </div>

                        {/* Checked By Input (Disabled/Read-only display placeholder) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Checked by</label>
                            <input 
                                type="text"
                                disabled
                                value={data.checked_by}
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                            />
                        </div>

                        {/* Conformed By Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Conformed by</label>
                            <input 
                                type="text"
                                value={data.conformed_by}
                                readOnly
                                onChange={e => setData('conformed_by', e.target.value)}
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                            />
                            {errors.conformed_by && <p className="text-xs text-red-500 mt-1">{errors.conformed_by}</p>}
                        </div>
                    </div>

                    {/* Form Controls Action Block */}
                    <div className="flex items-center justify-between">
                        <div className='inline-flex items-cente gap-3'>
                            <Link 
                                href="/accounting-dashboard" 
                                className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                            >
                                <XIcon className='h-4 w-4 mr-1'></XIcon>
                                Cancel
                            </Link>
                            
                            <button 
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center cursor-pointer px-4 py-2 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden"
                            >
                                <CircleCheck className='h-5 w-5 mr-2'></CircleCheck>
                                Approve
                            </button>
                        </div>
                        {/* <button 
                            type="button" 
                            className="inline-flex items-center cursor-pointer px-4 py-2 bg-amber-700 text-sm font-semibold text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 focus:outline-hidden"
                        >
                            <SquareArrowRightIcon className='h-5 w-5 mr-2'></SquareArrowRightIcon>
                            Save and Submit to Ivan Moreno's Workflow for the Approval
                        </button> */}
                    </div>
                </form>
            </div>
        </>
    );
}

AccountingEvaluate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard', 
        },
        { 
            title: 'Asset Evaluation',
        },
    ],
};
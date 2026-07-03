import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, ArrowLeftCircle, XIcon } from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';

interface User {
    id: number;
    name: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface AsidInformation {
    id: number;
    remarks: string;
    checked_by: string;
    disposition: string;
    reviewed_by: string;
}

interface ManagerInformation {
    id: number;
    asset_direction: string;
    manager_disposition: string;
    bidding_price: number;
    reviewed_by: string;
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
    asid_information?: AsidInformation | null;
    manager_information?: ManagerInformation | null;
}

interface AssetProps {
    asset: AssetData;
}

export default function AsidEvaluateManager({ asset }: AssetProps) {
    const { auth } = usePage().props as any;

    const isLockedAsid = !!asset?.asid_information;
    const isLockedManager = !!asset?.manager_information;

    const { data, setData, post, processing, errors } = useForm({
        remarks: asset.asid_information?.remarks || (asset as any).asidInformation?.remarks || '',
        checked_by: asset.asid_information?.checked_by || '',
        disposition: asset.asid_information?.disposition || '',
        reviewed_by: asset.asid_information?.reviewed_by || '',
        asset_direction: asset.manager_information?.asset_direction || '',
        bidding_price: asset.manager_information?.bidding_price || '',
        manager_disposition: asset.manager_information?.manager_disposition || '',
        manager_reviewed_by: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/manager-evaluate/${asset.id}/action`);
    };

    return (
        <>
            <Head title={`Evaluate - ${asset?.control_number || 'Asset'}`} />

            {/* main content */}
            <div className="container-fluid p-4">
            
                <AssetProfileCard asset={asset} />

                {/* Main Form Container Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 mt-4">
                    
                    <h3 className="text-gray-900 font-bold text-lg tracking-tight">
                        Evaluation Information by ASID Evaluator

                        <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                            <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                            APPROVED SUBMITTED TO ASID MANAGER
                        </span>

                    </h3>

                    {/* Section 1: Remarks & Checked By */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                        <div className="xl:col-span-6 flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                Remarks
                            </label>
                            <textarea 
                                rows={2}
                                value={data.remarks}
                                disabled={isLockedAsid}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${isLockedAsid
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                        }`}
                                placeholder="Enter evaluation remarks..."
                            />
                            {errors.remarks && <span className="text-red-500 text-xs">{errors.remarks}</span>}
                        </div>

                        <div className="xl:col-span-6 flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                Checked by
                            </label>
                            <input 
                                type="text" 
                                value={isLockedAsid ? data.checked_by : auth?.user?.name}
                                disabled={isLockedAsid}
                                onChange={(e) => setData('checked_by', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${isLockedAsid
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                        }`}
                                placeholder="Name of inspector"
                            />
                        </div>

                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Disposition */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                        <div className="xl:col-span-6 flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                Disposition
                            </label>
                            <textarea 
                                rows={2} 
                                disabled={isLockedAsid}
                                value={data.disposition}
                                onChange={(e) => setData('disposition', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${isLockedAsid
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                        }`}
                                placeholder="Recommended disposal action..."
                            />
                        </div>

                        <div className="xl:col-span-6 flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                Reviewed and Noted By
                            </label>
                            <input 
                                type="text" 
                                disabled
                                value={data.reviewed_by}
                                onChange={(e) => setData('reviewed_by', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${isLockedAsid
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                        }`}
                                placeholder="Name of manager"
                            />
                        </div>
                    </div>

                    {/* Section 3: Reviewed and Noted By */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                        

                        <div className="xl:col-span-5 hidden xl:block"></div>

                    </div>

                </div>

                <form onSubmit={handleSubmit} className="w-full mt-4">

                    {/* Managers Input Form Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h3 className="text-gray-900 font-bold text-lg tracking-tight">
                            Evaluation Information for Managers
                            
                            {isLockedManager && 
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                SUBMITTED TO WORKFLOW FOR APPROVAL
                            </span>
                            }
                            
                        </h3>

                        {/* Section 1: Dropdown for choices and Disposition*/}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                            <div className="xl:col-span-6 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Asset Direction
                                </label>
                                <select 
                                    name="asset_direction" 
                                    id="asset_direction" 
                                    value={data.asset_direction || ""} // Tracks selected choice
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData(prev => ({
                                            ...prev,
                                            asset_direction: val,
                                            // If user switches away from Bidding, default the bidding price to 0
                                            ...(val !== 'For Bidding' && { bidding_price: 0 })
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                                >
                                    <option value="" disabled>Select Asset Direction</option>
                                    <option value="For Bidding">For Bidding</option>
                                    <option value="For Donation">For Donation</option>
                                    <option value="Special Arrangement">Special Arrangement</option>
                                    <option value="For Disposal">For Disposal</option>
                                </select>
                                
                                {errors.remarks && <span className="text-red-500 text-xs">{errors.remarks}</span>}
                            </div>

                            <div className="xl:col-span-6 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Disposition
                                </label>
                                <input 
                                    type="text" 
                                    name="manager_disposition"
                                    value={data.manager_disposition || ""}
                                    onChange={(e) => setData('manager_disposition', e.target.value)}
                                    className="w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500"
                                    placeholder="Type disposition.."
                                />
                            </div>

                        </div>

                        {/* Section 2: Reviewed and Noted By & Conditional Bidding Price */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                            <div className="xl:col-span-6 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Reviewed and Noted By
                                </label>
                                <input 
                                    type="text" 
                                    value={auth?.user.name}
                                    name="manager_reviewed_by"
                                    disabled
                                    readOnly
                                    className="w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                                />
                            </div>

                            {/* ONLY VISIBLE IF "For Bidding" IS CHOSEN */}
                            {data.asset_direction === 'For Bidding' && (
                                <div className="xl:col-span-6 flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                        Bidding Base Price
                                    </label>
                                    <input 
                                        type="number" 
                                        name='bidding_price'
                                        value={data.bidding_price}
                                        onChange={(e) => setData('bidding_price', Number(e.target.value))}
                                        className="w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500"
                                        placeholder="Type bidding base price.."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Bottom Footer Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <Link 
                                href="/manager-dashboard" 
                                className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                            >
                                {isLockedManager ? <ArrowLeftCircle className='h-4 w-4 mr-1'></ArrowLeftCircle> : <XIcon className='h-4 w-4 mr-1'></XIcon> }
                                {isLockedManager ? 'Back to Dashboard' : 'Cancel' }
                            </Link>
                            {!isLockedManager ? 
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="inline-flex items-center px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm shadow-emerald-900/10 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
                            >
                                <CircleCheck className='h-5 w-5 mr-2'></CircleCheck>
                                {processing ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        Approve & Submit to <span className="text-yellow-400 font-bold ml-1">Workflow</span>
                                    </>
                                )}
                            </button>
                            : ''}
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}

AsidEvaluateManager.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard', 
        },
    ],
};
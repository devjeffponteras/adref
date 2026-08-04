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

interface DropdownOption {
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

interface McdInformation {
    id: number;
    asset_id: number;
    par_number: string;
    remarks: string;
}

interface AccountingInformation {
    id: number;
    asset_id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    remarks: string;
}

interface MepeoInformation {
    id: number;
    asset_id: number;
    approver_id: number;
    waste_classification_id: number | string;
    waste_characteristic_id: number | string;
    remarks: string;
}

interface ManagerInformation {
    id: number;
    asset_id: number;
    user_id: number;
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
    mepeo_information?: MepeoInformation | null;
    mcd_information?: McdInformation | null;
    accounting_information?: AccountingInformation | null;
}

interface AssetProps {
    asset: AssetData;
    wasteClassifications: DropdownOption[];
    wasteCharacteristics: DropdownOption[];
}

const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) {
return '';
}

    return dateString.split(' ')[0].split('T')[0];
};

export default function AsidEvaluate({ asset, wasteClassifications = [], wasteCharacteristics = [] }: AssetProps) {
    const { auth } = usePage().props as any;

    const isLockedAsid = !!asset?.asid_information;
    const isOnASidManager = !!asset?.manager_information;
    const isLocked = !!asset.mcd_information;
    const isLockedMepeo = !!asset.mepeo_information;

    const { data, setData, post, processing, errors } = useForm({
        remarks: asset.asid_information?.remarks || (asset as any).asidInformation?.remarks || '',
        checked_by: asset.asid_information?.checked_by || auth?.user?.name,
        disposition: asset.asid_information?.disposition || '',
        reviewed_by: asset.asid_information?.reviewed_by || '',

        asset_number: asset.accounting_information?.asset_number || '',
        acquisition_date: formatDateForInput(asset.accounting_information?.acquisition_date || ''),
        acquisition_cost: asset.accounting_information?.acquisition_cost ? String(asset.accounting_information.acquisition_cost) : '',
        book_value: asset.accounting_information?.book_value ? String(asset.accounting_information.book_value) : '',
        accounting_remarks: asset.accounting_information?.remarks || '',
        accounting_checked_by: 'Lou Agusin',
        conformed_by: '',

        par_number: asset.mcd_information?.par_number || '',
        par_remarks: asset.mcd_information?.remarks || '',

        waste_classification_id: asset.mepeo_information?.waste_classification_id || '',
        waste_characteristic_id: asset.mepeo_information?.waste_characteristic_id || '',
        mepeo_remarks: asset.mepeo_information?.remarks || '',

    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/asid-evaluate/${asset.id}/action`);
    };

    return (
        <>
            <Head title={`Evaluate - ${asset?.control_number || 'Asset'}`} />

            {/* main content */}
            <div className="container-fluid p-4">
            
                <AssetProfileCard asset={asset} />

                {/* Accounting Section */}
                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Accounting Information
                        <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                            <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                            Approved
                        </span>
                    </h2>
                    {/* First Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Asset Number Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Asset Number</label>
                            <input 
                                type="text"
                                placeholder="e.g. AD-26-01"
                                value={data.asset_number}
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${asset.accounting_information 
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' // Grayish when locked
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' // Normal state
                                        }`}
                            />
                            {errors.asset_number && <p className="text-xs text-red-500 mt-1">{errors.asset_number}</p>}
                        </div>

                        {/* Acquisition Date Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Date</label>
                            <input 
                                type="date"
                                value={data.acquisition_date}
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${asset.accounting_information 
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' // Grayish when locked
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' // Normal state
                                        }`}
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
                                    disabled
                                    value={data.acquisition_cost}
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg
                                            ${asset.accounting_information 
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' // Grayish when locked
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' // Normal state
                                            }`}
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
                                    disabled
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg
                                            ${asset.accounting_information 
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' // Grayish when locked
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' // Normal state
                                            }`}
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
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                        ${asset.accounting_information 
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' // Grayish when locked
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' // Normal state
                                        }`}
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
                                disabled
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                                placeholder='N/A for now..'
                            />
                            {errors.conformed_by && <p className="text-xs text-red-500 mt-1">{errors.conformed_by}</p>}
                        </div>
                    </div>
                </div>

                {/* MCD - PAR section */}
                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                        PAR Information
                        {isLocked && (
                        <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                            <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                            Approved
                        </span>
                        )}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">PAR Number</label>
                            <input 
                                type="text"
                                placeholder="Type PAR Number.."
                                value={data.par_number}
                                disabled
                                className="w-full p-2 text-sm border rounded-lg shadow-2xs bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <input 
                                type="text"
                                placeholder="Type Remarks.."
                                value={data.par_remarks}
                                disabled
                                className="w-full p-2 text-sm border rounded-lg shadow-2xs bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Mepeo Section */}
                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Waste Information</h2>
                        {isLockedMepeo && (
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Approved
                            </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        
                        {/* Waste Classification Dropdown Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Waste Classification</label>
                            <select
                                value={data.waste_classification_id ?? ''}
                                onChange={e => setData('waste_classification_id', e.target.value)}
                                disabled={isLockedMepeo}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 h-9.5
                                    ${isLockedMepeo 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                    }`}
                            >
                                <option value="">-- Select Classification --</option>
                                {wasteClassifications.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Waste Characteristic Dropdown Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Waste Characteristics and Forms</label>
                            <select
                                value={data.waste_characteristic_id}
                                onChange={e => setData('waste_characteristic_id', e.target.value)}
                                disabled={isLockedMepeo}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 h-9.5
                                    ${isLockedMepeo 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                    }`}
                            >
                                <option value="">-- Select Characteristic --</option>
                                {wasteCharacteristics.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mepeo Remarks Text Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <input 
                                type="text"
                                placeholder="Type Remarks.."
                                value={data.mepeo_remarks}
                                onChange={e => setData('mepeo_remarks', e.target.value)}
                                disabled={isLockedMepeo}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                    ${isLockedMepeo 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Form Container Card */}
                <form onSubmit={handleSubmit} className="w-full pt-2 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        
                        <h3 className="text-gray-900 font-bold text-lg tracking-tight">
                            Evaluation Information

                            {isLockedAsid && !isOnASidManager &&
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                APPROVED SUBMITTED TO ASID MANAGER
                            </span>
                            }

                        </h3>

                        {/* Section 1: Remarks & Checked By */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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

                            <div className="xl:col-span-6 flex flex-col gap-1.5 hidden">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Checked by
                                </label>
                                <input 
                                    type="text" 
                                    value={isLockedAsid ? data.checked_by : auth?.user?.name}
                                    readOnly
                                    onChange={(e) => setData('checked_by', e.target.value)}
                                    className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                            ${isLockedAsid
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                            }`}
                                    placeholder="Name of inspector"
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
                                    placeholder="Auto Assigned by System"
                                />
                            </div>

                        </div>

                        <hr className="border-gray-100 hidden" />

                        {/* Section 2: Disposition */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            <div className="xl:col-span-6 flex flex-col gap-1.5 hidden">
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

                            
                        </div>

                        {/* Bottom Footer Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            {/* Redirect back to dashboard safely on cancel */}
                            <Link 
                                    href="/asid-dashboard" 
                                    className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                                >
                                    {isLockedAsid ? <ArrowLeftCircle className='h-4 w-4 mr-1'></ArrowLeftCircle> : <XIcon className='h-4 w-4 mr-1'></XIcon> }
                                    {isLockedAsid ? 'Back to Dashboard' : 'Cancel' }
                            </Link>
                            {!isLockedAsid ? 
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
                                        Approve & Submit to <span className="text-yellow-400 font-bold ml-1">MANAGER</span>
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

AsidEvaluate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard', 
        },
    ],
};
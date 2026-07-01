import { Head, Link, useForm } from '@inertiajs/react';
import { XIcon, CircleCheck, SquareArrowRightIcon, ArrowLeftCircle } from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface DropdownOption {
    id: number;
    name: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface WasteClassification {
    id: number;
    name: string;
}

interface WasteCharacteristic {
    id: number;
    name: string;
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
    waste_classification?: WasteClassification | null;
    waste_characteristic?: WasteCharacteristic | null;
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
    accounting_information?: AccountingInformation | null;
    mcd_information?: McdInformation | null;
    mepeo_information?: MepeoInformation | null;
}

interface EvaluateProps {
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

export default function MepeoEvaluate({ asset, wasteClassifications = [], wasteCharacteristics = [] }: EvaluateProps) {
    const isLocked = !!asset.mcd_information;
    const isLockedMepeo = !!asset.mepeo_information;

    // Initialize Inertia form hook with your fields
    const { data, setData, post, processing, errors } = useForm({
        asset_number: asset.accounting_information?.asset_number || '',
        acquisition_date: formatDateForInput(asset.accounting_information?.acquisition_date || ''),
        acquisition_cost: asset.accounting_information?.acquisition_cost ? String(asset.accounting_information.acquisition_cost) : '',
        book_value: asset.accounting_information?.book_value ? String(asset.accounting_information.book_value) : '',
        remarks: asset.accounting_information?.remarks || '',
        checked_by: 'Lou Agusin',
        conformed_by: '',

        par_number: asset.mcd_information?.par_number || '',
        par_remarks: asset.mcd_information?.remarks || '',

        // These IDs are what your backend relies on for relationships
        waste_classification_id: asset.mepeo_information?.waste_classification_id || '',
        waste_characteristic_id: asset.mepeo_information?.waste_characteristic_id || '',
        mepeo_remarks: asset.mepeo_information?.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/mepeo-evaluate/${asset.id}/action`);
    };

    return (
        <>
            <Head title="Asset Evaluation - MEPEO" />

            {/* sub header */}
            {/* <WelcomeNote /> */}
            
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
                                className="w-full p-2 text-sm border rounded-lg shadow-2xs bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
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
                                className="w-full p-2 text-sm border rounded-lg shadow-2xs bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
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
                                    className="w-full p-2 text-sm border shadow-2xs rounded-r-lg bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
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
                                    className="w-full p-2 text-sm border shadow-2xs rounded-r-lg bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
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
                                className="w-full p-2 text-sm border rounded-lg shadow-2xs bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                            />
                            {errors.remarks && <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>}
                        </div>

                        {/* Checked By Input */}
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
                    {isLocked && (
                        <h2 className="text-lg font-bold text-gray-800 mb-6">
                            PAR Information
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Approved
                            </span>
                        </h2>
                    )}

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

                {/* Mepeo Section Wrapping Entire Form context */}
                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Waste Information</h2>
                        {isLockedMepeo && (
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Evaluated
                            </span>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            
                            {/* Waste Classification Dropdown Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Waste Classification</label>
                                <select
                                    value={data.waste_classification_id}
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
                                {errors.waste_classification_id && <p className="text-xs text-red-500 mt-1">{errors.waste_classification_id}</p>}
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
                                {errors.waste_characteristic_id && <p className="text-xs text-red-500 mt-1">{errors.waste_characteristic_id}</p>}
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
                                {errors.mepeo_remarks && <p className="text-xs text-red-500 mt-1">{errors.mepeo_remarks}</p>}
                            </div>
                        </div>

                        {/* Correctly Positioned Footer Elements Inside Form Context */}
                        <div className="flex items-center justify-between mt-6 border-t border-gray-100 pt-4">
                            <div className='inline-flex items-center gap-3'>
                                <Link 
                                    href="/mepeo-dashboard" 
                                    className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                                >
                                    {isLockedMepeo ? <ArrowLeftCircle className='h-4 w-4 mr-1'></ArrowLeftCircle> : <XIcon className='h-4 w-4 mr-1'></XIcon> }
                                    {isLockedMepeo ? 'Back to Dashboard' : 'Cancel' }
                                </Link>
                                {!isLockedMepeo && (
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center cursor-pointer px-4 py-2 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden"
                                    >
                                        <CircleCheck className='h-5 w-5 mr-2'></CircleCheck>
                                        {processing ? 'Submitting...' : 'Submit and Approve'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

MepeoEvaluate.layout = (page: React.ReactNode) => page;
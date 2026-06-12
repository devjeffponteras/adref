import { Head, Link, useForm } from '@inertiajs/react';
import { XIcon, CircleCheck, SquareArrowRightIcon, ArrowLeftCircle, FolderCheckIcon } from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface Workflow {
    id: number;
    asset_id: number;
    workflow_step: number;
    status: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface AccountingInformation {
    id: number;
    name: string;
    asset_id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    remarks: string;
    checked_by: string;
    conformed_by: string;
    status: string;
    workflow_status: string;
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
    workflow?: Workflow[] | null;
}

interface EvaluateProps {
    asset: AssetData;
}

const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) {
return '';
}

    return dateString.split(' ')[0].split('T')[0];
};

export default function AccountingEvaluate({ asset }: EvaluateProps) {

    const latestWorkflow = asset?.workflow && asset.workflow.length > 0 ? asset.workflow[0] : null;
    
    const hasAccountingRecord = !!asset.accounting_information;
    const accountingRecordApproved = asset.accounting_information?.status === 'Approved';
    const isWorkflowApproved  = latestWorkflow?.status === 'Approved';

    const isLocked = !!asset.accounting_information;

    // Initialize Inertia form hook
    const { data, setData, post, processing, errors } = useForm({
        asset_number: asset.accounting_information?.asset_number || '',
        acquisition_date: formatDateForInput(asset.accounting_information?.acquisition_date || ''),
        acquisition_cost: asset.accounting_information?.acquisition_cost ? String(asset.accounting_information.acquisition_cost) : '',
        book_value: asset.accounting_information?.book_value ? String(asset.accounting_information.book_value) : '',
        remarks: asset.accounting_information?.remarks || '',
        checked_by: 'Lou Agusin',
        conformed_by: '',
    });

    const handleActionSubmit = (actionType: 'submit-workflow' | 'approve-workflow' | 'save-only') => {
        if (actionType === 'submit-workflow') {
            post(`/accounting-evaluate/${asset.id}/workflow-action`);
        } else if (actionType === 'save-only') {
            post(`/accounting-evaluate/${asset.id}/save-only`);
        } else {
            post(`/accounting-evaluate/${asset.id}/action`);
        }
    };

    return (
        <>
            <Head title="Asset Evaluation - Accounting" />

            <WelcomeNote />
            
            <div className="container-fluid p-4">

                <AssetProfileCard asset={asset} />

                <form onSubmit={(e) => e.preventDefault()} className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                        Accounting Information
                        {isLocked && accountingRecordApproved && (
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Submitted to MCD for PAR Information Evaluation
                            </span>
                        )}
                        {isLocked && isWorkflowApproved && !accountingRecordApproved &&(
                            <span className="inline-flex items-center bg-amber-100/80 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Workflow Approved
                            </span>
                        )}
                    </h2>
                    
                    {/* First Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Asset Number</label>
                            <input 
                                type="text"
                                placeholder="e.g. AD-26-01"
                                value={data.asset_number}
                                disabled={isLocked}
                                onChange={e => setData('asset_number', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                    ${isLocked 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' 
                                    }`}
                            />
                            {errors.asset_number && <p className="text-xs text-red-500 mt-1">{errors.asset_number}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Date</label>
                            <input 
                                type="date"
                                value={data.acquisition_date}
                                disabled={isLocked}
                                onChange={e => setData('acquisition_date', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                    ${isLocked 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' 
                                    }`}
                            />
                            {errors.acquisition_date && <p className="text-xs text-red-500 mt-1">{errors.acquisition_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Cost</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    disabled={isLocked}
                                    value={data.acquisition_cost}
                                    onChange={e => setData('acquisition_cost', e.target.value)}
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg
                                        ${isLocked 
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' 
                                        }`}
                                />
                            </div>
                            {errors.acquisition_cost && <p className="text-xs text-red-500 mt-1">{errors.acquisition_cost}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Book Value</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.book_value}
                                    disabled={isLocked}
                                    onChange={e => setData('book_value', e.target.value)}
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg
                                        ${isLocked 
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' 
                                        }`}
                                />
                            </div>
                            {errors.book_value && <p className="text-xs text-red-500 mt-1">{errors.book_value}</p>}
                        </div>
                    </div>

                    {/* Second Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <input 
                                type="text"
                                value={data.remarks}
                                disabled={isLocked}
                                onChange={e => setData('remarks', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                    ${isLocked 
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500' 
                                    }`}
                            />
                            {errors.remarks && <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Checked by</label>
                            <input 
                                type="text"
                                disabled
                                value={data.checked_by}
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Conformed by</label>
                            <input 
                                type="text"
                                value={asset.accounting_information?.conformed_by || data.conformed_by}
                                readOnly
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                                placeholder='(To be signed in Workflow)'
                            />
                            {errors.conformed_by && <p className="text-xs text-red-500 mt-1">{errors.conformed_by}</p>}
                        </div>
                    </div>

                    {/* Form Controls Action Block */}
                    <div className="flex items-center justify-between">
                        <div className='inline-flex items-center gap-3'>
                            <Link 
                                href="/accounting-dashboard" 
                                className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                            >
                                {isLocked && isWorkflowApproved ? <ArrowLeftCircle className='h-4 w-4 mr-1' /> : <XIcon className='h-4 w-4 mr-1' /> }
                                {isLocked && isWorkflowApproved ? 'Back to Dashboard' : 'Cancel' }
                            </Link>

                            {/* STEP 1 BUTTON: Only shows if there's no workflow row created or active yet */}
                            {!latestWorkflow && (
                                <button 
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleActionSubmit('save-only')}
                                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden"
                                >
                                    <FolderCheckIcon className='h-5 w-5 mr-2' />
                                    {hasAccountingRecord ? 'Update Document' : 'Save Document'}
                                </button>
                            )}

                            {/* STEP 2 BUTTON: Appears right after Step 1 saves and flags status to 'On-going' */}
                            {hasAccountingRecord && !isWorkflowApproved && (
                                <button 
                                    type="button" 
                                    disabled={processing}
                                    onClick={() => handleActionSubmit('submit-workflow')}
                                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-amber-700 text-sm font-semibold text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 focus:outline-hidden"
                                >
                                    <SquareArrowRightIcon className='h-5 w-5 mr-2' />
                                    Submit to Ivan Moreno's Workflow for Approval
                                </button>
                            )}

                            {/* STEP 3 BUTTON: Appears when Ivan signs off ('Approved') but before final pipeline execution */}
                            {hasAccountingRecord && isWorkflowApproved && !accountingRecordApproved &&(
                                <button 
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleActionSubmit('approve-workflow')}
                                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden"
                                >
                                    <CircleCheck className='h-5 w-5 mr-2' />
                                    Approve and Push Stage
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

AccountingEvaluate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/accounting-dashboard' },
        { title: 'Asset Evaluation' },
    ],
};
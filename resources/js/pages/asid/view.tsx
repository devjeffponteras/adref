import { Head, useForm } from '@inertiajs/react';
import { 
    FileText, 
    Image as ImageIcon, 
    Download, 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    RotateCcw,
    Building2,
    ClipboardList,
    AlertCircle,
    SquareArrowLeft,
} from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

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

export default function AsidEvaluate({ asset }: EvaluateProps) {
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    
    // UI Interaction States
    const [activeWorkflow, setActiveWorkflow] = useState<'none' | 'approve' | 'disapprove'>('none');

    // Setup Inertia Form handler
    const { data, setData, post, errors } = useForm({
        status: '', 
        remarks: '',
        control_number: asset.control_number || ''
    });

    const handleWorkflowAction = (actionStatus: 'Approved' | 'Returned' | 'Rejected') => {
        setIsSubmittingAction(true);
        
        post(`/asid-view/${asset.id}/action`, {
            onBefore: () => { 
                data.status = actionStatus; 
            },
            onFinish: () => {
                setIsSubmittingAction(false);
            }
        });
    };

    const openDocumentSecurely = (path: string | null) => {
        if (!path) return;
        window.open(`/storage/${path}`, '_blank');
    };

    return (
        <>
            <Head title={`View Asset`} />

            <WelcomeNote />

            <div className="container-fluid p-4 max-w-7xl mx-auto">

                {/* Back Link Row */}
                <div className="mb-5">
                    <Link 
                        href="/asid-dashboard" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    
                    {/* LEFT & CENTER COLUMN: Technical and Asset Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Box 1: Core Information Header Block */}
                        <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-md shadow-emerald-900/3 overflow-hidden">
                            <div className="bg-emerald-50/60 px-6 py-4 border-b border-emerald-100/40 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                                    <ClipboardList className="w-4 h-4 text-emerald-600" /> Core Asset Registration Profile
                                </div>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Accountable Personnel</span>
                                    <span className="text-gray-800 font-semibold">{asset.accountable_personnel}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Filer / Registrant</span>
                                    <span className="text-gray-800 font-medium">{asset.user?.name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">End-User Department</span>
                                    <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {asset.end_user_department}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Structural Specifications & Identification Metadata */}
                        <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-md shadow-emerald-900/3 overflow-hidden">
                            <div className="bg-emerald-50/60 px-6 py-4 border-b border-emerald-100/40">
                                <div className="text-emerald-800 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-600" /> Technical Configuration Properties
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Brand / Make</span>
                                    <span className="text-gray-800 font-semibold">{asset.brand_make || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Model Standard</span>
                                    <span className="text-gray-800 font-medium">{asset.model || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Serial / Plate ID Number</span>
                                    <span className="font-mono text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded text-xs">{asset.serial_plate_id_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Asset Classification Category</span>
                                    <span className="text-gray-800 font-medium">{asset.classification?.name || 'Unclassified Row'}</span>
                                </div>
                                <div className="md:col-span-2 border-t border-gray-100 pt-3 mt-1">
                                    <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">Asset Operational Location</span>
                                    <span className="text-gray-700 font-medium">{asset.asset_location}</span>
                                </div>
                                <div className="md:col-span-2 border-t border-gray-100 pt-3">
                                    <span className="text-amber-700/90 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> Reasons for Condemnation &amp; Disposal
                                    </span>
                                    <p className="text-gray-600 bg-amber-50/30 p-3 rounded-xl border border-amber-100/40 leading-relaxed text-sm">
                                        {asset.reasons_for_disposal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Document Repository Access Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-md shadow-emerald-900/3 overflow-hidden h-full">
                            <div className="bg-emerald-50/60 px-6 py-4 border-b border-emerald-100/40">
                                <div className="text-emerald-800 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" /> Attached Vault Documentation
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                {/* Component A: Technical Assessment Report Attachment */}
                                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Assessment Report</h4>
                                            <p className="text-xs text-gray-400 truncate mb-3">{asset.assessment_report_path ? 'Technical_Assessment_Report.pdf' : 'No document attached'}</p>
                                            
                                            {asset.assessment_report_path ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => openDocumentSecurely(asset.assessment_report_path)}
                                                        className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                                    >
                                                        View Tab
                                                    </button>
                                                    <a 
                                                        href={`/storage/${asset.assessment_report_path}`} 
                                                        download
                                                        className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                                    >
                                                        <Download className="w-3 h-3" /> Download
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Component B: Graphic Evidence Asset Photo Attachment */}
                                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Physical Evidence Photo</h4>
                                            <p className="text-xs text-gray-400 truncate mb-3">{asset.asset_photo_path ? 'Asset_Condition_Image.jpg' : 'No photo uploaded'}</p>
                                            
                                            {asset.asset_photo_path ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => openDocumentSecurely(asset.asset_photo_path)}
                                                        className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                                    >
                                                        View Image
                                                    </button>
                                                    <a 
                                                        href={`/storage/${asset.asset_photo_path}`} 
                                                        download
                                                        className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                                    >
                                                        <Download className="w-3 h-3" /> Save File
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER REGION: WORKFLOW ACTIONS SELECTION --- */}
                <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-lg shadow-emerald-900/4 overflow-hidden">
                    
                    {/* headerEvaluation: Displays if either Approve or Disapprove pipeline is chosen */}
                    {activeWorkflow !== 'none' && (
                        <div id="headerEvaluation" className="bg-linear-to-r from-emerald-800 to-emerald-950 px-6 py-4 text-white">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Evaluation Action Center Pipeline</h3>
                            <p className="text-xs text-emerald-100/70">Execute processing states and add documentation notes to route this asset request to its next sequential stage.</p>
                        </div>
                    )}
                    
                    <div className="p-6">
                        {/* assignControlNumber: Only shows up on Approve action context */}
                        {activeWorkflow === 'approve' && (
                            <div id="assignControlNumber" className="mb-4 max-w-xs">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Control Number Reference
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Assign Control Number"
                                    value={data.control_number} // 👈 Changed from asset.control_number
                                    onChange={(e) => setData('control_number', e.target.value)} // 👈 Added this handler
                                    className="w-full p-2 text-sm font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl shadow-xs focus:outline-emerald-500"
                                />
                                {errors.control_number && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.control_number}</p>
                                )}
                            </div>
                        )}

                        {/* approverSummary: Displayed if any direction action state is initialized */}
                        {activeWorkflow !== 'none' && (
                            <div id="approverSummary" className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Approver Summary Evaluation Remarks <span className="text-red-400">*</span>
                                </label>
                                <textarea 
                                    rows={3}
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="w-full p-2 text-sm border border-gray-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 rounded-xl transition-all shadow"
                                    placeholder="State technical evaluation details, reasons for routing choices, or necessary revision changes clearly..."
                                />
                                {errors.remarks && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.remarks}</p>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end items-center gap-3 pt-4">
                            
                            {/* --- PHASE: INITIAL SCREEN (Only show Approve & Disapprove) --- */}
                            {activeWorkflow === 'none' && (
                                <>
                                    {/* disapproveBtn */}
                                    <button
                                        id="disapproveBtn"
                                        type="button"
                                        onClick={() => setActiveWorkflow('disapprove')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm active:scale-98"
                                    >
                                        <XCircle className="w-4 h-4" /> Disapprove
                                    </button>

                                    {/* approveBtn */}
                                    <button
                                        id="approveBtn"
                                        type="button"
                                        onClick={() => setActiveWorkflow('approve')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10 active:scale-98"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                </>
                            )}

                            {/* --- PHASE: DISAPPROVE WORKFLOW OPENED --- */}
                            {activeWorkflow === 'disapprove' && (
                                <>
                                    {/* returnBtn */}
                                    <button
                                        id="returnBtn"
                                        type="button"
                                        disabled={isSubmittingAction}
                                        onClick={() => handleWorkflowAction('Returned')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Return to User
                                    </button>

                                    {/* rejectBtn */}
                                    <button
                                        id="rejectBtn"
                                        type="button"
                                        disabled={isSubmittingAction}
                                        onClick={() => handleWorkflowAction('Rejected')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject Request
                                    </button>
                                </>
                            )}

                            {/* --- PHASE: APPROVE WORKFLOW OPENED --- */}
                            {activeWorkflow === 'approve' && (
                                /* submitBtn */
                                <button
                                    id="submitBtn"
                                    type="button"
                                    disabled={isSubmittingAction}
                                    onClick={() => handleWorkflowAction('Approved')}
                                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10 active:scale-98 disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> Submit &amp; Push Stage
                                </button>
                            )}

                            {/* Optional: Simple Reset/Cancel Interaction Trigger to return to clean layout */}
                            {activeWorkflow !== 'none' && (
                                <button 
                                    type="button"
                                    onClick={() => setActiveWorkflow('none')}
                                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10 active:scale-98 disabled:opacity-50"
                                >
                                    <SquareArrowLeft className="w-4 h-4" /> Cancel Selection
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

AsidEvaluate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/asid-dashboard' },
        { title: 'View Asset for Disposal', href: '#' },
    ],
};
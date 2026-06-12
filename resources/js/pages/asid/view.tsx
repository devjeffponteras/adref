import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
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
import { useState } from 'react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import { WelcomeNote } from '@/components/welcome-note';

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
    control_number: string | null;
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
    created_at: string;

    assessment_reports?: string[] | null;
    asset_photos?: string[] | null;

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
    const { data, setData, post, transform, errors } = useForm({
        status: '', 
        remarks: '',
        control_number: asset.control_number || ''
    });

    // Extract multi-file lists or fall back safely to empty arrays
    const reportsList = asset.assessment_reports || [];
    const photosList = asset.asset_photos || [];

    const handleWorkflowAction = (actionStatus: 'Approved' | 'Returned' | 'Rejected') => {
        setIsSubmittingAction(true);
        
        transform((data) => ({
            ...data,
            status: actionStatus,
        }));

        post(`/asid-view/${asset.id}/action`, {
            onFinish: () => {
                setIsSubmittingAction(false);
            }
        });
    };

    const openDocumentSecurely = (path: string | null) => {
        if (!path) {
return;
}

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

                <AssetProfileCard 
                    asset={{
                        ...asset,
                        control_number: asset.control_number || ''
                    }} 
                />

                {/* --- MIDDLE REGION: MULTI-FILE DISPLAY ARCHITECTURE not* useful for now --- */}
                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    
                    {/* Assessment Reports Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-gray-700">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Assessment Reports ({reportsList.length})</h3>
                        </div>
                        {reportsList.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No document reports attached.</p>
                        ) : (
                            <div className="space-y-2">
                                {reportsList.map((path, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100/70 transition-all">
                                        <span className="text-xs font-medium text-gray-600 truncate max-w-[70%]">
                                            Report Document #{idx + 1}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => openDocumentSecurely(path)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" /> View / Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Asset Photos Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-gray-700">
                            <ImageIcon className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Asset Photos ({photosList.length})</h3>
                        </div>
                        {photosList.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No asset photographs attached.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {photosList.map((path, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => openDocumentSecurely(path)}
                                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                                    >
                                        <img 
                                            src={`/storage/${path}`} 
                                            alt={`Asset Photo ${idx + 1}`} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            {/* Line 80 Fixed: Replaced backdrop-blur-xs with backdrop-blur-sm */}
                                            <span className="text-white text-[11px] font-bold tracking-wide uppercase px-2 py-1 bg-black/30 rounded-md backdrop-blur-sm">View Original</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* --- FOOTER REGION: WORKFLOW ACTIONS SELECTION --- */}
                <div className="bg-white rounded-2xl mt-4 border border-emerald-100/60 shadow-lg shadow-emerald-900/4 overflow-hidden">
                    
                    {/* headerEvaluation */}
                    {activeWorkflow !== 'none' && (
                        /* Line 113 Fixed: Replaced bg-linear-to-r with bg-gradient-to-r */
                        <div id="headerEvaluation" className="bg-linear-to-r from-emerald-800 to-emerald-950 px-6 py-4 text-white">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Evaluation Action Center Pipeline</h3>
                            <p className="text-xs text-emerald-100/70">Execute processing states and add documentation notes to route this asset request to its next sequential stage.</p>
                        </div>
                    )}
                    
                    <div className="p-6">
                        {/* assignControlNumber */}
                        {activeWorkflow === 'approve' && (
                            <div id="assignControlNumber" className="mb-4 max-w-xs">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                    Control Number Reference
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Assign Control Number"
                                    value={data.control_number}
                                    onChange={(e) => setData('control_number', e.target.value)}
                                    className="w-full p-2 text-sm font-mono font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-emerald-500"
                                />
                                {errors.control_number && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{errors.control_number}</p>
                                )}
                            </div>
                        )}

                        {/* approverSummary */}
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
                            
                            {/* --- PHASE: INITIAL SCREEN --- */}
                            {activeWorkflow === 'none' && (
                                <>
                                    <button
                                        id="disapproveBtn"
                                        type="button"
                                        onClick={() => setActiveWorkflow('disapprove')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm active:scale-98"
                                    >
                                        <XCircle className="w-4 h-4" /> Disapprove
                                    </button>

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
                                    <button
                                        id="returnBtn"
                                        type="button"
                                        disabled={isSubmittingAction}
                                        onClick={() => handleWorkflowAction('Returned')}
                                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all shadow-sm active:scale-98 disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Return to User
                                    </button>

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
                                <button
                                    id="submitBtn"
                                    type="button"
                                    disabled={isSubmittingAction}
                                    onClick={() => handleWorkflowAction('Approved')}
                                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10 active:scale-98 disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> Submit and Approve
                                </button>
                            )}

                            {/* Simple Reset/Cancel Interaction Trigger */}
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

AsidEvaluate.layout = (page: React.ReactNode) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/asid-dashboard' },
        { title: 'View Asset for Disposal', href: '#' },
    ],
    children: page,
});
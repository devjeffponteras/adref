import { Head, useForm, Link, usePage} from '@inertiajs/react';
import { CheckCircle2, Circle, Clock, ArrowLeft, MessageSquare, User, Building2, CalendarDays, ShieldAlert, BadgeHelp, BadgeCheckIcon } from 'lucide-react';

interface Approver {
    id: number;
    name: string;
    email: string;
}

interface assetStatus {
    id: number;
    asset_id: number;
    seq_no: number;
    is_current: boolean;
    approver_id: number | null;
    status: 'Approved' | 'On-going' | 'Pending' | 'Rejected';
    approval_date: string | null;
    remarks: string | null;
    department_name?: string; 
    approver?: Approver | null;
}

interface Department {
    id: number;
    name: string;
}

interface AsidInfo {
    id: number;
    remarks: string;
    checked_by: string;
    disposition: string;
    reviewed_by: string;
}

interface ManagerInfo {
    id: number;
    manager_disposition: string;
    reviewed_by: string;
}

interface UserProfile {
    id: number;
    name: string;
    department?: Department | null;
}

interface Props {
    asset: {
        id: number;
        control_number: string;
        serial_plate_id_number: string;
        model: string;
        brand_make: string;
        approvals: assetStatus[];
        user?: UserProfile | null;
        asid_information?: AsidInfo | null;
        manager_information?: ManagerInfo | null;
    };
    currentUserId: number;
}

export default function AssetTimeline({ asset, currentUserId }: Props) {
    const { auth, flash } = usePage().props as any;

    const isLockedAsid = !!asset?.asid_information && !asset?.manager_information;

    const { data, setData, post, processing, errors } = useForm({
        remarks: '',
    });

    const handleApprove = () => {
        if (confirm('Are you sure you want to sign off on this sequence stage?')) {
            post(`/assets/${asset.id}/asset-approve`, {
                onSuccess: () => setData('remarks', ''),
            });
        }
    };

    const getStatusStyles = (status: string, isCurrent: boolean) => {
        if (status === 'Approved') {
            return {
                bg: 'bg-gradient-to-r from-emerald-50 to-white shadow border-b-4 border-emerald-300 hover:border-emerald-200',
                badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200',
                iconBg: 'bg-white ring-4 ring-emerald-100/50',
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
                line: 'bg-emerald-400',
                pillText: 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/10'
            };
        }
        
        if (isCurrent) {
            return {
                bg: 'bg-gradient-to-r from-amber-50/50 to-white border-amber-200/80 shadow border-b-4 border-amber-300 shadow-amber-900/[0.02] ring-1 ring-amber-400/20 scale-[1.01]',
                badge: 'bg-amber-500/10 text-amber-700 border border-amber-200',
                iconBg: 'bg-white ring-4 ring-amber-100/60',
                icon: <Clock className="h-5 w-5 text-amber-500 animate-spin-[spin_3s_linear_infinite]" />,
                line: 'bg-gray-200/80', 
                pillText: 'bg-amber-500 text-white shadow-xs shadow-amber-500/10'
            };
        }

        if (status === 'Rejected') {
            return {
                bg: 'bg-gradient-to-r from-rose-50/40 to-white border-rose-100 shadow-xs',
                badge: 'bg-rose-50/10 text-rose-700 border border-rose-200',
                iconBg: 'bg-white ring-4 ring-rose-100/50',
                icon: <ShieldAlert className="h-5 w-5 text-rose-500" />,
                line: 'bg-gray-200/80',
                pillText: 'bg-rose-600 text-white shadow-xs'
            };
        }

        return {
            bg: 'bg-white border-gray-100 opacity-75',
            badge: 'bg-gray-100 text-gray-500 border border-gray-200/40',
            iconBg: 'bg-white ring-4 ring-gray-100/30',
            icon: <Circle className="h-5 w-5 text-gray-300 stroke-[1.5]" />,
            line: 'bg-gray-200/80',
            pillText: 'bg-gray-400 text-white'
        };
    };

    const getDepartmentName = (seq: number) => {
        const departments = [
            'ASID (Initial Evaluation)',
            'Accounting Department',
            'MCD',
            'MEPEO',
            'ASID (Review)',
            'Top Management',
            'Administration Division',
            'Executive Division'
        ];

        return departments[seq - 1] || `Approval Stage ${seq}`;
    };

    const handleBack = () => {
        window.history.back(); 
    };

    return (
        <>
            <Head title={`Document Tracker - ${asset.serial_plate_id_number || 'Asset'}`} />

            <div className="w-full p-4 max-w-3xl mx-auto space-y-6 antialiased selection:bg-emerald-500/10">

                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link onClick={handleBack} className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-gray-400 hover:text-emerald-700 transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Link>
                    <span className="text-[10px] font-extrabold bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">
                        Asset Disposal Request Status
                    </span>
                </div>

                {/* Main Heading Card */}
                <div className="relative overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-900 to-slate-950 p-6 rounded-2xl shadow-lg shadow-emerald-950/20 text-white">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 opacity-90 block mb-1">
                        Item Brand &amp; Model
                    </span>

                    <h1 className="font-extrabold text-2xl tracking-tight mb-5 drop-shadow-xs">
                        {asset.brand_make || 'Generic'} <span className="font-light text-emerald-100/80">{asset.model || 'Asset Profile'}</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-white/10 pt-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300/60">Control Number</span>
                            <span className="font-bold text-emerald-50 tracking-wide">{asset.control_number || 'N/A'}</span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300/60">Serial Tag / Plate Number</span>
                            <span className="font-mono uppercase text-xs font-medium text-emerald-100 bg-white/5 px-2 py-0.5 rounded border border-white/5 w-fit tracking-wider">{asset.serial_plate_id_number || 'N/A'}</span>
                        </div>

                        {/* 3. Updated this column to pull data from asset.user.department.name */}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300/60">End-User Department</span>
                            <span 
                                className="font-medium text-emerald-50/90 truncate" 
                                title={asset.user?.department?.name || 'N/A'}
                            >
                                {asset.user?.department?.name || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Vertical Timeline Nodes */}
                <div className="relative pl-8 space-y-6">
                    {asset.approvals.map((step, idx) => {
                        const isStrictlyCurrent = String(step.is_current) === '1' || step.is_current === true;
    
                        const styles = getStatusStyles(step.status, isStrictlyCurrent);
                        const isLast = idx === asset.approvals.length - 1;

                        return (
                            <div key={step.id} className="relative flex items-start gap-4 group">
                                
                                {!isLast && (
                                    <div className={`absolute -left-4.75 top-8 -bottom-6 w-0.5 transition-all duration-300 ${styles.line}`} />
                                )}

                                <div className={`absolute -left-7.75 rounded-full p-1 z-10 transition-all duration-300 ${styles.iconBg}`}>
                                    {styles.icon}
                                </div>

                                <div className={`flex-1 border rounded-2xl p-5 bg-white transition-all duration-300 shadow-xs hover:shadow-md ${styles.bg}`}>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg transition-colors ${styles.badge}`}>
                                                {step.seq_no.toString().padStart(2, '0')}
                                            </span>
                                            <h3 className="font-bold text-slate-800 tracking-tight text-base group-hover:text-emerald-950 transition-colors">
                                                {getDepartmentName(step.seq_no)}
                                            </h3>
                                        </div>

                                        {step.status === 'Approved' && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-green-500 text-white p-1 rounded-full uppercase tracking-wider shadow">
                                                <BadgeCheckIcon /> <span className='pe-2'>Done</span>
                                            </span>
                                        )}
                                        {isLockedAsid && isStrictlyCurrent && !isLast && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-xs shadow-amber-500/20">
                                                <span className="h-1 w-1 rounded-full bg-white animate-ping" /> Manager is Reviewing..
                                            </span>
                                        )}
                                        {isStrictlyCurrent && !isLast && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-xs shadow-amber-500/20">
                                                <span className="h-1 w-1 rounded-full bg-white animate-ping" /> Current Stage
                                            </span>
                                        )}
                                        
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3.5 text-slate-600">
                                        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                            <User className="h-4 w-4 text-slate-400 shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">Evaluated By</p>
                                                <p className="font-semibold text-slate-700 truncate">{step.approver?.name || 'Awaiting Assignment'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                            <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">Approval Timestamp</p>
                                                <p className="font-semibold text-slate-700 truncate">
                                                    {step.approval_date 
                                                        ? `${new Date(step.approval_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} @ ${new Date(step.approval_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                                                        : 'Pending Release'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status State:</span> 
                                            <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md ${styles.pillText}`}>
                                                {step.status}
                                            </span>
                                        </div>

                                        {/* Activity Log Remarks Block */}
                                        {!!step.remarks && (
                                            <div className="sm:col-span-2 flex items-start gap-2.5 bg-slate-50 border border-slate-200/60 p-3 rounded-xl mt-1 text-slate-700 shadow-inner">
                                                <MessageSquare className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Evaluation Remarks</p>
                                                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{step.remarks}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Submittal Layer for Active Step Row */}
                                    {isStrictlyCurrent && auth?.user?.role === 'admin' && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-amber-200/80 space-y-3.5">
                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="remarks" className="text-[10px] font-black text-amber-800 uppercase tracking-widest inline-flex items-center gap-1">
                                                    <BadgeHelp className="h-3.5 w-3.5 text-amber-500" /> Action Verification Log Notes
                                                </label>
                                                <textarea
                                                    id="remarks"
                                                    rows={2}
                                                    value={data.remarks}
                                                    onChange={e => setData('remarks', e.target.value)}
                                                    placeholder="Input processing context parameters, metrics or physical audit remarks safely..."
                                                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all bg-white text-slate-700 shadow-inner resize-none placeholder:text-slate-400"
                                                />
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={handleApprove}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer tracking-wider uppercase hover:shadow-md hover:shadow-emerald-600/10"
                                                >
                                                    Commit Signature Release
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

AssetTimeline.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/my-assets' },
        { title: 'Asset Status Timeline' },
    ],
};
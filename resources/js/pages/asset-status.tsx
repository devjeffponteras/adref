import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { CheckCircle2, Circle, Clock, ArrowLeft, MessageSquare, User } from 'lucide-react';

interface assetStatus {
    id: number;
    asset_id: number;
    seq_no: number;
    is_current: boolean;
    approver_id: number | null;
    status: 'Approved' | 'On-going' | 'Pending' | 'Rejected'; // Adjusted according to your status logic
    approval_date: string | null;
    remarks: string | null;
    // Helper field passed via backend to show department title on UI
    department_name?: string; 
}

interface Props {
    asset: {
        id: number;
        control_number: string;
        serial_plate_id_number: string;
        model: string;
        brand_make: string;
        approvals: assetStatus[];
        end_user_department: string;
    };
    currentUserId: number; // Used to confirm if the logged-in user matches the structural permission
}

export default function AssetTimeline({ asset, currentUserId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        remarks: '',
    });

    const handleApprove = () => {
        if (confirm('Are you sure you want to sign off on this sequence stage?')) {
            // Uses the asset ID directly from your component props
            post(`/assets/${asset.id}/asset-approve`, {
                onSuccess: () => setData('remarks', ''),
            });
        }
    };

    // Maps status attributes to specific UI styles
    const getStatusStyles = (status: string, isCurrent: boolean) => {
        if (status === 'Approved') {
            return {
                bg: 'bg-emerald-50 border-emerald-200',
                badge: 'bg-emerald-600 text-white',
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
                line: 'bg-emerald-500'
            };
        }
        
        if (isCurrent) {
            return {
                bg: 'bg-amber-50 border-amber-200 shadow-sm ring-1 ring-amber-400/30',
                badge: 'bg-amber-500 text-white',
                icon: <Clock className="h-5 w-5 text-amber-500 animate-pulse" />,
                line: 'bg-amber-300'
            };
        }

        return {
            bg: 'bg-gray-50/50 border-gray-100',
            badge: 'bg-gray-200 text-gray-500',
            icon: <Circle className="h-5 w-5 text-gray-300" />,
            line: 'bg-gray-200'
        };
    };

    // Department helper labels array mapping cleanly to your sequence logic
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

    return (
        <>
            <Head title={`Document Tracker - ${asset.serial_plate_id_number || 'Asset'}`} />
            
            <div className="w-full p-4 max-w-3xl mx-auto space-y-6">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/disposals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </Link>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                        Approval Steps
                    </span>
                </div>

                {/* Main Heading Card */}
                <div className="bg-emerald-700 p-6 rounded-xl shadow-sm text-white">
                    {/* Top Label */}
                    <span className="text-xs uppercase font-bold tracking-widest opacity-75 block mb-1">
                        ASSET INFORMATION
                    </span>

                    {/* Primary Main Title */}
                    <h1 className="font-bold text-2xl tracking-tight mb-6">
                        {asset.brand_make || ''} {asset.model || ''}
                    </h1>

                    <hr className="border-emerald-600/50 mb-4" />

                    {/* Metadata Information Row Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        
                        {/* Column 1: Asset Details */}
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold tracking-wider opacity-60 mb-0.5">
                                Control Number
                            </span>
                            <span className="font-medium text-base">
                                {asset.control_number || 'AD-26-01'}
                            </span>
                        </div>

                        {/* Column 2: Serial Trace */}
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold tracking-wider opacity-60 mb-0.5">
                                Serial Number
                            </span>
                            <span className="font-mono font-medium text-base tracking-wide">
                                {asset.serial_plate_id_number || '242206500512BX'}
                            </span>
                        </div>

                        {/* Column 3: Custody Assignment */}
                        <div className="flex flex-col">
                            <span className="text-xs uppercase font-bold tracking-wider opacity-60 mb-0.5">
                                Department
                            </span>
                            <span className="font-medium text-base">
                                {asset.end_user_department || 'Audit and Systems Improvement'}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Vertical Timeline Nodes */}
                <div className="relative pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-4.5 before:w-0.5 before:bg-gray-200">
                    {asset.approvals.map((step, idx) => {
                        const styles = getStatusStyles(step.status, step.is_current);
                        const isLast = idx === asset.approvals.length - 1;

                        return (
                            <div key={step.id} className="relative flex items-start gap-4 group">
                                
                                {/* Dynamic Connecting Line Segment */}
                                {!isLast && <div className={`absolute -left-1.75 top-6 -bottom-9 w-0.5 ${styles.line}`} />}

                                {/* Left Side Icon Indicator Node */}
                                <div className="absolute -left-4 bg-white rounded-full p-0.5 z-10">
                                    {styles.icon}
                                </div>

                                {/* Detail Content Panel */}
                                <div className={`flex-1 border rounded-xl p-5 bg-white transition-all ${styles.bg}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${styles.badge}`}>
                                                {step.seq_no}
                                            </span>
                                            <h3 className="font-bold text-gray-800 tracking-tight text-base">
                                                {getDepartmentName(step.seq_no)}
                                            </h3>
                                        </div>
                                        
                                        {!!step.is_current && (
                                            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                                Active Stage
                                            </span>
                                        )}
                                    </div>

                                    {/* Attributes Display Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs border-t border-gray-100 pt-3 text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span><strong>Approver ID:</strong> {step.approver_id || '---'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span><strong>Approval Date:</strong> {step.approval_date || '---'}</span>
                                        </div>
                                        
                                        <div className="md:col-span-2 text-gray-500 font-medium">
                                            <strong>Status Flag:</strong> <span className={`capitalize py-1 px-2 shadow rounded-lg ${styles.line}`}>{step.status}</span>
                                        </div>

                                        {step.remarks && (
                                            <div className="md:col-span-2 flex items-start gap-1 bg-white/60 p-2.5 rounded border border-gray-200/60 text-gray-700">
                                                <MessageSquare className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                                                <p><strong>Remarks:</strong> {step.remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Submittal Layer for Active Step Row */}
                                    {step.is_current && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-amber-200 space-y-3">
                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="remarks" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Add Processing Remarks
                                                </label>
                                                <textarea
                                                    id="remarks"
                                                    rows={2}
                                                    value={data.remarks}
                                                    onChange={e => setData('remarks', e.target.value)}
                                                    placeholder="Enter details or evaluation notes..."
                                                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors bg-white text-gray-700"
                                                />
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={handleApprove}
                                                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors disabled:opacity-50"
                                                >
                                                    Sign & Approve Action
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
import { Head, usePage } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Plus, X, Upload } from 'lucide-react';
import React from 'react';
import { WelcomeNote } from '@/components/welcome-note';
import { createAsset } from '@/routes';
import { ACCOUNTABLE_PERSONNEL, END_USER_DEPARTMENT } from '@config/dropdown_data';

interface Classification {
    id: number;
    name: string;
}

interface Props {
    classifications: Classification[];
}

// Updated interfaces to include descriptions per file item
interface AssessmentReportItem {
    id: string;
    file: File | null;
    description: string;
}

interface AssetPhotoItem {
    id: string;
    file: File | null;
    description: string;
}

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export default function CreateAsset({ classifications }: Props) {

    const { auth } = usePage().props as any;
    console.log(auth?.user);

    const user_department = auth?.user?.department?.name?.toUpperCase() || 'N/A';

    const { data, setData, post, processing, errors, reset } = useForm({
        accountable_personnel: '',
        model: '',
        description: '',
        brand_make: '',
        serial_plate_id_number: '',
        end_user_department: user_department,
        asset_classification_id: '', 
        reasons_for_disposal: '', 
        asset_location: '',
        others_description: '',
        
        // Initialized with description fields tied to the specific file item
        assessment_reports: [
            { id: generateUUID(), file: null, description: '' }
        ] as AssessmentReportItem[],

        asset_photos: [
            { id: generateUUID(), file: null, description: '' }
        ] as AssetPhotoItem[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/store-asset', {
            forceFormData: true,
            onSuccess: () => reset(
                'accountable_personnel', 'model', 'description', 
                'brand_make', 'serial_plate_id_number', 'end_user_department', 
                'asset_classification_id', 'reasons_for_disposal', 'asset_location', 
                'assessment_reports', 'asset_photos'
            ),
        });
    };

    return (
        <>
            <Head title="Scan / Log Asset" />

            {/* <WelcomeNote /> */}

            {errors['assessment_reports.0.file'] && (
                <span className="text-red-500">{errors['assessment_reports.0.file']}</span>
            )}

            {errors['asset_photos.0.file'] && (
                <span className="text-red-500">{errors['asset_photos.0.file']}</span>
            )}

            <div className="w-full p-4 max-w-6xl mx-auto space-y-6">
            
                <div className="bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-800">
                    <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2.5">
                            <FileText className="h-5 w-5 opacity-90" />
                            <h5 className="font-semibold text-lg tracking-tight">Asset Information</h5>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        
                        {/* Form Inputs Grid System */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Accountable Personnel */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="accountable_personnel" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Accountable Personnel
                                </label>
                                <select
                                    id="accountable_personnel"
                                    value={data.accountable_personnel || ''}
                                    onChange={e => setData('accountable_personnel', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                >
                                    <option value="" disabled>Select personnel...</option>
                                    {ACCOUNTABLE_PERSONNEL.map((person) => (
                                        <option key={person.value} value={person.value}>
                                            {person.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.accountable_personnel && <span className="text-xs text-rose-500 font-medium">{errors.accountable_personnel}</span>}
                            </div>

                            {/* Brand/Make */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="brand_make" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Brand / Make
                                </label>
                                <input
                                    type="text"
                                    id="brand_make"
                                    value={data.brand_make}
                                    onChange={e => setData('brand_make', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.brand_make && <span className="text-xs text-rose-500 font-medium">{errors.brand_make}</span>}
                            </div>

                            {/* Model */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="model" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    id="model"
                                    value={data.model}
                                    onChange={e => setData('model', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.model && <span className="text-xs text-rose-500 font-medium">{errors.model}</span>}
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="description" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Serial Number */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="serial_plate_id_number" className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate">
                                    Serial / Plate / ID Number
                                </label>
                                <input
                                    type="text"
                                    id="serial_plate_id_number"
                                    value={data.serial_plate_id_number}
                                    onChange={e => setData('serial_plate_id_number', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.serial_plate_id_number && <span className="text-xs text-rose-500 font-medium">{errors.serial_plate_id_number}</span>}
                            </div>

                            {/* Department */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="end_user_department" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    End-User Department
                                </label>
                                <input 
                                    type="text" 
                                    disabled 
                                    readOnly 
                                    value={data.end_user_department} 
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Asset Classification Select Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="asset_classification_id" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Asset Classification
                                </label>
                                <select
                                    id="asset_classification_id"
                                    value={data.asset_classification_id}
                                    onChange={e => {
                                        const selectedId = e.target.value;
                                        // Find the selected classification item to see if its text name is 'Others'
                                        const selectedItem = classifications?.find(item => String(item.id) === String(selectedId));
                                        
                                        setData(data => ({
                                            ...data,
                                            asset_classification_id: selectedId,
                                            // Reset the description text automatically if they switch away from 'Others'
                                            others_description: selectedItem?.name?.toLowerCase() === 'others' ? data.others_description : ''
                                        }));
                                    }}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-gray-700"
                                >
                                    <option value="" disabled>Select Classification..</option>
                                    {classifications && classifications.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.asset_classification_id && (
                                    <span className="text-xs text-rose-500 font-medium">{errors.asset_classification_id}</span>
                                )}

                                {/* Conditionally reveal input panel when the active selection name is "Others" */}
                                {(() => {
                                    const currentSelection = classifications?.find(item => String(item.id) === String(data.asset_classification_id));
                                    if (currentSelection?.name?.toLowerCase() !== 'others') return null;

                                    return (
                                        <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                                            <label htmlFor="others_description" className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                                                Other Classification Description
                                            </label>
                                            <input
                                                type="text"
                                                id="others_description"
                                                value={data.others_description}
                                                onChange={e => setData('others_description', e.target.value)}
                                                placeholder="Please declare the specialized classification name..."
                                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-gray-700 shadow-inner"
                                            />
                                            {errors.others_description && (
                                                <p className="text-xs text-rose-500 mt-0.5 font-medium">{errors.others_description}</p>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Reasons for disposal */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="reasons_for_disposal" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Reason/s for Disposal
                                </label>
                                <textarea
                                    id="reasons_for_disposal"
                                    value={data.reasons_for_disposal}
                                    onChange={e => setData('reasons_for_disposal', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                ></textarea>
                            </div>

                            {/* Asset Location */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="asset_location" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Asset Location
                                </label>
                                <input
                                    type="text"
                                    id="asset_location"
                                    value={data.asset_location}
                                    onChange={e => setData('asset_location', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 font-medium">
                            * Note: All asset information needed should be filled out, please indicate N/A for not applicable sections.
                        </div>

                        {/* File Attachments Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                            
                            {/* Document Attachment Section */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Assessment Reports
                                </label>

                                <div className='flex flex-col gap-4 py-3 px-2 border-dotted border-2 shadow rounded-lg border-gray-300'>
                                    {data.assessment_reports.map((item, index) => (
                                        <div key={item.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                                    <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                                        {item.file ? item.file.name : `Choose assessment report #${index + 1}...`}
                                                    </span>
                                                    <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        onChange={e => {
                                                            const files = e.target.files;
                                                            const updatedReports = [...data.assessment_reports];
                                                            updatedReports[index].file = files ? files[0] : null;
                                                            setData('assessment_reports', updatedReports);
                                                        }}
                                                    />
                                                </label>

                                                {data.assessment_reports.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedReports = data.assessment_reports.filter(r => r.id !== item.id);
                                                            setData('assessment_reports', updatedReports);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dynamic description input tied directly to this specific report instance */}
                                            <div className="flex flex-col gap-1 pl-1">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    placeholder={`Report #${index + 1} Description`}
                                                    onChange={e => {
                                                        const updatedReports = [...data.assessment_reports];
                                                        updatedReports[index].description = e.target.value;
                                                        setData('assessment_reports', updatedReports);
                                                    }}
                                                    className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors w-full"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {errors.assessment_reports && <span className="text-xs text-rose-500 font-medium">{errors.assessment_reports}</span>}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('assessment_reports', [
                                            ...data.assessment_reports,
                                            { id: generateUUID(), file: null, description: '' }
                                        ]);
                                    }}
                                    className="w-fit text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1 transition-colors cursor-pointer border border-emerald-500 p-2 rounded hover:bg-emerald-600 hover:text-white"
                                >
                                    + Add More Reports
                                </button>
                            </div>

                            {/* Dynamic Photo Upload Field */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Photos of the Asset
                                </label>

                                <div className='flex flex-col gap-4 py-3 px-2 border-dotted border-2 shadow rounded-lg border-gray-300'>
                                    {data.asset_photos.map((item, index) => (
                                        <div key={item.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                                    <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                                        {item.file ? item.file.name : `Choose physical image file #${index + 1}...`}
                                                    </span>
                                                    <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className="hidden" 
                                                        onChange={e => {
                                                            const files = e.target.files;
                                                            const updatedPhotos = [...data.asset_photos];
                                                            updatedPhotos[index].file = files ? files[0] : null;
                                                            setData('asset_photos', updatedPhotos);
                                                        }}
                                                    />
                                                </label>

                                                {data.asset_photos.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedPhotos = data.asset_photos.filter(p => p.id !== item.id);
                                                            setData('asset_photos', updatedPhotos);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dynamic description input tied directly to this specific photo instance */}
                                            <div className="flex flex-col gap-1 pl-1">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    placeholder={`Photo #${index + 1} Description`}
                                                    onChange={e => {
                                                        const updatedPhotos = [...data.asset_photos];
                                                        updatedPhotos[index].description = e.target.value;
                                                        setData('asset_photos', updatedPhotos);
                                                    }}
                                                    className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors w-full"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {errors.asset_photos && <span className="text-xs text-rose-500 font-medium">{errors.asset_photos}</span>}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('asset_photos', [
                                            ...data.asset_photos,
                                            { id: generateUUID(), file: null, description: '' }
                                        ]);
                                    }}
                                    className="w-fit text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1 transition-colors cursor-pointer border border-emerald-500 p-2 rounded hover:bg-emerald-600 hover:text-white"
                                >
                                    + Add More Photos
                                </button>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
                            <Link 
                                href="/my-assets" 
                                className="inline-flex items-center cursor-pointer gap-1 px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </Link>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center cursor-pointer gap-1.5 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Create Document
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}

CreateAsset.layout = {
    breadcrumbs: [
        {
            title: 'Log Asset',
            href: createAsset(),
        },
    ],
};
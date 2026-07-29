import { Head, useForm } from '@inertiajs/react';
import { FileText, Upload, X, Save } from 'lucide-react';
import React from 'react';
import { ACCOUNTABLE_PERSONNEL } from '@config/dropdown_data';

interface Classification {
  id: number;
  name: string;
}

interface FileItem {
  id: string;
  file: File | null;
  file_path?: string;
  description: string;
}

interface AssetData {
  id: number;
  accountable_personnel: string;
  model: string;
  description: string;
  brand_make: string;
  serial_plate_id_number: string;
  end_user_department: string;
  asset_classification_id: string | number;
  reasons_for_disposal: string;
  asset_location: string;
  others_description?: string;
  assessment_reports?: Array<{ file_path: string; description: string }>;
  asset_photos?: Array<{ file_path: string; description: string }>;
}

interface Props {
  asset: AssetData;
  classifications: Classification[];
  accountable_personnels?: Array<{ value: string; label: string }>;
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function EditAsset({ asset, classifications = [], accountable_personnels = [] }: Props) {
  // Extract JSON array from asset or fallback to 1 empty item
  const initialReports: FileItem[] = asset.assessment_reports?.length
    ? asset.assessment_reports.map((report) => ({
        id: generateUUID(),
        file: null,
        file_path: report.file_path,
        description: report.description || '',
      }))
    : [{ id: generateUUID(), file: null, description: '' }];

  const initialPhotos: FileItem[] = asset.asset_photos?.length
    ? asset.asset_photos.map((photo) => ({
        id: generateUUID(),
        file: null,
        file_path: photo.file_path,
        description: photo.description || '',
      }))
    : [{ id: generateUUID(), file: null, description: '' }];

  const { data, setData, post, transform, processing, errors } = useForm({
    _method: 'PUT',
    accountable_personnel: asset.accountable_personnel || '',
    model: asset.model || '',
    description: asset.description || '',
    brand_make: asset.brand_make || '',
    serial_plate_id_number: asset.serial_plate_id_number || '',
    end_user_department: asset.end_user_department || '',
    asset_classification_id: asset.asset_classification_id || '',
    reasons_for_disposal: asset.reasons_for_disposal || '',
    asset_location: asset.asset_location || '',
    others_description: asset.others_description || '',
    assessment_reports: initialReports,
    asset_photos: initialPhotos,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    transform((data) => ({
        ...data,
        _method: 'PUT',
        assessment_reports: data.assessment_reports.map((item) => ({
        file: item.file || null,
        file_path: item.file_path || null,
        description: item.description || '',
        })),
        asset_photos: data.asset_photos.map((item) => ({
        file: item.file || null,
        file_path: item.file_path || null,
        description: item.description || '',
        })),
    }));

    post(`/asset/update-asset/${asset.id}`, {
        forceFormData: true,
        preserveScroll: true,
    });
    };

  return (
    <>
      <Head title={`Edit Asset - ${asset.serial_plate_id_number || asset.id}`} />

      <div className="w-full p-4 space-y-6">
        <div className="bg-gray-100 p-6 rounded-xl shadow border border-zinc-200">
          <div className="flex justify-between items-center text-dark">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 opacity-90" />
              <h5 className="font-semibold text-lg tracking-tight">Edit Asset Information</h5>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Accountable Personnel */}
              <div className="flex flex-col gap-2">
                <label htmlFor="accountable_personnel" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Accountable Personnel
                </label>
                <select
                  id="accountable_personnel"
                  value={data.accountable_personnel}
                  onChange={(e) => setData('accountable_personnel', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  onChange={(e) => setData('brand_make', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  onChange={(e) => setData('model', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  onChange={(e) => setData('description', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  onChange={(e) => setData('serial_plate_id_number', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Asset Classification */}
              <div className="flex flex-col gap-2">
                <label htmlFor="asset_classification_id" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Asset Classification
                </label>
                <select
                  id="asset_classification_id"
                  value={data.asset_classification_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedItem = classifications?.find((item) => String(item.id) === String(selectedId));

                    setData((prev) => ({
                      ...prev,
                      asset_classification_id: selectedId,
                      others_description: selectedItem?.name?.toLowerCase() === 'others' ? prev.others_description : '',
                    }));
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700"
                >
                  <option value="" disabled>Select Classification..</option>
                  {classifications?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.asset_classification_id && (
                  <span className="text-xs text-rose-500 font-medium">{errors.asset_classification_id}</span>
                )}

                {/* Conditionally show "Others" input */}
                {(() => {
                  const currentSelection = classifications?.find((item) => String(item.id) === String(data.asset_classification_id));
                  if (currentSelection?.name?.toLowerCase() !== 'others') return null;

                  return (
                    <div className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1.5 mt-1">
                      <label htmlFor="others_description" className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                        Other Classification Description
                      </label>
                      <input
                        type="text"
                        id="others_description"
                        value={data.others_description}
                        onChange={(e) => setData('others_description', e.target.value)}
                        placeholder="Please declare the specialized classification name..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-gray-700"
                      />
                      {errors.others_description && (
                        <p className="text-xs text-rose-500 font-medium mt-0.5">{errors.others_description}</p>
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
                  onChange={(e) => setData('reasons_for_disposal', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  onChange={(e) => setData('asset_location', e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Assessment Reports Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Assessment Reports
                </label>

                <div className="flex flex-col gap-4 py-3 px-2 border-dotted border-2 shadow rounded-lg border-gray-300">
                  {data.assessment_reports.map((item, index) => (
                    <div key={item.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                          <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                            {item.file
                              ? item.file.name
                              : item.file_path
                              ? `Existing: ${item.file_path.split('/').pop()}`
                              : `Choose report #${index + 1}...`}
                          </span>
                          <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              const updated = [...data.assessment_reports];
                              updated[index].file = files ? files[0] : null;
                              setData('assessment_reports', updated);
                            }}
                          />
                        </label>

                        {data.assessment_reports.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.assessment_reports.filter((r) => r.id !== item.id);
                              setData('assessment_reports', updated);
                            }}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.description}
                        placeholder={`Report #${index + 1} Description`}
                        onChange={(e) => {
                          const updated = [...data.assessment_reports];
                          updated[index].description = e.target.value;
                          setData('assessment_reports', updated);
                        }}
                        className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setData('assessment_reports', [
                      ...data.assessment_reports,
                      { id: generateUUID(), file: null, description: '' },
                    ]);
                  }}
                  className="w-fit text-xs rounded-lg font-semibold text-emerald-600 border border-emerald-500 p-2 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  + Add More Reports
                </button>
              </div>

              {/* Asset Photos Section */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Photos of the Asset
                </label>

                <div className="flex flex-col gap-4 py-3 px-2 border-dotted border-2 shadow rounded-lg border-gray-300">
                  {data.asset_photos.map((item, index) => (
                    <div key={item.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                          <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                            {item.file
                              ? item.file.name
                              : item.file_path
                              ? `Existing: ${item.file_path.split('/').pop()}`
                              : `Choose photo #${index + 1}...`}
                          </span>
                          <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              const updated = [...data.asset_photos];
                              updated[index].file = files ? files[0] : null;
                              setData('asset_photos', updated);
                            }}
                          />
                        </label>

                        {data.asset_photos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.asset_photos.filter((p) => p.id !== item.id);
                              setData('asset_photos', updated);
                            }}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.description}
                        placeholder={`Photo #${index + 1} Description`}
                        onChange={(e) => {
                          const updated = [...data.asset_photos];
                          updated[index].description = e.target.value;
                          setData('asset_photos', updated);
                        }}
                        className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setData('asset_photos', [
                      ...data.asset_photos,
                      { id: generateUUID(), file: null, description: '' },
                    ]);
                  }}
                  className="w-fit text-xs rounded-lg font-semibold text-emerald-600 border border-emerald-500 p-2 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  + Add More Photos
                </button>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={processing}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {processing ? 'Updating...' : 'Update Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
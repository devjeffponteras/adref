import { ClipboardList, Building2, AlertCircle, FileText, ImageIcon, Download } from 'lucide-react';

interface User {
  id: number;
  name: string;
}

interface AssetClassification {
  id: number;
  name: string;
}

interface AttachedFile {
  path?: string;
  file_path?: string;
  url?: string;
  filename?: string;
  description?: string;
}

interface AssetProfileCardProps {
  asset: {
    accountable_personnel: string | null;
    control_number: string | null;
    brand_make: string | null;
    model: string | null;
    description: string | null;
    serial_plate_id_number: string | null;
    end_user_department: string | null;
    asset_location: string | null;
    reasons_for_disposal: string | null;
    assessment_reports?: string[] | AttachedFile[] | null;
    asset_photos?: string[] | AttachedFile[] | null;
    user?: User | null;
    classification?: AssetClassification | null;
  };
}

export function AssetProfileCard({ asset }: AssetProfileCardProps) {

  const getStorageUrl = (path: string | undefined): string => {
    if (!path) return '';
    // Prevent double slashes if path already starts with '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/storage/${cleanPath}`;
  };

  const openDocumentSecurely = (path: string | undefined) => {
    if (!path) return;
    const fullUrl = getStorageUrl(path);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const normalizeAttachments = (items: string[] | AttachedFile[] | null | undefined): AttachedFile[] => {
    if (!Array.isArray(items)) return [];

    return items.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          path: item,
          description: `Attached File #${idx + 1}`
        };
      }

      // Robust fallback checking for various property naming conventions from backend APIs
      const resolvedPath = item.path || item.file_path || item.url || item.filename || '';

      return {
        ...item,
        path: resolvedPath,
        description: item.description || `Attached File #${idx + 1}`
      };
    });
  };

  const reportsList = normalizeAttachments(asset.assessment_reports);
  const photosList = normalizeAttachments(asset.asset_photos);
  // console.log(asset);
  return (
    <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-md shadow-emerald-900/3 overflow-hidden main-info-card">
      {/* Header */}
      <div className="bg-emerald-50/60 px-6 py-4 border-b border-emerald-100/40 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs">
          <ClipboardList className="w-4 h-4 text-emerald-600" /> Asset Master Profile Specifications
        </div>
        <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
          Verification Detail
        </span>
      </div>

      <div className="p-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          
          {/* Left Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
              Registration Information
            </h3>

            <div>
              <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Asset Control Number</span>
              <span className="text-gray-800 font-semibold">{asset.control_number || 'Pending Assignment'}</span>
            </div>
            
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

          {/* Middle Column */}
          <div className="space-y-4 md:border-l md:border-gray-100 md:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
              Technical Specifications
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Brand / Make</span>
                <span className="text-gray-800 font-semibold">{asset.brand_make || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Model Standard</span>
                <span className="text-gray-800 font-medium">{asset.model || '—'}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Serial / Plate ID Number</span>
              <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded text-xs inline-block border border-gray-200/60 mt-0.5">
                {asset.serial_plate_id_number || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Asset Classification Category</span>
              <span className="text-gray-800 font-medium">{asset.classification?.name || 'Uncategorized'}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Description</span>
              <span className="text-gray-800 font-medium">{asset.description || 'Asset no description'}</span>
            </div>
          </div>

          {/* Right Column: Attachments */}
          <div className="space-y-4 md:border-l md:border-gray-100 md:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
              Attachments
            </h3>
            
            {/* Assessment Reports */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Assessment Reports</h4>
              {reportsList.length > 0 ? (
                reportsList.map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-bold truncate">Report Document #{idx + 1}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed wrap-break-word">
                          {item.description}
                        </p>

                        <div className="flex gap-2 mt-2">
                          <button 
                            type="button"
                            onClick={() => openDocumentSecurely(item.path)}
                            disabled={!item.path}
                            className="text-[11px] inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-0.5 rounded shadow-xs border border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            View Document
                          </button>
                          {item.path && (
                            <a 
                              href={getStorageUrl(item.path)} 
                              download
                              className="text-[11px] inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-0.5 rounded shadow-xs border border-gray-100"
                            >
                              <Download className="w-2.5 h-2.5" /> Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic block pl-1">No documents attached</span>
              )}
            </div>

            {/* Asset Photos */}
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Physical Evidence Photos</h4>
              {photosList.length > 0 ? (
                photosList.map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-bold truncate">Condition Photo #{idx + 1}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed wrap-break-word">
                          {item.description}
                        </p>

                        <div className="flex gap-2 mt-2">
                          <button 
                            type="button"
                            onClick={() => openDocumentSecurely(item.path)}
                            disabled={!item.path}
                            className="text-[11px] inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-0.5 rounded shadow-xs border border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            View Image
                          </button>
                          {item.path && (
                            <a 
                              href={getStorageUrl(item.path)} 
                              download
                              className="text-[11px] inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-0.5 rounded shadow-xs border border-gray-100"
                            >
                              <Download className="w-2.5 h-2.5" /> Save File
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic block pl-1">No photos uploaded</span>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 gap-5">
          <div>
            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">Asset Operational Location</span>
            <span className="text-gray-700 font-medium">{asset.asset_location || 'N/A'}</span>
          </div>

          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50">
            <span className="text-amber-800 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Reason for Disposal
            </span>
            <p className="text-gray-600 leading-relaxed text-sm pl-0.5">
              {asset.reasons_for_disposal || 'No reason specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
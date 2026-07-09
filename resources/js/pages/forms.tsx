import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    FileText, 
    Upload, 
    Printer, 
    Eye, 
    Edit2, 
    Trash2, 
    X, 
    FolderOpen, 
    Plus,
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { forms } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UploadedFile {
    id: number;
    document_path: string;
    purpose: string;
    file_name: string;
    file_path: string;
    user_id: number;
    user: User;
}

interface PageProps extends Record<string, unknown> {
    uploadedFiles?: UploadedFile[];
    flash: {
        success?: string;
    };
}

type SortableKeys = 'file_name' | 'purpose' | 'uploader';
interface SortConfig {
    key: SortableKeys;
    direction: 'asc' | 'desc';
}

export default function Forms() {
    const { props } = usePage<PageProps>();
    const filesList = props.uploadedFiles || [];
    const flash = props.flash;

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);

    // --- Search, Sort & Pagination State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 rows per page

    const { data, setData, post, reset, errors, processing } = useForm({
        file: null as File | null,
        purpose: '',
    });

    // --- Processed Files List (Search -> Sort -> Paginate) ---
    const processedFilesList = useMemo(() => {
        let result = [...filesList];

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(file => 
                file.file_name.toLowerCase().includes(term) ||
                (file.purpose && file.purpose.toLowerCase().includes(term)) ||
                (file.user?.name && file.user.name.toLowerCase().includes(term))
            );
        }

        if (sortConfig !== null) {
            result.sort((a, b) => {
                let aValue = '';
                let bValue = '';

                if (sortConfig.key === 'file_name') {
                    aValue = a.file_name.toLowerCase();
                    bValue = b.file_name.toLowerCase();
                } else if (sortConfig.key === 'purpose') {
                    aValue = (a.purpose || '').toLowerCase();
                    bValue = (b.purpose || '').toLowerCase();
                } else if (sortConfig.key === 'uploader') {
                    aValue = (a.user?.name || '').toLowerCase();
                    bValue = (b.user?.name || '').toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [filesList, searchTerm, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(processedFilesList.length / itemsPerPage));
    const paginatedFilesList = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedFilesList.slice(startIndex, startIndex + itemsPerPage);
    }, [processedFilesList, currentPage, itemsPerPage]);

    // Generate dynamic page numbers for pagination toolbar
    const pageNumbers = useMemo(() => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }, [totalPages]);

    const handleSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const renderSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return (
                <span className="flex flex-col ml-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ChevronUp className="w-3 h-3 -mb-1" />
                    <ChevronDown className="w-3 h-3" />
                </span>
            );
        }
        return sortConfig.direction === 'asc' ? 
            <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-emerald-600" /> : 
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-emerald-600" />;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleOpenUploadModal = () => {
        setEditingFile(null);
        reset();
        setIsUploadModalOpen(true);
    };

    const handleOpenEditModal = (file: UploadedFile) => {
        setEditingFile(file);
        setData({
            file: null,
            purpose: file.purpose
        });
        setIsUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
        setEditingFile(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFile) {
            post(`/forms/form-update/${editingFile.id}`, {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post('/forms/form-upload', {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this document?')) {
            post(`/forms/form-delete/${id}`);
        }
    };

    const handlePrint = (filePath: string) => {
        const printWindow = window.open(filePath, '_blank');
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                printWindow.print();
            }, true);
        }
    };

    return (
        <>
            <Head title="Forms - File Upload Staging" />

            <div className="w-full p-6 bg-gray-50/50 min-h-screen">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <span className="font-semibold">✓ {flash.success}</span>
                    </div>
                )}

                {/* Header Sub-banner */}
                <div className="mb-6 overflow-hidden rounded-lg bg-linear-to-br from-zinc-300 to-zinc-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h5 className="text-lg font-bold tracking-wide text-dark">
                            Forms Management Module
                        </h5>
                        <button
                            type="button"
                            onClick={handleOpenUploadModal}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-sm hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Upload New Document
                        </button>
                    </div>
                </div>

                {/* Main Documents Workspace */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                    {/* Header bar with Context Title & Live Search Bar */}
                    <div className="border-b border-emerald-100/50 bg-linear-to-r from-emerald-50/20 to-transparent px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                            Active Files & Uploaded Documentations
                        </h5>
                        
                        {/* Search Input Box */}
                        <div className="relative w-full md:w-72">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search file..."
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all placeholder-gray-400"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Workspace */}
                    <div className="overflow-x-auto w-full">
                        {paginatedFilesList.length > 0 ? (
                            <>
                                <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                                    <thead className="bg-zinc-100 text-xs font-bold uppercase tracking-wider text-slate-800 select-none">
                                        <tr>
                                            <th 
                                                onClick={() => handleSort('file_name')}
                                                className="py-3.5 pl-6 pr-3 font-semibold w-[25%] cursor-pointer hover:bg-zinc-100/70 group transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    File Name {renderSortIcon('file_name')}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('purpose')}
                                                className="px-4 py-3.5 font-semibold w-[40%] cursor-pointer hover:bg-zinc-100/70 group transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    Purpose / Description {renderSortIcon('purpose')}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('uploader')}
                                                className="px-4 py-3.5 font-semibold w-[20%] cursor-pointer hover:bg-zinc-100/70 group transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    Uploader {renderSortIcon('uploader')}
                                                </div>
                                            </th>
                                            <th className="py-3.5 pr-6 font-semibold text-center w-[20%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                        {paginatedFilesList.map((file) => (
                                            <tr key={file.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 truncate max-w-xs">
                                                    <div className="flex items-center space-x-2.5">
                                                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                                        <span className="truncate">{file.file_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 wrap-break-word line-clamp-2 max-w-sm">
                                                    {file.purpose || <span className="text-gray-400 italic">No explicit purpose assigned</span>}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 max-w-sm capitalize">
                                                    {file?.user?.name || <span className="text-gray-400 italic">No user info</span>}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-center space-x-1.5">
                                                        <button 
                                                            type="button"
                                                            title="Print Document"
                                                            onClick={() => handlePrint(file.file_path)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                        <a 
                                                            href={file.file_path} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            title="View / Download"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <button 
                                                            type="button"
                                                            title="Edit Details"
                                                            onClick={() => handleOpenEditModal(file)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            title="Delete File"
                                                            onClick={() => handleDelete(file.id)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Footer Toolbar */}
                                <div className="border-t border-zinc-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-50/50">
                                    <div className="text-xs text-gray-500">
                                        Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, processedFilesList.length)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedFilesList.length)}</span> of <span className="font-semibold">{processedFilesList.length}</span> documents
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Items Per Page Selector */}
                                        <div className="flex items-center space-x-2 border-r border-gray-200 pr-3 mr-1">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">Rows:</span>
                                            <select
                                                value={itemsPerPage}
                                                onChange={handleLimitChange}
                                                className="text-xs py-1 px-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden text-slate-700 font-medium cursor-pointer"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>

                                        {/* Pagination Button Control Group */}
                                        <div className="inline-flex space-x-1 items-center">
                                            {/* First Page */}
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(1)}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="First Page"
                                            >
                                                <ChevronsLeft className="w-4 h-4" />
                                            </button>

                                            {/* Previous Page */}
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="Previous Page"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Dynamic Numeric Page Jumps */}
                                            {pageNumbers.map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                                        currentPage === page
                                                            ? 'bg-zinc-600 text-white border-zinc-600 shadow-xs'
                                                            : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            {/* Next Page */}
                                            <button
                                                type="button"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="Next Page"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>

                                            {/* Last Page */}
                                            <button
                                                type="button"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="Last Page"
                                            >
                                                <ChevronsRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-16 text-center bg-white">
                                <FolderOpen className="h-12 w-12 text-emerald-200 mb-3" />
                                <h4 className="text-sm font-bold text-gray-800">
                                    {searchTerm ? 'No Matching Results Found' : 'No Documentation Uploaded Yet'}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1">
                                    {searchTerm ? 'Try updating your keywords or clear your search filtering input.' : 'Begin by clicking the upload button above.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* POPUP MODAL: UPLOAD & EDIT DRAWER */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8 animate-fade-in">
                        
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-2.5">
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Upload className="h-4 w-4" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {editingFile ? 'Modify Document Properties' : 'Upload Document'}
                                </h3>
                            </div>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* File Drag/Drop Input Element */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    {editingFile ? 'Replace Document File (Optional)' : 'Select Document'}
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-gray-50/50">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-600 hover:text-emerald-700 focus-within:outline-hidden">
                                                <span>Upload a file</span>
                                                <input 
                                                    type="file" 
                                                    className="sr-only" 
                                                    onChange={e => setData('file', e.target.files ? e.target.files[0] : null)} 
                                                />
                                            </label>
                                            <p className="pl-1 text-gray-500">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-400">PDF, DOCX, XLSX, PNG up to 10MB</p>
                                        {data.file && (
                                            <p className="text-xs font-bold text-emerald-700 mt-2 bg-emerald-50 py-1 px-2 rounded-md inline-block">
                                                Selected: {data.file.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {errors.file && <div className="text-red-500 text-xs mt-1 font-medium">{errors.file}</div>}
                            </div>

                            {/* Purpose Text Area */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Upload Objective / Purpose Statement <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                    placeholder="Provide explicit operational logic or department reasoning for uploading this file asset..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                                />
                                {errors.purpose && <div className="text-red-500 text-xs mt-1 font-medium">{errors.purpose}</div>}
                            </div>

                            {/* Actions Drawer Footer */}
                            <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    disabled={processing} 
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing || (!editingFile && !data.file) || !data.purpose} 
                                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                                            {editingFile ? 'Save Modifications' : 'Submit'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </>
    );
}

Forms.layout = {
    breadcrumbs: [{ title: 'Forms', href: forms() }],
};
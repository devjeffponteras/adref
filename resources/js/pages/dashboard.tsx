import { Head } from '@inertiajs/react';
import { Package, Clock, CircleCheck, RefreshCw, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import FilterDropdown from '@/components/ui/filter-dropdown';
import { WelcomeNote } from '@/components/welcome-note';
import { WelcomeNoteMini } from '@/components/welcome-note-mini';

interface User {
  id: number;
  name: string;
  role?: Role;
  department?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Asset {
  id: number;
  control_number: string | null;
  accountable_personnel: string;
  model: string | null;
  brand_make: string | null;
  serial_plate_id_number: string | null;
  end_user_department: string;
  description: string | null;
  status: string;
  user?: User;
}

interface AssetStatusRecord {
  id: number;
  asset_id: number;
  status: 'Pending' | 'Approved' | 'On-going' | string;
  created_at: string;
  updated_at: string;
  asset: Asset;
}

interface DashboardProps {
  assetStatuses: AssetStatusRecord[];
}

type SortableFields = 'control_number' | 'department' | 'created_by' | 'created_at' | 'updated_at' | 'status';

export default function Dashboard({ assetStatuses }: DashboardProps) {
    const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'on-going' | 'all'>('all');
    
    // Sorting States
    const [sortField, setSortField] = useState<SortableFields>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const stats = useMemo(() => {
    const totalRequests = assetStatuses.length;
    const pendingCount = assetStatuses.filter(item => item.status.toLowerCase() === 'on-going').length;
    const approvedCount = assetStatuses.filter(item => item.status.toLowerCase() === 'approved').length;

    return { totalRequests, pendingCount, approvedCount };
    }, [assetStatuses]);

    const summaryData = useMemo(() => {
        return [
        { 
            receivedFrom: 'End-User (departments)', 
            total: assetStatuses.filter(item => {
                const userRole = item.asset?.user?.role?.name;

                return userRole?.toLowerCase() === 'user';
                }).length,
        },
        { 
            receivedFrom: 'Evaluation Team (Accounting, MCD, MEPEO)', 
            total: assetStatuses.filter(item => {
                const userRole = item.asset?.user?.role?.name;

                return userRole?.toLowerCase() !== 'user' && userRole?.toLowerCase() !== 'admin';
                }).length,
        },
        { 
            receivedFrom: 'Executive Team', 
            total: assetStatuses.filter(item => {
                const userRole = item.asset?.user?.role?.name;

                return userRole?.toLowerCase() === 'admin';
                }).length,
        },
        ];
    }, [assetStatuses]);

    // Sorting Handler
    const handleSort = (field: SortableFields) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset page on sort
    };

    // Filtered and Sorted Computations Combine Block
    const filteredAndSortedRecords = useMemo(() => {
        // 1. Filter raw array items first
        let filtered = assetStatuses;
        if (filterStatus !== 'all') {
            filtered = assetStatuses.filter(record => record.status.toLowerCase() === filterStatus);
        }

        // 2. Sort the array mutation copies cleanly 
        return [...filtered].sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortField) {
                case 'control_number':
                    valA = a.asset?.control_number || '';
                    valB = b.asset?.control_number || '';
                    break;
                case 'department':
                    valA = a.asset?.end_user_department || '';
                    valB = b.asset?.end_user_department || '';
                    break;
                case 'created_by':
                    valA = a.asset?.user?.name || a.asset?.accountable_personnel || '';
                    valB = b.asset?.user?.name || b.asset?.accountable_personnel || '';
                    break;
                case 'created_at':
                    valA = new Date(a.created_at).getTime();
                    valB = new Date(b.created_at).getTime();
                    break;
                case 'updated_at':
                    valA = new Date(a.updated_at).getTime();
                    valB = new Date(b.updated_at).getTime();
                    break;
                case 'status':
                    valA = a.status || '';
                    valB = b.status || '';
                    break;
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [assetStatuses, filterStatus, sortField, sortDirection]);

    // Slice array targets dynamically based on page boundaries
    const totalItems = filteredAndSortedRecords.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    
    const displayedRecentRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredAndSortedRecords.slice(start, end);
    }, [filteredAndSortedRecords, currentPage, rowsPerPage]);

    const entryRange = useMemo(() => {
        if (totalItems === 0) return { start: 0, end: 0 };
        const start = (currentPage - 1) * rowsPerPage + 1;
        const end = Math.min(currentPage * rowsPerPage, totalItems);
        return { start, end };
    }, [currentPage, rowsPerPage, totalItems]);

    const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins <= 0 ? 1 : diffMins}m ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
      return `${diffDays} days ago`;
    };

    const handleFilterSelection = (status: 'pending' | 'approved' | 'on-going') => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
        setCurrentPage(1);
    };

    const handleRefresh = () => {
        window.location.reload(); 
    };

    const statusStyles: Record<string, string> = {
        approved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
        'on-going': 'bg-amber-50 text-amber-800 ring-amber-600/20',
        pending: 'bg-gray-50 text-gray-800 ring-gray-600/20',
        rejected: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    };

    const dotStyles: Record<string, string> = {
        approved: 'bg-emerald-500',
        'on-going': 'bg-amber-500',
        pending: 'bg-gray-500',
        rejected: 'bg-rose-500',
    };

  return (
    <>
      <Head title="Dashboard" />

      <WelcomeNote />

      <div className="container-fluid p-4">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <a href='/disposals' className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-orange-500/5 cursor-pointer">
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-amber-200/20 blur-xl transition-all group-hover:scale-150" />
              <div className="flex justify-between items-start">
                  <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">Total Requests from End-User</p>
                      <h2 className="font-extrabold text-3xl tracking-tight text-amber-950">{stats.totalRequests}</h2>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-100">
                      <Package className='h-6 w-6 text-amber-600' />
                  </div>
              </div>
          </a>

          <a href='/disposals' className="group relative overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 to-teal-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-cyan-500/5 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-cyan-200/20 blur-xl transition-all group-hover:scale-150" />
              <div className="flex justify-between items-start">
                  <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700/80">In Progress</p>
                      <h2 className="font-extrabold text-3xl tracking-tight text-cyan-950">{stats.pendingCount}</h2>
                  </div>
                  <div className="rounded-xl bg-cyan-50 p-3 border border-cyan-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-cyan-100">
                      <Clock className='h-6 w-6 text-cyan-600' />
                  </div>
              </div>
          </a>
          
          <a href='/disposals' className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-emerald-500/5 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-200/20 blur-xl transition-all group-hover:scale-150" />
              <div className="flex justify-between items-start">
                  <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">Approved from Evaluation Team</p>
                      <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{stats.approvedCount}</h2>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                      <CircleCheck className='h-6 w-6 text-emerald-600' />
                  </div>
              </div>
          </a>

        </div>

        <div className='flex flex-col md:flex-row w-full gap-4'>
          {/* Recent Records Table */}
          <div className="my-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full md:w-2/3">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm px-6 py-4">
              <div className="flex items-center gap-3">
                <h5 className="text-lg font-bold tracking-tight text-slate-800">Recent ADREF Submitted</h5>
              </div>

              <div className="flex items-center gap-2">
                <FilterDropdown 
                  onFilterChange={handleFilterSelection} 
                  onReset={handleResetFilters} 
                />
                
                <button 
                  id="refresh-summary" 
                  onClick={handleRefresh}
                  className="group inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-emerald-600 text-xs font-medium text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" 
                  title="Refresh Table"
                >
                  <RefreshCw className="h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-180" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-slate-800/80">
                  <tr>
                    <th scope="col" onClick={() => handleSort('control_number')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center gap-1.5">Asset Control Number <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                    <th scope="col" onClick={() => handleSort('department')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center gap-1.5">Department <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                    <th scope="col" onClick={() => handleSort('created_by')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center gap-1.5">Created By <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                    <th scope="col" onClick={() => handleSort('created_at')} className="py-3.5 pl-6 pr-3 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center gap-1.5">Application Date &amp; Time <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                    <th scope="col" onClick={() => handleSort('updated_at')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center gap-1.5">Updated At <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                    <th scope="col" onClick={() => handleSort('status')} className="py-3.5 pr-6 font-semibold text-center cursor-pointer hover:bg-gray-200 select-none transition-colors">
                      <div className="flex items-center justify-center gap-1.5">Status <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                    </th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                  {displayedRecentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No matching ADREF requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRecentRecords.map((record) => (
                      <tr key={record.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                        <td className="px-4 py-4 font-mono text-base font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                          {record.asset?.control_number || 'N/A'}
                        </td>
                        <td className="px-4 py-4 max-w-xs truncate font-medium text-gray-900 group-hover:text-gray-700">
                          {record.asset?.end_user_department || 'N/A'}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700 capitalize">
                          {record.asset?.user?.name || record.asset?.accountable_personnel || 'Unknown'}
                        </td>
                        <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors text-xs">
                          {new Date(record.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400 group-hover:text-gray-500">
                          {formatTimeAgo(record.updated_at)}
                        </td>
                        <td className="py-4 pr-6 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                              statusStyles[record.status.toLowerCase()] || 'bg-gray-50 text-gray-800 ring-gray-600/20'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                dotStyles[record.status.toLowerCase()] || 'bg-gray-500'
                              }`}></span>
                              <span className="capitalize">{record.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Segment */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
                <div className="text-xs text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{entryRange.start}</span> to{' '}
                  <span className="font-semibold text-gray-700">{entryRange.end}</span> of{' '}
                  <span className="font-semibold text-gray-700">{totalItems}</span> items
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5 mr-1">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Rows:</span>
                    <select 
                      value={rowsPerPage} 
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-md border border-gray-300 bg-white py-1 px-2 text-xs font-medium text-gray-700 shadow-xs focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-2xs hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-zinc-800 text-white hover:bg-zinc-900'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-zinc-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-2xs hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Table */}
          <div className="my-6 overflow-hidden rounded-xl h-fit border border-gray-100 bg-white shadow-sm w-full md:w-1/3">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className='inline-flex items-center gap-3'>
                <h5 className="text-lg font-bold text-slate-800">Summary of all ADREF Requests</h5>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-100 text-left align-middle text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 font-medium text-gray-600 tracking-wide">Received From</th>
                    <th scope="col" className="px-3 py-3.5 font-medium text-gray-600 tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {summaryData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 pl-6 pr-3 font-medium text-gray-900">{row.receivedFrom}</td>
                      <td className="px-3 py-4 text-gray-600">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/admin-dashboard',
    },
  ],
};
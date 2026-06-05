import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Package, Clock, CircleCheck, RefreshCw } from 'lucide-react';
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

export default function Dashboard({ assetStatuses }: DashboardProps) {
    const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'on-going' | 'all'>('all');

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

    const displayedRecentRecords = useMemo(() => {
        if (filterStatus === 'all') return assetStatuses;
        
        return assetStatuses.filter(record => {
        return record.status.toLowerCase() === filterStatus;
        });
    }, [assetStatuses, filterStatus]);

    const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins <= 0 ? 1 : diffMins}m ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const handleFilterSelection = (status: 'pending' | 'approved' | 'on-going') => {
        setFilterStatus(status);
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
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
        <WelcomeNoteMini />
        
        {/* Metric Cards Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="w-full md:w-1/3">
            <div className="stat-card bg-emerald text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 opacity-75 text-sm">Total Requests from End-User</p>
                  <h2 className="font-bold text-2xl">{stats.totalRequests}</h2>
                </div>
                <Package className='h-8 w-8 opacity-80' />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="stat-card bg-leaf text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 opacity-75 text-sm">In Progress</p>
                  <h2 className="font-bold text-2xl">{stats.pendingCount}</h2>
                </div>
                <Clock className='h-8 w-8 opacity-80' />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="stat-card bg-dark-green text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 opacity-75 text-sm">Approved from Evaluation Team</p>
                  <h2 className="font-bold text-2xl">{stats.approvedCount}</h2>
                </div>
                <CircleCheck className='h-8 w-8 opacity-80' />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="my-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div className='inline-flex items-center gap-3'>
              <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
              <h5 className="text-lg font-bold text-[#004d40]">Summary of all ADREF Requests</h5>
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

        {/* Recent Records Table */}
        <div className="my-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/3">
          <div className="flex items-center justify-between border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
              <h5 className="text-lg font-bold tracking-tight text-[#004d40]">Recent ADREF submitted</h5>
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
              <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Updated At</th>
                  <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status</th>
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
                      <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                        {new Date(record.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                        {record.asset?.control_number || 'N/A'}
                      </td>
                      <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                        {record.asset?.end_user_department || 'N/A'}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700">
                        {record.asset?.user?.name || record.asset?.accountable_personnel || 'Unknown'}
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400 group-hover:text-gray-500">
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
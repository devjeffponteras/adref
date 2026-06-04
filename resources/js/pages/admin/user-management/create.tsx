import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { 
    CircleCheck, 
    XIcon, 
    UserPlusIcon, 
    ArrowLeftCircleIcon, 
    SaveIcon 
} from 'lucide-react';
import { Role } from '@/types/models';

interface CreateProps {
    roles: Role[];
}

export default function UserManagementCreate({ roles = [] }: CreateProps) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors, reset, setError } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '', // 🟢 Track confirm password state
        role_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.password !== data.password_confirmation) {
            setError('password', 'Your passwords do not match. Please verify.');
            return;
        }

        post('/admin/user-management/store', {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create User - Management" />

            {/* Sub Header */}
            <WelcomeNote />
            
            {/* Main Content Container */}
            <div className="container-fluid p-6 max-w-3xl mx-auto">

                {/* Flash Messages Notifications */}
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600 shrink-0" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Card Container Form */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                    
                    {/* Form Title Header */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <UserPlusIcon className="h-5 w-5 text-emerald-700" />
                            Register New System User
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Create an operational account profile and assign a core administrative authorization role.
                        </p>
                    </div>

                    {/* Registration Form Block */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        
                        {/* Name Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. Juan Dela Cruz"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={`w-full p-2.5 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 focus:outline-emerald-500 focus:border-emerald-500
                                    ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                            <input 
                                type="email"
                                placeholder="john.doe@company.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className={`w-full p-2.5 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 focus:outline-emerald-500 focus:border-emerald-500
                                    ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Original Password Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Account Password</label>
                                <input 
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full p-2.5 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 focus:outline-emerald-500 focus:border-emerald-500
                                        ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            {/* 🟢 NEW: Confirm Password Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Confirm Password</label>
                                <input 
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className={`w-full p-2.5 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 focus:outline-emerald-500 focus:border-emerald-500
                                        ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                />
                            </div>
                        </div>

                        {/* Role Selector Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">System Authorization Level</label>
                            <select
                                value={data.role_id}
                                onChange={e => setData('role_id', e.target.value)}
                                className={`w-full p-2.5 text-sm border rounded-lg shadow-2xs transition-colors duration-150 bg-white text-gray-700 focus:outline-emerald-500 focus:border-emerald-500 cursor-pointer
                                    ${errors.role_id ? 'border-red-300' : 'border-gray-300'}`}
                            >
                                <option value="">Select a system access assignment...</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.role_id && <p className="text-xs text-red-500 mt-1">{errors.role_id}</p>}
                        </div>

                        {/* Action Buttons Footer Block */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <Link 
                                href="/admin/user-management/index" 
                                className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <ArrowLeftCircleIcon className='h-4 w-4 mr-1.5' />
                                Back to Registry
                            </Link>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center cursor-pointer px-5 py-2.5 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden disabled:opacity-50 transition-colors duration-150 shadow-xs"
                            >
                                <SaveIcon className='h-4 w-4 mr-1.5' />
                                Save Profile Entry
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </>
    );
}

UserManagementCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
            href: '/users',
        },
        {
            title: 'Create User',
        },
    ],
};
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import { scanLogAsset } from '@/routes';


export default function  ScanLogAsset() {

    const { auth } = usePage().props as any;
    const logedInUser = auth?.user?.role?.name ? auth.user.role.name.charAt(0).toUpperCase() + auth.user.role.name.slice(1).toLowerCase() : 'User';

    return (
        <>
        <Head title="My Assets" />

            {/* Welcome note */}
            {/* <WelcomeNote /> */}
            
            <div className="w-full p-4">

                {/* Main Card Wrapper */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm py-12 px-6">
                    <div className="flex flex-col items-center justify-center text-center gap-6">
                        
                        {/* Header Section with Icon */}
                        <div className="flex items-center justify-center gap-2 font-bold text-gray-800 tracking-wide text-sm sm:text-base">
                            <FileText className="h-8 w-8 text-gray-700 stroke-[1.75]" />
                            <span>DOCUMENT IN</span>
                        </div>
                        
                        {/* Subheading Text */}
                        <h3 className="text-sm font-semibold text-gray-500 leading-relaxed max-w-xl">
                            Here you can apply for asset disposal request <br className="hidden sm:inline" /> 
                            and log it into the system
                        </h3>
                        
                        {/* Action Button - Converted to Inertia Link */}
                        <Link 
                            href="/create-asset" 
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 group"
                        >
                            <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="text-base font-medium">
                                Create Document
                            </span>
                        </Link>
                        
                    </div>
                </div>
                
            </div>

        </>
    );
}
        
ScanLogAsset.layout = {
    breadcrumbs: [
        {
            title: 'Scan / Log Asset',
            href: scanLogAsset(),
        },
    ],
};
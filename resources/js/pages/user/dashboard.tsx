import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Folder, CircleCheck, XIcon } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';

export default function UserDashboard() {

    return (
        <>
            <Head title="Asid Dashboard" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">
                <div className="rounded border border-gray-200 shadow bg-gray-50 p-4">
                    <h2 className='text-lg font-bold text-green-700'>
                        Asset Disposal System Overview
                    </h2>

                    <p className='text-gray-600 text-sm pt-3 leading-normal'>
                        The Asset Disposal System provides a structured mechanism for disposing of fixed assets and inventory items of Philsaga Mining Corporation and Mindanao Mineral Processing and Refining Corporation in an orderly and compliant manner. 
                        It ensures that assets reaching the final phase of their useful life particularly those that are obsolete, nonfunctional, or totally unusable are properly evaluated, documented, and disposed of using approved methods. 
                        The system also establishes management guidelines and accountability measures to support environmental and operational requirements, promoting efficient resource management while maintaining accurate records and regulatory compliance.
                    </p>

                </div>
            </div>
        </>
    );
}

UserDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/user-dashboard',
        },
    ],
};
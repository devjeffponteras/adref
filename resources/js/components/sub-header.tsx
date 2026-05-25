import { usePage } from '@inertiajs/react';

export default function SubHeader() {
    const { auth } = usePage().props as any;
    
    const loggedInUser = auth?.user?.role?.name 
        ? auth.user.role.name.charAt(0).toUpperCase() + auth.user.role.name.slice(1).toLowerCase() 
        : 'User';

    return (
        <div className="w-full bg-emerald-700 p-6 shadow-sm">
            <div className="flex flex-col text-white gap-1">
                <h3 className="font-bold text-2xl tracking-tight">
                    Hello, {loggedInUser}!
                </h3>
                <p className="text-sm opacity-90 font-medium">
                    Welcome to Automated Asset for Disposal System
                </p>
            </div>
        </div>
    );
}
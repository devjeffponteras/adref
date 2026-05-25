import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}
                {/* <AppLogoIcon className="size-5 text-white dark:text-black dark:fill-white" /> */}
                <img 
                    src="/images/logo/pmc-logo-solo.png" 
                    alt="ads-logo" 
                    className="size-full rounded-md object-contain" 
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    PMC - ADS
                </span>
            </div>
        </>
    );
}

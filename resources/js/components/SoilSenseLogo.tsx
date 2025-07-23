// File: resources/js/components/SoilSenseLogo.tsx

import { Link } from '@inertiajs/react';
import { Leaf } from 'lucide-react';

interface SoilSenseLogoProps {
    showSubtitle?: boolean;
    linkTo?: string;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

export default function SoilSenseLogo({ showSubtitle = true, linkTo = '/', className = '', size = 'medium' }: SoilSenseLogoProps) {
    const sizeClasses = {
        small: {
            container: 'h-8 w-8',
            icon: 'h-4 w-4',
            title: 'text-lg',
            subtitle: 'text-xs',
        },
        medium: {
            container: 'h-10 w-10',
            icon: 'h-6 w-6',
            title: 'text-xl',
            subtitle: 'text-xs',
        },
        large: {
            container: 'h-12 w-12',
            icon: 'h-8 w-8',
            title: 'text-2xl',
            subtitle: 'text-sm',
        },
    };

    const currentSize = sizeClasses[size];

    const LogoContent = () => (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className="relative">
                <div
                    className={`flex ${currentSize.container} items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg ring-2 ring-green-200`}
                >
                    <Leaf className={`${currentSize.icon} text-white`} />
                </div>
            </div>
            <div>
                <h1 className={`bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text ${currentSize.title} font-bold text-transparent`}>
                    SoilSense
                </h1>
                {showSubtitle && <p className={`${currentSize.subtitle} text-slate-500`}>Smart Agriculture System</p>}
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo} className="transition-transform hover:scale-105">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
}

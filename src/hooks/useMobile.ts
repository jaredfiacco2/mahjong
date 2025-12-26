import { useState, useEffect } from 'react';

export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
            setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile, isTablet, isDesktop: !isMobile && !isTablet, orientation };
};

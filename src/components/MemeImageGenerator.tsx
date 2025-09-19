import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { MemeState } from '../types';
import { SMSContainer } from './SMSContainer';

interface MemeImageGeneratorProps {
    memeState: MemeState;
}

export interface MemeImageGeneratorRef {
    getImageElement: () => HTMLElement | null;
    showForCapture: () => void;
    hideAfterCapture: () => void;
}

export const MemeImageGenerator = forwardRef<MemeImageGeneratorRef, MemeImageGeneratorProps>(
    ({ memeState }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const [isCapturing, setIsCapturing] = useState(false);

        useImperativeHandle(ref, () => ({
            getImageElement: () => containerRef.current,
            showForCapture: () => setIsCapturing(true),
            hideAfterCapture: () => setIsCapturing(false),
        }));

        return (
            <div
                style={{
                    position: 'fixed',
                    left: isCapturing ? '50%' : '-9999px',
                    top: isCapturing ? '50%' : '-9999px',
                    transform: isCapturing ? 'translate(-50%, -50%)' : 'none',
                    width: '375px', // iPhone width
                    height: 'auto',
                    zIndex: isCapturing ? 10000 : -1000,
                    pointerEvents: 'none',
                    // Ensure consistent rendering
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    // Add white background when capturing
                    backgroundColor: isCapturing ? 'white' : 'transparent',
                    padding: isCapturing ? '20px' : '0',
                    borderRadius: isCapturing ? '8px' : '0',
                    boxShadow: isCapturing ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                }}
            >
                <div ref={containerRef}>
                    <SMSContainer memeState={memeState} />
                </div>
            </div>
        );
    }
);

MemeImageGenerator.displayName = 'MemeImageGenerator';

export default MemeImageGenerator;
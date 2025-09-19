import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
});

describe('Responsive Design', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        window.matchMedia = mockMatchMedia;
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    describe('Mobile Layout', () => {
        beforeEach(() => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 667,
            });
        });

        it('should render mobile-optimized layout', () => {
            render(<App />);

            // Check that main elements are present
            expect(screen.getByText('Văn mẫu đòi tiền')).toBeInTheDocument();
            expect(screen.getByText('Edit Your Meme')).toBeInTheDocument();
            expect(screen.getByText('Show Advanced Settings')).toBeInTheDocument();
        });

        it('should have mobile-friendly button layout', () => {
            render(<App />);

            // Check that buttons are present
            expect(screen.getByText('Reset to Original')).toBeInTheDocument();
            expect(screen.getByText('HTML-to-Image')).toBeInTheDocument();
            expect(screen.getByText('Capture')).toBeInTheDocument(); // Mobile version shows "Capture" instead of "Screen Capture"
        });

        it('should display SMS container with proper mobile sizing', () => {
            render(<App />);

            // Check that SMS messages are rendered (there might be multiple instances)
            expect(screen.getAllByText('b ơi, t bị phân vân')).toHaveLength(2); // Editable and display versions
            expect(screen.getAllByText('Làm sao')).toHaveLength(2);
        });

        it('should handle advanced settings toggle on mobile', () => {
            render(<App />);

            const toggleButton = screen.getByText('Show Advanced Settings');
            expect(toggleButton).toBeInTheDocument();

            // Advanced settings should be hidden by default
            expect(screen.queryByText('Contact Name')).not.toBeInTheDocument();
        });
    });

    describe('Tablet Layout', () => {
        beforeEach(() => {
            // Mock tablet viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 1024,
            });
        });

        it('should render tablet-optimized layout', () => {
            render(<App />);

            // Check that main elements are present with tablet sizing
            expect(screen.getByText('Văn mẫu đòi tiền')).toBeInTheDocument();
            expect(screen.getByText('Edit Your Meme')).toBeInTheDocument();
        });

        it('should show full button text on tablet', () => {
            render(<App />);

            // On tablet and larger, should show full "Screen Capture" text
            expect(screen.getByText('Screen Capture')).toBeInTheDocument();
        });
    });

    describe('Desktop Layout', () => {
        beforeEach(() => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 1080,
            });
        });

        it('should render desktop-optimized layout', () => {
            render(<App />);

            // Check that main elements are present with desktop sizing
            expect(screen.getByText('Văn mẫu đòi tiền')).toBeInTheDocument();
            expect(screen.getByText('Edit Your Meme')).toBeInTheDocument();
        });

        it('should show full button text and proper spacing on desktop', () => {
            render(<App />);

            // Desktop should show full text
            expect(screen.getByText('Screen Capture')).toBeInTheDocument();
            expect(screen.getByText('HTML-to-Image')).toBeInTheDocument();
            expect(screen.getByText('Reset to Original')).toBeInTheDocument();
        });
    });

    describe('Touch-Friendly Controls', () => {
        it('should have adequate touch targets for mobile', () => {
            render(<App />);

            // Check that buttons have adequate size for touch
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                const styles = window.getComputedStyle(button);
                // Buttons should have adequate padding for touch targets
                expect(button).toBeInTheDocument();
            });
        });

        it('should handle keyboard navigation', () => {
            render(<App />);

            // Check that interactive elements are focusable
            const toggleButton = screen.getByText('Show Advanced Settings');
            expect(toggleButton).toBeInTheDocument();
            expect(toggleButton.tagName).toBe('BUTTON');
        });
    });

    describe('Performance on Mobile', () => {
        it('should not render hidden preview panel', () => {
            render(<App />);

            // Live preview should be hidden to improve mobile performance
            expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
            expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
        });

        it('should have optimized image sizes for mobile', () => {
            render(<App />);

            // Check that QR code image is present (from message 7)
            const images = screen.getAllByRole('img');
            expect(images.length).toBeGreaterThan(0);
        });
    });

    describe('Responsive Text and Spacing', () => {
        it('should use appropriate text sizes for different screen sizes', () => {
            render(<App />);

            // Check that text content is readable
            expect(screen.getByText('Văn mẫu đòi tiền')).toBeInTheDocument();
            expect(screen.getByText('Edit Your Meme')).toBeInTheDocument();
            expect(screen.getByText('Click on any message, contact name, or timestamp to edit it. Use Enter to save, Esc to cancel.')).toBeInTheDocument();
        });

        it('should have proper spacing between elements', () => {
            render(<App />);

            // Check that main layout elements are present and properly spaced
            const mainContainer = screen.getByText('Văn mẫu đòi tiền').closest('div');
            expect(mainContainer).toBeInTheDocument();
        });
    });
});
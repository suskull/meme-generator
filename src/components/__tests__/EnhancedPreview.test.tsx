import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedPreview } from '../EnhancedPreview';
import { DEFAULT_MEME_STATE } from '../../data/template';

describe('EnhancedPreview', () => {
  it('renders preview with default meme state', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    // The status text shows "Updating..." initially due to debouncing, then changes to "Live"
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('displays preview statistics correctly', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    // Check message count
    expect(screen.getByText('7')).toBeInTheDocument(); // 7 messages
    expect(screen.getByText('Messages')).toBeInTheDocument();
    
    // Check images count (should be 0 initially)
    expect(screen.getByText('Images')).toBeInTheDocument();
    
    // Check characters count
    expect(screen.getByText('Characters')).toBeInTheDocument();
  });

  it('shows different preview sizes', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    // Check mobile button (should be active by default)
    const mobileButton = screen.getByTitle('Mobile view (320px)');
    expect(mobileButton).toBeInTheDocument();
    
    // Check tablet button
    const tabletButton = screen.getByTitle('Tablet view (768px)');
    expect(tabletButton).toBeInTheDocument();
    
    // Check desktop button
    const desktopButton = screen.getByTitle('Desktop view (1024px)');
    expect(desktopButton).toBeInTheDocument();
  });

  it('switches preview sizes when buttons are clicked', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    const tabletButton = screen.getByTitle('Tablet view (768px)');
    fireEvent.click(tabletButton);
    
    // Tablet button should now be active (have blue background)
    expect(tabletButton).toHaveClass('bg-blue-500');
  });

  it('shows empty state when no messages', () => {
    const emptyState = {
      ...DEFAULT_MEME_STATE,
      messages: []
    };
    
    render(<EnhancedPreview memeState={emptyState} />);
    
    expect(screen.getByText('Start editing to see your meme preview')).toBeInTheDocument();
  });

  it('displays sent and received message counts', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EnhancedPreview memeState={DEFAULT_MEME_STATE} className="custom-preview" />
    );
    
    expect(container.firstChild).toHaveClass('custom-preview');
  });

  it('shows updating state indicator', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    // Should show either "Live" or "Updating..." status
    const statusElement = screen.queryByText('Live') || screen.queryByText('Updating...');
    expect(statusElement).toBeInTheDocument();
  });

  it('renders SMS container with meme state', () => {
    render(<EnhancedPreview memeState={DEFAULT_MEME_STATE} />);
    
    // Check if the SMS content is rendered
    expect(screen.getByText('Bánh')).toBeInTheDocument(); // Contact name
    expect(screen.getByText('SMS')).toBeInTheDocument(); // Platform
  });
});
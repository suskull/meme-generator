import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the main title', () => {
    render(<App />);
    
    expect(screen.getByText('Văn mẫu đòi tiền')).toBeInTheDocument();
  });

  it('shows toggle button for advanced settings', () => {
    render(<App />);
    
    expect(screen.getByText('Show Advanced Settings')).toBeInTheDocument();
  });

  it('hides metadata editor by default', () => {
    render(<App />);
    
    expect(screen.queryByText('Contact Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
  });

  it('shows metadata editor when toggle button is clicked', () => {
    render(<App />);
    
    const toggleButton = screen.getByText('Show Advanced Settings');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    expect(screen.getByText('Contact Name')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('changes toggle button text when metadata editor is shown', () => {
    render(<App />);
    
    const toggleButton = screen.getByText('Show Advanced Settings');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Hide Advanced Settings')).toBeInTheDocument();
  });

  it('hides metadata editor when close button is clicked', () => {
    render(<App />);
    
    // Show the metadata editor
    const toggleButton = screen.getByText('Show Advanced Settings');
    fireEvent.click(toggleButton);
    
    // Click the close button
    const closeButton = screen.getByTitle('Close advanced settings');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Contact Name')).not.toBeInTheDocument();
    expect(screen.getByText('Show Advanced Settings')).toBeInTheDocument();
  });

  it('shows pro tip when metadata editor is hidden', () => {
    render(<App />);
    
    expect(screen.getByText('Pro Tip')).toBeInTheDocument();
    expect(screen.getByText(/You can click directly on the contact name/)).toBeInTheDocument();
  });

  it('hides pro tip when metadata editor is shown', () => {
    render(<App />);
    
    const toggleButton = screen.getByText('Show Advanced Settings');
    fireEvent.click(toggleButton);
    
    expect(screen.queryByText('Pro Tip')).not.toBeInTheDocument();
  });

  it('renders editable SMS container', () => {
    render(<App />);
    
    expect(screen.getByText('Edit Your Meme')).toBeInTheDocument();
    expect(screen.getAllByText('Bánh')).toHaveLength(2); // Contact name appears in editor and hidden image generator (preview is hidden)
  });

  it('renders live preview system', () => {
    render(<App />);
    
    // Live preview is now hidden, so we should not find these elements
    expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
  });

  it('renders reset button', () => {
    render(<App />);
    
    expect(screen.getByText('Reset to Original')).toBeInTheDocument();
  });

  it('applies correct styling to toggle button when active', () => {
    render(<App />);
    
    const toggleButton = screen.getByText('Show Advanced Settings');
    expect(toggleButton).toHaveClass('bg-white', 'text-gray-700');
    
    fireEvent.click(toggleButton);
    
    const activeToggleButton = screen.getByText('Hide Advanced Settings');
    expect(activeToggleButton).toHaveClass('bg-blue-500', 'text-white');
  });
});
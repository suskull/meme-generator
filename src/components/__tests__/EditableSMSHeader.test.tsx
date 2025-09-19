import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableSMSHeader } from '../EditableSMSHeader';
import { MemeMetadata } from '../../types';

describe('EditableSMSHeader', () => {
  const mockOnMetadataChange = vi.fn();
  
  const testMetadata: MemeMetadata = {
    contactName: 'John Doe',
    timestamp: '24 Jul 11:49 PM',
    phoneNumber: '1234567890',
    platform: 'SMS'
  };

  beforeEach(() => {
    mockOnMetadataChange.mockClear();
  });

  it('renders contact name and phone number', () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('enters edit mode when contact name is clicked', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactName = screen.getByText('John Doe');
    fireEvent.click(contactName);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('enters edit mode when phone number is clicked', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const phoneNumber = screen.getByText('1234567890');
    fireEvent.click(phoneNumber);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });
  });

  it('saves contact name changes when Enter is pressed', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactName = screen.getByText('John Doe');
    fireEvent.click(contactName);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'Jane Smith' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Jane Smith');
  });

  it('saves phone number changes when Enter is pressed', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const phoneNumber = screen.getByText('1234567890');
    fireEvent.click(phoneNumber);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('1234567890');
      fireEvent.change(input, { target: { value: '9876543210' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('phoneNumber', '9876543210');
  });

  it('cancels editing when Escape is pressed', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactName = screen.getByText('John Doe');
    fireEvent.click(contactName);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'Jane Smith' } });
      fireEvent.keyDown(input, { key: 'Escape' });
    });
    
    expect(mockOnMetadataChange).not.toHaveBeenCalled();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('saves changes when input loses focus', async () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactName = screen.getByText('John Doe');
    fireEvent.click(contactName);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'Jane Smith' } });
      fireEvent.blur(input);
    });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Jane Smith');
  });

  it('displays carrier info and battery status', () => {
    render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    expect(screen.getByText('Carrier')).toBeInTheDocument();
    expect(screen.getByText('9:41 AM')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows edit icons on hover', () => {
    const { container } = render(<EditableSMSHeader metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const editIcons = container.querySelectorAll('svg');
    // Should have back button, profile icon, call button, and 2 edit icons
    expect(editIcons.length).toBeGreaterThanOrEqual(5);
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EditableSMSHeader 
        metadata={testMetadata} 
        onMetadataChange={mockOnMetadataChange}
        className="custom-header"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-header');
  });
});
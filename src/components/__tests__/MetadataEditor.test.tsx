import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MetadataEditor } from '../MetadataEditor';
import { MemeMetadata } from '../../types';

describe('MetadataEditor', () => {
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

  it('renders all metadata fields', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('24 Jul 11:49 PM')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SMS')).toBeInTheDocument();
    expect(screen.getByText('Contact Name')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('calls onMetadataChange when contact name is changed', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(contactNameInput, { target: { value: 'Jane Smith' } });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Jane Smith');
  });

  it('calls onMetadataChange when phone number is changed', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const phoneInput = screen.getByDisplayValue('1234567890');
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('phoneNumber', '9876543210');
  });

  it('calls onMetadataChange when timestamp is changed', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const timestampInput = screen.getByDisplayValue('24 Jul 11:49 PM');
    fireEvent.change(timestampInput, { target: { value: '25 Jul 12:00 AM' } });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('timestamp', '25 Jul 12:00 AM');
  });

  it('calls onMetadataChange when platform is changed', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const platformSelect = screen.getByDisplayValue('SMS');
    fireEvent.change(platformSelect, { target: { value: 'WhatsApp' } });
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('platform', 'WhatsApp');
  });

  it('shows validation errors for invalid contact name', async () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(contactNameInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Contact name is required/)).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid phone number', async () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const phoneInput = screen.getByDisplayValue('1234567890');
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone!@#' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Phone number contains invalid characters/)).toBeInTheDocument();
    });
  });

  it('applies red border to invalid fields', async () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(contactNameInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(contactNameInput).toHaveClass('border-red-500');
    });
  });

  it('sets current time when Current Time preset is clicked', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const currentTimeButton = screen.getByText('Current Time');
    fireEvent.click(currentTimeButton);
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('timestamp', expect.any(String));
  });

  it('sets mom contact when Mom Contact preset is clicked', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const momContactButton = screen.getByText('Mom Contact');
    fireEvent.click(momContactButton);
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Mom');
    expect(mockOnMetadataChange).toHaveBeenCalledWith('phoneNumber', '+1 (555) 123-4567');
  });

  it('sets friend contact when Friend Contact preset is clicked', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const friendContactButton = screen.getByText('Friend Contact');
    fireEvent.click(friendContactButton);
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Best Friend');
    expect(mockOnMetadataChange).toHaveBeenCalledWith('phoneNumber', '+1 (555) 987-6543');
  });

  it('sets unknown contact when Unknown Number preset is clicked', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const unknownContactButton = screen.getByText('Unknown Number');
    fireEvent.click(unknownContactButton);
    
    expect(mockOnMetadataChange).toHaveBeenCalledWith('contactName', 'Unknown');
    expect(mockOnMetadataChange).toHaveBeenCalledWith('phoneNumber', '+1 (555) 000-0000');
  });

  it('respects maxLength for contact name', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    const contactNameInput = screen.getByDisplayValue('John Doe');
    expect(contactNameInput).toHaveAttribute('maxLength', '50');
  });

  it('shows format hint for timestamp', () => {
    render(<MetadataEditor metadata={testMetadata} onMetadataChange={mockOnMetadataChange} />);
    
    expect(screen.getByText('Format: DD MMM HH:MM AM/PM')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <MetadataEditor 
        metadata={testMetadata} 
        onMetadataChange={mockOnMetadataChange}
        className="custom-metadata-editor"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-metadata-editor');
  });
});
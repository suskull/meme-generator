import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableSMSTimestamp } from '../EditableSMSTimestamp';

describe('EditableSMSTimestamp', () => {
  const mockOnTimestampChange = vi.fn();
  const mockOnPlatformChange = vi.fn();
  
  const defaultProps = {
    timestamp: '24 Jul 11:49 PM',
    platform: 'SMS',
    onTimestampChange: mockOnTimestampChange,
    onPlatformChange: mockOnPlatformChange
  };

  beforeEach(() => {
    mockOnTimestampChange.mockClear();
    mockOnPlatformChange.mockClear();
  });

  it('renders timestamp and platform', () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    expect(screen.getByText('24 Jul 11:49 PM')).toBeInTheDocument();
    expect(screen.getByText('SMS')).toBeInTheDocument();
  });

  it('enters edit mode when timestamp is clicked', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const timestamp = screen.getByText('24 Jul 11:49 PM');
    fireEvent.click(timestamp);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('24 Jul 11:49 PM')).toBeInTheDocument();
    });
  });

  it('enters edit mode when platform is clicked', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const platform = screen.getByText('SMS');
    fireEvent.click(platform);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('SMS')).toBeInTheDocument();
    });
  });

  it('saves timestamp changes when Enter is pressed', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const timestamp = screen.getByText('24 Jul 11:49 PM');
    fireEvent.click(timestamp);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('24 Jul 11:49 PM');
      fireEvent.change(input, { target: { value: '25 Jul 12:00 AM' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    expect(mockOnTimestampChange).toHaveBeenCalledWith('25 Jul 12:00 AM');
  });

  it('saves platform changes when Enter is pressed', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const platform = screen.getByText('SMS');
    fireEvent.click(platform);
    
    await waitFor(() => {
      const select = screen.getByDisplayValue('SMS');
      fireEvent.change(select, { target: { value: 'WhatsApp' } });
      fireEvent.keyDown(select, { key: 'Enter' });
    });
    
    expect(mockOnPlatformChange).toHaveBeenCalledWith('WhatsApp');
  });

  it('cancels editing when Escape is pressed', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const timestamp = screen.getByText('24 Jul 11:49 PM');
    fireEvent.click(timestamp);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('24 Jul 11:49 PM');
      fireEvent.change(input, { target: { value: '25 Jul 12:00 AM' } });
      fireEvent.keyDown(input, { key: 'Escape' });
    });
    
    expect(mockOnTimestampChange).not.toHaveBeenCalled();
    expect(screen.getByText('24 Jul 11:49 PM')).toBeInTheDocument();
  });

  it('saves changes when input loses focus', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const timestamp = screen.getByText('24 Jul 11:49 PM');
    fireEvent.click(timestamp);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('24 Jul 11:49 PM');
      fireEvent.change(input, { target: { value: '25 Jul 12:00 AM' } });
      fireEvent.blur(input);
    });
    
    expect(mockOnTimestampChange).toHaveBeenCalledWith('25 Jul 12:00 AM');
  });

  it('saves platform changes when select loses focus', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const platform = screen.getByText('SMS');
    fireEvent.click(platform);
    
    await waitFor(() => {
      const select = screen.getByDisplayValue('SMS');
      fireEvent.change(select, { target: { value: 'iMessage' } });
      fireEvent.blur(select);
    });
    
    expect(mockOnPlatformChange).toHaveBeenCalledWith('iMessage');
  });

  it('shows all platform options in select', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const platform = screen.getByText('SMS');
    fireEvent.click(platform);
    
    await waitFor(() => {
      const select = screen.getByDisplayValue('SMS');
      expect(select).toBeInTheDocument();
      
      // Check that options exist
      const options = select.querySelectorAll('option');
      expect(options).toHaveLength(5);
      expect(Array.from(options).map(opt => opt.value)).toEqual([
        'SMS', 'iMessage', 'WhatsApp', 'Telegram', 'Messenger'
      ]);
    });
  });

  it('shows edit icons on hover', () => {
    const { container } = render(<EditableSMSTimestamp {...defaultProps} />);
    
    const editIcons = container.querySelectorAll('svg');
    expect(editIcons.length).toBe(2); // One for timestamp, one for platform
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EditableSMSTimestamp 
        {...defaultProps}
        className="custom-timestamp"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-timestamp');
  });

  it('shows placeholder for timestamp input', async () => {
    render(<EditableSMSTimestamp {...defaultProps} />);
    
    const timestamp = screen.getByText('24 Jul 11:49 PM');
    fireEvent.click(timestamp);
    
    await waitFor(() => {
      const input = screen.getByDisplayValue('24 Jul 11:49 PM');
      expect(input).toHaveAttribute('placeholder', 'DD MMM HH:MM AM/PM');
    });
  });
});
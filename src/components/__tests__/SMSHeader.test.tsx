import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SMSHeader } from '../SMSHeader';
import { MemeMetadata } from '../../types';

describe('SMSHeader', () => {
  const mockMetadata: MemeMetadata = {
    contactName: 'John Doe',
    timestamp: '24 Jul 11:49 PM',
    phoneNumber: '1234567890',
    platform: 'SMS'
  };

  it('renders contact name correctly', () => {
    render(<SMSHeader metadata={mockMetadata} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders phone number correctly', () => {
    render(<SMSHeader metadata={mockMetadata} />);
    
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('displays carrier info and battery status', () => {
    render(<SMSHeader metadata={mockMetadata} />);
    
    expect(screen.getByText('Carrier')).toBeInTheDocument();
    expect(screen.getByText('9:41 AM')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('has proper header styling', () => {
    const { container } = render(<SMSHeader metadata={mockMetadata} />);
    
    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass('bg-gray-50', 'px-4', 'py-3', 'border-b', 'border-gray-200');
  });

  it('includes back button and call button', () => {
    render(<SMSHeader metadata={mockMetadata} />);
    
    // Check for buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('applies custom className when provided', () => {
    const { container } = render(<SMSHeader metadata={mockMetadata} className="custom-header" />);
    
    const headerElement = container.firstChild as HTMLElement;
    expect(headerElement).toHaveClass('custom-header');
  });

  it('displays profile icon placeholder', () => {
    const { container } = render(<SMSHeader metadata={mockMetadata} />);
    
    // Check for the profile icon container by class
    const profileIconContainer = container.querySelector('.w-8.h-8.bg-gray-400.rounded-full');
    expect(profileIconContainer).toBeInTheDocument();
  });
});
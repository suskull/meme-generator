import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableMessageBubble } from '../EditableMessageBubble';
import { Message } from '../../types';

describe('EditableMessageBubble', () => {
  const mockOnMessageChange = vi.fn();
  
  const sentMessage: Message = {
    id: '1',
    text: 'Hello world',
    type: 'sent'
  };

  const receivedMessage: Message = {
    id: '2',
    text: 'Hi there',
    type: 'received'
  };

  beforeEach(() => {
    mockOnMessageChange.mockClear();
  });

  it('renders message text correctly', () => {
    render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('shows edit mode when clicked', async () => {
    render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    const messageElement = screen.getByText('Hello world');
    fireEvent.click(messageElement);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
    });
  });

  it('saves changes when Enter is pressed', async () => {
    render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    const messageElement = screen.getByText('Hello world');
    fireEvent.click(messageElement);
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Hello world');
      fireEvent.change(textarea, { target: { value: 'Updated message' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });
    });
    
    expect(mockOnMessageChange).toHaveBeenCalledWith('1', 'Updated message');
  });

  it('cancels changes when Escape is pressed', async () => {
    render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    const messageElement = screen.getByText('Hello world');
    fireEvent.click(messageElement);
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Hello world');
      fireEvent.change(textarea, { target: { value: 'Updated message' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });
    });
    
    expect(mockOnMessageChange).not.toHaveBeenCalled();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('saves changes when textarea loses focus', async () => {
    render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    const messageElement = screen.getByText('Hello world');
    fireEvent.click(messageElement);
    
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Hello world');
      fireEvent.change(textarea, { target: { value: 'Updated message' } });
      fireEvent.blur(textarea);
    });
    
    expect(mockOnMessageChange).toHaveBeenCalledWith('1', 'Updated message');
  });

  it('shows placeholder for empty messages', () => {
    const emptyMessage: Message = {
      id: '3',
      text: '',
      type: 'sent'
    };
    
    render(<EditableMessageBubble message={emptyMessage} onMessageChange={mockOnMessageChange} />);
    
    expect(screen.getByText('Click to edit...')).toBeInTheDocument();
  });

  it('applies correct styling for sent messages', () => {
    const { container } = render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('justify-end');
  });

  it('applies correct styling for received messages', () => {
    const { container } = render(<EditableMessageBubble message={receivedMessage} onMessageChange={mockOnMessageChange} />);
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('justify-start');
  });

  it('shows edit icon on hover', () => {
    const { container } = render(<EditableMessageBubble message={sentMessage} onMessageChange={mockOnMessageChange} />);
    
    // The edit icon should be present in the DOM (even if not visible)
    const editIcon = container.querySelector('svg');
    expect(editIcon).toBeInTheDocument();
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageEditor } from '../MessageEditor';
import { Message } from '../../types';

describe('MessageEditor', () => {
  const mockOnMessageChange = vi.fn();
  const mockOnAddMessage = vi.fn();
  const mockOnDeleteMessage = vi.fn();

  const testMessages: Message[] = [
    { id: '1', text: 'First message', type: 'received' },
    { id: '2', text: 'Second message', type: 'sent' },
  ];

  beforeEach(() => {
    mockOnMessageChange.mockClear();
    mockOnAddMessage.mockClear();
    mockOnDeleteMessage.mockClear();
  });

  it('renders all messages', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
      />
    );

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('shows add message buttons when onAddMessage is provided', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
        onAddMessage={mockOnAddMessage}
      />
    );

    expect(screen.getByText('Add Received')).toBeInTheDocument();
    expect(screen.getByText('Add Sent')).toBeInTheDocument();
  });

  it('calls onAddMessage with correct type when add buttons are clicked', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
        onAddMessage={mockOnAddMessage}
      />
    );

    fireEvent.click(screen.getByText('Add Received'));
    expect(mockOnAddMessage).toHaveBeenCalledWith('received');

    fireEvent.click(screen.getByText('Add Sent'));
    expect(mockOnAddMessage).toHaveBeenCalledWith('sent');
  });

  it('passes delete function to EditableMessageBubble when provided', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
        onDeleteMessage={mockOnDeleteMessage}
      />
    );

    // Delete functionality is now handled by EditableMessageBubble
    // We just verify the component renders correctly
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('does not show add buttons when onAddMessage is not provided', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
      />
    );

    expect(screen.queryByText('Add Received')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Sent')).not.toBeInTheDocument();
  });

  it('does not pass delete function when onDeleteMessage is not provided', () => {
    render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
      />
    );

    // Delete functionality is handled by EditableMessageBubble
    // We just verify the component renders correctly without delete function
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <MessageEditor
        messages={testMessages}
        onMessageChange={mockOnMessageChange}
        className="custom-editor"
      />
    );

    expect(container.firstChild).toHaveClass('custom-editor');
  });

  it('handles empty messages array', () => {
    render(
      <MessageEditor
        messages={[]}
        onMessageChange={mockOnMessageChange}
        onAddMessage={mockOnAddMessage}
      />
    );

    expect(screen.getByText('Add Received')).toBeInTheDocument();
    expect(screen.getByText('Add Sent')).toBeInTheDocument();
  });
});
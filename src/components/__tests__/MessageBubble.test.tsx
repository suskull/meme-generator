import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';
import { Message } from '../../types';

describe('MessageBubble', () => {
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

  it('renders sent message with correct styling', () => {
    render(<MessageBubble message={sentMessage} />);

    const messageElement = screen.getByText('Hello world');
    expect(messageElement).toBeInTheDocument();

    // Check if the message bubble has the correct classes for sent messages
    const bubbleElement = messageElement.parentElement;
    expect(bubbleElement).toHaveClass('bg-green-500', 'text-white', 'ml-auto', 'rounded-br-md');
  });

  it('renders received message with correct styling', () => {
    render(<MessageBubble message={receivedMessage} />);

    const messageElement = screen.getByText('Hi there');
    expect(messageElement).toBeInTheDocument();

    // Check if the message bubble has the correct classes for received messages
    const bubbleElement = messageElement.parentElement;
    expect(bubbleElement).toHaveClass('bg-gray-200', 'text-gray-900', 'mr-auto', 'rounded-bl-md');
  });

  it('preserves line breaks in message text', () => {
    const multilineMessage: Message = {
      id: '3',
      text: 'Line 1\nLine 2\nLine 3',
      type: 'sent'
    };

    const { container } = render(<MessageBubble message={multilineMessage} />);

    // Find the text container div
    const textDiv = container.querySelector('div[style*="white-space: pre-wrap"]');
    expect(textDiv).toBeInTheDocument();
    expect(textDiv).toHaveStyle({ whiteSpace: 'pre-wrap' });
    expect(textDiv?.textContent).toBe('Line 1\nLine 2\nLine 3');
  });

  it('applies custom className when provided', () => {
    render(<MessageBubble message={sentMessage} className="custom-class" />);

    const messageElement = screen.getByText('Hello world');
    const bubbleElement = messageElement.parentElement;
    expect(bubbleElement).toHaveClass('custom-class');
  });

  it('has correct container alignment for sent messages', () => {
    const { container } = render(<MessageBubble message={sentMessage} />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('justify-end');
  });

  it('has correct container alignment for received messages', () => {
    const { container } = render(<MessageBubble message={receivedMessage} />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('justify-start');
  });

  it('displays image when message has image', () => {
    const messageWithImage: Message = {
      id: '4',
      text: 'Message with image',
      type: 'sent',
      image: {
        url: 'data:image/png;base64,test',
        alt: 'Test image',
        width: 150,
        height: 100
      }
    };

    render(<MessageBubble message={messageWithImage} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/png;base64,test');
    expect(screen.getByText('Message with image')).toBeInTheDocument();
  });

  it('displays only image when message has no text', () => {
    const imageOnlyMessage: Message = {
      id: '5',
      text: '',
      type: 'received',
      image: {
        url: 'data:image/png;base64,test',
        alt: 'Image only',
        width: 200,
        height: 150
      }
    };

    render(<MessageBubble message={imageOnlyMessage} />);

    const image = screen.getByAltText('Image only');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/png;base64,test');
  });
});
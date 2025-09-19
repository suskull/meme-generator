import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SMSContainer } from '../SMSContainer';
import { DEFAULT_MEME_STATE } from '../../data/template';

describe('SMSContainer', () => {
  it('renders all components correctly', () => {
    render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    // Check if header is rendered
    expect(screen.getByText('Bánh')).toBeInTheDocument();
    expect(screen.getByText('1466')).toBeInTheDocument();
    
    // Check if timestamp is rendered
    expect(screen.getByText('SMS')).toBeInTheDocument();
    expect(screen.getByText('24 Jul 11:49 PM')).toBeInTheDocument();
    
    // Check if messages are rendered
    expect(screen.getByText('b ơi, t bị phân vân')).toBeInTheDocument();
    expect(screen.getByText('Làm sao')).toBeInTheDocument();
  });

  it('renders all 7 messages from default template', () => {
    render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    // Check that all messages are present by counting message bubbles
    const messageBubbles = document.querySelectorAll('div[style*="white-space: pre-wrap"]');
    expect(messageBubbles).toHaveLength(7);
    
    // Check specific messages that are unique
    expect(screen.getByText('b ơi, t bị phân vân')).toBeInTheDocument();
    expect(screen.getByText('Làm sao')).toBeInTheDocument();
    expect(screen.getByText('nếu như bạn có 45k thì b sẽ làm gì?')).toBeInTheDocument();
  });

  it('has correct container styling', () => {
    const { container } = render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'bg-white', 
      'max-w-sm', 
      'mx-auto', 
      'shadow-lg', 
      'rounded-lg', 
      'overflow-hidden'
    );
  });

  it('includes bottom input area for visual completeness', () => {
    render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    expect(screen.getByText('Text Message')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <SMSContainer memeState={DEFAULT_MEME_STATE} className="custom-container" />
    );
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('custom-container');
  });

  it('maintains proper message order', () => {
    render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    // Check that we have the right number of messages
    const messageBubbles = document.querySelectorAll('div[style*="white-space: pre-wrap"]');
    expect(messageBubbles).toHaveLength(7);
    
    // Check first and last messages to verify order
    expect(screen.getByText('b ơi, t bị phân vân')).toBeInTheDocument();
    expect(screen.getByText('hahaha, không có gì đâu. Đồng nghiệp với nhau mà 1008567447 vcb')).toBeInTheDocument();
  });

  it('has minimum height for messages area', () => {
    const { container } = render(<SMSContainer memeState={DEFAULT_MEME_STATE} />);
    
    // Find the messages container by class
    const messagesContainer = container.querySelector('.min-h-\\[400px\\]');
    expect(messagesContainer).toBeInTheDocument();
  });
});
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemeImageGenerator, MemeImageGeneratorRef } from '../MemeImageGenerator';
import { DEFAULT_MEME_STATE } from '../../data/template';
import { createRef } from 'react';

describe('MemeImageGenerator', () => {
  it('renders SMS container component', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    const { container } = render(
      <MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('provides access to image element through ref', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    render(<MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />);

    const imageElement = ref.current?.getImageElement();
    expect(imageElement).toBeTruthy();
    expect(imageElement?.tagName).toBe('DIV');
    
    // Test show/hide methods exist
    expect(typeof ref.current?.showForCapture).toBe('function');
    expect(typeof ref.current?.hideAfterCapture).toBe('function');
  });

  it('shows and hides element for capture', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    const { container } = render(
      <MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />
    );

    const element = container.firstChild as HTMLElement;
    
    // Initially hidden (off-screen)
    expect(element.style.left).toBe('-9999px');
    
    // Show for capture
    act(() => {
      ref.current?.showForCapture();
    });
    expect(element.style.left).toBe('50%');
    
    // Hide after capture
    act(() => {
      ref.current?.hideAfterCapture();
    });
    expect(element.style.left).toBe('-9999px');
  });

  it('renders SMS container with meme state', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    render(<MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />);

    const imageElement = ref.current?.getImageElement();
    expect(imageElement).toBeTruthy();
    
    // Check that SMS container is rendered with data-testid
    const smsContainer = imageElement?.querySelector('[data-testid="sms-container"]');
    expect(smsContainer).toBeTruthy();
  });

  it('updates when meme state changes', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    const customState = {
      ...DEFAULT_MEME_STATE,
      messages: [
        {
          id: '1',
          text: 'Custom test message',
          type: 'sent' as const,
        }
      ]
    };

    const { rerender } = render(
      <MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />
    );

    // Initial state
    let imageElement = ref.current?.getImageElement();
    expect(imageElement?.textContent).toContain('b ơi, t bị phân vân');

    // Update with custom state
    rerender(<MemeImageGenerator ref={ref} memeState={customState} />);
    
    imageElement = ref.current?.getImageElement();
    expect(imageElement?.textContent).toContain('Custom test message');
  });

  it('applies consistent styling for image generation', () => {
    const ref = createRef<MemeImageGeneratorRef>();
    const { container } = render(<MemeImageGenerator ref={ref} memeState={DEFAULT_MEME_STATE} />);

    const parentElement = container.firstChild as HTMLElement;
    expect(parentElement).toHaveStyle({
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
    });
  });
});
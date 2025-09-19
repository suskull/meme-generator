import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from '../ImageUpload';

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/png;base64,test-image-data',
  onload: null as any,
  onerror: null as any,
};

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: vi.fn(() => mockFileReader),
});

// Mock Image constructor
const mockImage = {
  onload: null as any,
  src: '',
  width: 100,
  height: 100,
};

Object.defineProperty(window, 'Image', {
  writable: true,
  value: vi.fn(() => mockImage),
});

describe('ImageUpload', () => {
  const mockOnImageUpload = vi.fn();

  beforeEach(() => {
    mockOnImageUpload.mockClear();
    vi.clearAllMocks();
  });

  it('renders upload area with instructions', () => {
    render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF up to 5MB')).toBeInTheDocument();
  });

  it('shows drag state when dragging over', () => {
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const uploadArea = container.querySelector('[class*="border-dashed"]');
    expect(uploadArea).toHaveClass('border-gray-300');
    
    fireEvent.dragOver(uploadArea!);
    expect(uploadArea).toHaveClass('border-blue-500', 'bg-blue-50');
    
    fireEvent.dragLeave(uploadArea!);
    expect(uploadArea).toHaveClass('border-gray-300');
  });

  it('handles file drop', async () => {
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const uploadArea = container.querySelector('[class*="border-dashed"]');
    
    fireEvent.drop(uploadArea!, {
      dataTransfer: { files: [file] }
    });
    
    // Simulate FileReader onload
    mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });
    
    // Simulate Image onload
    await waitFor(() => {
      mockImage.onload();
    });
    
    expect(mockOnImageUpload).toHaveBeenCalledWith({
      url: 'data:image/png;base64,test',
      alt: 'test.png',
      width: 100,
      height: 100
    });
  });

  it('handles file selection via input', async () => {
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    // Simulate FileReader onload
    mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
    
    // Simulate Image onload
    await waitFor(() => {
      mockImage.onload();
    });
    
    expect(mockOnImageUpload).toHaveBeenCalledWith({
      url: 'data:image/jpeg;base64,test',
      alt: 'test.jpg',
      width: 100,
      height: 100
    });
  });

  it('shows loading state during upload', () => {
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('rejects non-image files', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(alertSpy).toHaveBeenCalledWith('Please select an image file');
    expect(mockOnImageUpload).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('rejects files larger than 5MB', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<ImageUpload onImageUpload={mockOnImageUpload} />);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(alertSpy).toHaveBeenCalledWith('Image size must be less than 5MB');
    expect(mockOnImageUpload).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ImageUpload onImageUpload={mockOnImageUpload} className="custom-upload" />
    );
    
    expect(container.firstChild).toHaveClass('custom-upload');
  });
});
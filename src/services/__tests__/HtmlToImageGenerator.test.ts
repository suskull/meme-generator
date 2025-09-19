import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HtmlToImageGenerator } from '../HtmlToImageGenerator';
import * as htmlToImage from 'html-to-image';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
  toJpeg: vi.fn(),
  toSvg: vi.fn(),
}));

const mockHtmlToImage = htmlToImage as any;

// Mock DOM APIs
Object.defineProperty(global, 'fetch', {
  value: vi.fn(() =>
    Promise.resolve({
      blob: () => Promise.resolve(new Blob(['mock-blob'], { type: 'image/png' })),
    })
  ),
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        };
      }
      return {};
    }),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    devicePixelRatio: 2,
    MutationObserver: vi.fn(),
    fetch: global.fetch,
  },
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  writable: true,
});

describe('HtmlToImageGenerator', () => {
  const mockElement = {
    getBoundingClientRect: vi.fn(() => ({
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
    })),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    mockHtmlToImage.toPng.mockResolvedValue('data:image/png;base64,mock-data');
    mockHtmlToImage.toJpeg.mockResolvedValue('data:image/jpeg;base64,mock-data');
    mockHtmlToImage.toSvg.mockResolvedValue('data:image/svg+xml;base64,mock-data');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateImage', () => {
    it('should generate image successfully with default options', async () => {
      const result = await HtmlToImageGenerator.generateImage(mockElement);

      expect(mockHtmlToImage.toPng).toHaveBeenCalledWith(mockElement, {
        width: 800, // 400 * 2 (pixelRatio)
        height: 600, // 300 * 2 (pixelRatio)
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
        includeQueryParams: true,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
        filter: undefined,
        skipAutoScale: false,
        preferredFontFormat: 'woff2',
      });

      expect(result).toEqual({
        dataUrl: 'data:image/png;base64,mock-data',
        blob: expect.any(Blob),
        width: 800,
        height: 600,
      });
    });

    it('should generate image with custom options', async () => {
      const customOptions = {
        backgroundColor: '#000000',
        pixelRatio: 1,
        quality: 0.8,
        width: 500,
        height: 400,
      };

      await HtmlToImageGenerator.generateImage(mockElement, customOptions);

      expect(mockHtmlToImage.toPng).toHaveBeenCalledWith(mockElement, {
        width: 500,
        height: 400,
        backgroundColor: '#000000',
        pixelRatio: 1,
        quality: 0.8,
        cacheBust: true,
        includeQueryParams: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        filter: undefined,
        skipAutoScale: false,
        preferredFontFormat: 'woff2',
      });
    });

    it('should handle generation errors', async () => {
      const errorMessage = 'Generation failed';
      mockHtmlToImage.toPng.mockRejectedValue(new Error(errorMessage));

      await expect(HtmlToImageGenerator.generateImage(mockElement)).rejects.toThrow(
        'Failed to generate image with html-to-image: Generation failed'
      );
    });
  });

  describe('downloadImage', () => {
    it('should download image with default filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      await HtmlToImageGenerator.downloadImage(mockElement);

      expect(mockLink.download).toBe('vietnamese-meme.png');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should download image with custom filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      await HtmlToImageGenerator.downloadImage(mockElement, 'custom-meme.png');

      expect(mockLink.download).toBe('custom-meme.png');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
      mockHtmlToImage.toPng.mockRejectedValue(new Error('Download failed'));

      await expect(HtmlToImageGenerator.downloadImage(mockElement)).rejects.toThrow(
        'Failed to download image: Failed to generate image with html-to-image: Download failed'
      );
    });
  });

  describe('getImageBlob', () => {
    it('should return image blob', async () => {
      const blob = await HtmlToImageGenerator.getImageBlob(mockElement);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should handle blob generation errors', async () => {
      mockHtmlToImage.toPng.mockRejectedValue(new Error('Blob generation failed'));

      await expect(HtmlToImageGenerator.getImageBlob(mockElement)).rejects.toThrow(
        'Failed to get image blob: Failed to generate image with html-to-image: Blob generation failed'
      );
    });
  });

  describe('generateImageByFormat', () => {
    it('should generate PNG image', async () => {
      const dataUrl = await HtmlToImageGenerator.generateImageByFormat(mockElement, 'png');

      expect(mockHtmlToImage.toPng).toHaveBeenCalled();
      expect(dataUrl).toBe('data:image/png;base64,mock-data');
    });

    it('should generate JPEG image', async () => {
      const dataUrl = await HtmlToImageGenerator.generateImageByFormat(mockElement, 'jpeg');

      expect(mockHtmlToImage.toJpeg).toHaveBeenCalled();
      expect(dataUrl).toBe('data:image/jpeg;base64,mock-data');
    });

    it('should generate SVG image', async () => {
      const dataUrl = await HtmlToImageGenerator.generateImageByFormat(mockElement, 'svg');

      expect(mockHtmlToImage.toSvg).toHaveBeenCalled();
      expect(dataUrl).toBe('data:image/svg+xml;base64,mock-data');
    });

    it('should handle unsupported format', async () => {
      await expect(
        HtmlToImageGenerator.generateImageByFormat(mockElement, 'webp' as any)
      ).rejects.toThrow('Unsupported format: webp');
    });
  });

  describe('checkBrowserCompatibility', () => {
    it('should return supported when all APIs are available', () => {
      const compatibility = HtmlToImageGenerator.checkBrowserCompatibility();

      expect(compatibility.isSupported).toBe(true);
      expect(compatibility.missingFeatures).toEqual([]);
    });

    it('should detect missing Canvas.toBlob', () => {
      // Mock missing toBlob
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: undefined,
        writable: true,
      });

      const compatibility = HtmlToImageGenerator.checkBrowserCompatibility();

      expect(compatibility.isSupported).toBe(false);
      expect(compatibility.missingFeatures).toContain('Canvas.toBlob()');
    });

    it('should detect Safari warnings', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        },
        writable: true,
      });

      const compatibility = HtmlToImageGenerator.checkBrowserCompatibility();

      expect(compatibility.warnings).toContain('Safari may have CORS restrictions with external resources');
    });

    it('should detect high DPI warnings', () => {
      Object.defineProperty(global, 'window', {
        value: {
          ...global.window,
          devicePixelRatio: 3,
        },
        writable: true,
      });

      const compatibility = HtmlToImageGenerator.checkBrowserCompatibility();

      expect(compatibility.warnings).toContain('High DPI display detected - image generation may be slower');
    });
  });

  describe('getOptimizedOptions', () => {
    it('should return optimized options for normal sized element', () => {
      const options = HtmlToImageGenerator.getOptimizedOptions(mockElement);

      expect(options).toEqual({
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true,
        includeQueryParams: true,
        width: 400,
        height: 300,
        style: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSmooth: 'always',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      });
    });

    it('should reduce pixel ratio for large elements', () => {
      const largeElement = {
        getBoundingClientRect: vi.fn(() => ({
          width: 2000,
          height: 1000, // 2MP total
          top: 0,
          left: 0,
          right: 2000,
          bottom: 1000,
        })),
      } as any;

      const options = HtmlToImageGenerator.getOptimizedOptions(largeElement);

      expect(options.pixelRatio).toBe(1); // Reduced for large element
    });

    it('should adjust for high DPI displays', () => {
      Object.defineProperty(global, 'window', {
        value: {
          ...global.window,
          devicePixelRatio: 3,
        },
        writable: true,
      });

      const options = HtmlToImageGenerator.getOptimizedOptions(mockElement);

      expect(options.pixelRatio).toBe(2); // Capped at 2 even though device is 3
    });
  });
});
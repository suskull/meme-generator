import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScreenCaptureGenerator } from '../ScreenCaptureGenerator';

// Mock the MediaDevices API
const mockGetDisplayMedia = vi.fn();
const mockVideoElement = {
  srcObject: null,
  autoplay: false,
  muted: false,
  videoWidth: 1920,
  videoHeight: 1080,
  onloadedmetadata: null as (() => void) | null,
  onerror: null as (() => void) | null,
  play: vi.fn(() => Promise.resolve()),
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toDataURL: vi.fn(),
  toBlob: vi.fn(),
};

const mockContext = {
  drawImage: vi.fn(),
};

const mockStream = {
  getTracks: vi.fn(() => [
    { stop: vi.fn() },
    { stop: vi.fn() },
  ]),
};

// Mock DOM APIs
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: {
      getDisplayMedia: mockGetDisplayMedia,
    },
  },
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'video') {
        return mockVideoElement;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
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

describe('ScreenCaptureGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset navigator mock
    Object.defineProperty(global, 'navigator', {
      value: {
        mediaDevices: {
          getDisplayMedia: mockGetDisplayMedia,
        },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      writable: true,
    });
    
    // Setup default mocks
    mockGetDisplayMedia.mockResolvedValue(mockStream);
    mockCanvas.getContext.mockReturnValue(mockContext);
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock-data');
    mockCanvas.toBlob.mockImplementation((callback) => {
      callback(new Blob(['mock-blob'], { type: 'image/png' }));
    });
    
    // Setup video element to simulate successful loading
    mockVideoElement.onloadedmetadata = null;
    mockVideoElement.onerror = null;
    
    // Mock document.createElement to return our mocked elements
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'video') {
        // Simulate successful video loading
        setTimeout(() => {
          if (mockVideoElement.onloadedmetadata) {
            mockVideoElement.onloadedmetadata();
          }
        }, 10);
        return mockVideoElement;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        };
      }
      return {};
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('captureScreen', () => {
    it('should capture screen successfully with default options', async () => {
      const result = await ScreenCaptureGenerator.captureScreen();

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      expect(result).toEqual({
        canvas: mockCanvas,
        dataUrl: 'data:image/png;base64,mock-data',
        blob: expect.any(Blob),
        width: 1920,
        height: 1080,
      });
    });

    it('should capture screen with custom options', async () => {
      const customOptions = {
        preferredWidth: 1280,
        preferredHeight: 720,
        frameRate: 60,
      };

      await ScreenCaptureGenerator.captureScreen(customOptions);

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60 },
        },
        audio: false,
      });
    });

    it('should throw error when Screen Capture API is not supported', async () => {
      // Mock unsupported browser
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: null,
        },
        writable: true,
      });

      await expect(ScreenCaptureGenerator.captureScreen()).rejects.toThrow(
        'Screen capture failed: Screen Capture API is not supported in this browser'
      );
    });

    it('should throw error when getDisplayMedia fails', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Permission denied'));

      await expect(ScreenCaptureGenerator.captureScreen()).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should handle video loading errors', async () => {
      // Simulate video loading error
      const mockVideoWithError = {
        ...mockVideoElement,
        onloadedmetadata: null,
        onerror: null,
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'video') {
          return mockVideoWithError;
        }
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        return {};
      });

      // Trigger error after a short delay
      setTimeout(() => {
        if (mockVideoWithError.onerror) {
          mockVideoWithError.onerror();
        }
      }, 100);

      await expect(ScreenCaptureGenerator.captureScreen()).rejects.toThrow();
    });

    it('should handle canvas context creation failure', async () => {
      // Override the mock for this specific test
      const mockCanvasWithoutContext = {
        ...mockCanvas,
        getContext: vi.fn().mockReturnValue(null),
      };
      
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'video') {
          setTimeout(() => {
            if (mockVideoElement.onloadedmetadata) {
              mockVideoElement.onloadedmetadata();
            }
          }, 10);
          return mockVideoElement;
        }
        if (tagName === 'canvas') {
          return mockCanvasWithoutContext;
        }
        return {};
      });

      await expect(ScreenCaptureGenerator.captureScreen()).rejects.toThrow(
        'Failed to get canvas context'
      );
    });
  });

  describe('downloadScreenCapture', () => {
    it('should download screen capture with default filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'video') {
          setTimeout(() => {
            if (mockVideoElement.onloadedmetadata) {
              mockVideoElement.onloadedmetadata();
            }
          }, 10);
          return mockVideoElement;
        }
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      await ScreenCaptureGenerator.downloadScreenCapture();

      expect(mockLink.download).toBe('vietnamese-meme-screenshot.png');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should download screen capture with custom filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'video') {
          setTimeout(() => {
            if (mockVideoElement.onloadedmetadata) {
              mockVideoElement.onloadedmetadata();
            }
          }, 10);
          return mockVideoElement;
        }
        if (tagName === 'canvas') {
          return mockCanvas;
        }
        if (tagName === 'a') {
          return mockLink;
        }
        return {};
      });

      await ScreenCaptureGenerator.downloadScreenCapture('custom-meme.png');

      expect(mockLink.download).toBe('custom-meme.png');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('getScreenCaptureBlob', () => {
    it('should return blob from screen capture', async () => {
      const blob = await ScreenCaptureGenerator.getScreenCaptureBlob();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should throw error when screen capture fails', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Capture failed'));

      await expect(ScreenCaptureGenerator.getScreenCaptureBlob()).rejects.toThrow(
        'Capture failed'
      );
    });
  });

  describe('checkBrowserCompatibility', () => {
    it('should return supported when all APIs are available', () => {
      // Ensure all required APIs are available
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: {
            getDisplayMedia: mockGetDisplayMedia,
          },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        writable: true,
      });

      const compatibility = ScreenCaptureGenerator.checkBrowserCompatibility();

      expect(compatibility.isSupported).toBe(true);
      expect(compatibility.missingFeatures).toEqual([]);
    });

    it('should detect missing MediaDevices API', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (test browser)',
        },
        writable: true,
      });

      const compatibility = ScreenCaptureGenerator.checkBrowserCompatibility();

      expect(compatibility.isSupported).toBe(false);
      expect(compatibility.missingFeatures).toContain('MediaDevices API');
    });

    it('should detect missing getDisplayMedia', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: {},
          userAgent: 'Mozilla/5.0 (test browser)',
        },
        writable: true,
      });

      const compatibility = ScreenCaptureGenerator.checkBrowserCompatibility();

      expect(compatibility.isSupported).toBe(false);
      expect(compatibility.missingFeatures).toContain('Screen Capture API (getDisplayMedia)');
    });

    it('should detect Safari warnings', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          mediaDevices: {
            getDisplayMedia: mockGetDisplayMedia,
          },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        },
        writable: true,
      });

      const compatibility = ScreenCaptureGenerator.checkBrowserCompatibility();

      expect(compatibility.warnings).toContain('Safari may require user permission for screen capture');
    });

    it('should detect HTTPS requirement', () => {
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            protocol: 'http:',
            hostname: 'example.com',
          },
        },
        writable: true,
      });

      const compatibility = ScreenCaptureGenerator.checkBrowserCompatibility();

      expect(compatibility.warnings).toContain('Screen Capture API requires HTTPS or localhost');
    });
  });
});
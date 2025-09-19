export interface ScreenCaptureOptions {
  preferredWidth?: number;
  preferredHeight?: number;
  frameRate?: number;
}

export interface ScreenCaptureResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export class ScreenCaptureGenerator {
  private static readonly DEFAULT_OPTIONS: ScreenCaptureOptions = {
    preferredWidth: 1920,
    preferredHeight: 1080,
    frameRate: 30,
  };

  /**
   * Captures the screen using the Screen Capture API
   * @param options - Configuration options for screen capture
   * @returns Promise resolving to screen capture result
   */
  static async captureScreen(
    options: ScreenCaptureOptions = {}
  ): Promise<ScreenCaptureResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Check if Screen Capture API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen Capture API is not supported in this browser');
      }

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: mergedOptions.preferredWidth },
          height: { ideal: mergedOptions.preferredHeight },
          frameRate: { ideal: mergedOptions.frameRate },
        },
        audio: false, // We don't need audio for image capture
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play()
            .then(() => resolve())
            .catch(reject);
        };
        video.onerror = reject;
      });

      // Wait a moment for the video to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to data URL and blob
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const blob = await this.canvasToBlob(canvas);

      return {
        canvas,
        dataUrl,
        blob,
        width: canvas.width,
        height: canvas.height,
      };
    } catch (error) {
      throw new Error(`Screen capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Downloads a screen capture directly
   * @param filename - The filename for the downloaded image
   * @param options - Configuration options for screen capture
   */
  static async downloadScreenCapture(
    filename: string = 'vietnamese-meme-screenshot.png',
    options: ScreenCaptureOptions = {}
  ): Promise<void> {
    try {
      const result = await this.captureScreen(options);
      this.downloadBlob(result.blob, filename);
    } catch (error) {
      throw new Error(`Failed to download screen capture: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets screen capture blob for programmatic use
   * @param options - Configuration options for screen capture
   * @returns Promise resolving to image blob
   */
  static async getScreenCaptureBlob(
    options: ScreenCaptureOptions = {}
  ): Promise<Blob> {
    try {
      const result = await this.captureScreen(options);
      return result.blob;
    } catch (error) {
      throw new Error(`Failed to get screen capture blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Converts a canvas to a blob
   * @param canvas - The canvas element to convert
   * @param quality - Image quality (0-1)
   * @returns Promise resolving to blob
   */
  private static canvasToBlob(canvas: HTMLCanvasElement, quality: number = 1.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/png',
        quality
      );
    });
  }

  /**
   * Downloads a blob as a file
   * @param blob - The blob to download
   * @param filename - The filename for the download
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Validates browser compatibility for screen capture
   * @returns Object with compatibility information
   */
  static checkBrowserCompatibility(): {
    isSupported: boolean;
    missingFeatures: string[];
    warnings: string[];
  } {
    const missingFeatures: string[] = [];
    const warnings: string[] = [];

    // Check for required APIs
    if (!navigator.mediaDevices) {
      missingFeatures.push('MediaDevices API');
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      missingFeatures.push('Screen Capture API (getDisplayMedia)');
    }

    if (!HTMLCanvasElement.prototype.toBlob) {
      missingFeatures.push('Canvas.toBlob()');
    }

    if (!HTMLCanvasElement.prototype.toDataURL) {
      missingFeatures.push('Canvas.toDataURL()');
    }

    // Check for potential issues
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      warnings.push('Safari may require user permission for screen capture');
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      warnings.push('Screen Capture API requires HTTPS or localhost');
    }

    return {
      isSupported: missingFeatures.length === 0,
      missingFeatures,
      warnings,
    };
  }
}

export default ScreenCaptureGenerator;
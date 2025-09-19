import html2canvas from 'html2canvas';

export interface ImageGenerationOptions {
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
  allowTaint?: boolean;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export class ImageGenerator {
  private static readonly DEFAULT_OPTIONS: ImageGenerationOptions = {
    scale: 2, // High DPI for better quality
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
  };

  /**
   * Generates a high-quality image from a DOM element
   * @param element - The DOM element to capture
   * @param options - Configuration options for image generation
   * @returns Promise resolving to image generation result
   */
  static async generateImage(
    element: HTMLElement,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Generate canvas using html2canvas
      const canvas = await html2canvas(element, mergedOptions);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // Convert canvas to blob
      const blob = await this.canvasToBlob(canvas);
      
      return {
        canvas,
        dataUrl,
        blob,
        width: canvas.width,
        height: canvas.height,
      };
    } catch (error) {
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Downloads an image directly from a DOM element
   * @param element - The DOM element to capture
   * @param filename - The filename for the downloaded image
   * @param options - Configuration options for image generation
   */
  static async downloadImage(
    element: HTMLElement,
    filename: string = 'vietnamese-meme.png',
    options: ImageGenerationOptions = {}
  ): Promise<void> {
    try {
      const result = await this.generateImage(element, options);
      this.downloadBlob(result.blob, filename);
    } catch (error) {
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets image blob from a DOM element for programmatic use
   * @param element - The DOM element to capture
   * @param options - Configuration options for image generation
   * @returns Promise resolving to image blob
   */
  static async getImageBlob(
    element: HTMLElement,
    options: ImageGenerationOptions = {}
  ): Promise<Blob> {
    try {
      const result = await this.generateImage(element, options);
      return result.blob;
    } catch (error) {
      throw new Error(`Failed to get image blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Validates browser compatibility for image generation
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
    if (!HTMLCanvasElement.prototype.toBlob) {
      missingFeatures.push('Canvas.toBlob()');
    }

    if (!HTMLCanvasElement.prototype.toDataURL) {
      missingFeatures.push('Canvas.toDataURL()');
    }

    if (!URL.createObjectURL) {
      missingFeatures.push('URL.createObjectURL()');
    }

    if (!document.createElement) {
      missingFeatures.push('document.createElement()');
    }

    // Check for potential issues
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      warnings.push('Safari may have CORS restrictions with external images');
    }

    if (window.devicePixelRatio > 2) {
      warnings.push('High DPI display detected - image generation may be slower');
    }

    return {
      isSupported: missingFeatures.length === 0,
      missingFeatures,
      warnings,
    };
  }

  /**
   * Optimizes image generation options based on element size and device capabilities
   * @param element - The element to be captured
   * @returns Optimized options
   */
  static getOptimizedOptions(element: HTMLElement): ImageGenerationOptions {
    const rect = element.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate optimal scale based on element size and device
    let scale = 2; // Default high quality
    
    // Reduce scale for very large elements to prevent memory issues
    if (rect.width * rect.height > 1000000) { // > 1MP
      scale = 1;
    } else if (rect.width * rect.height > 500000) { // > 0.5MP
      scale = 1.5;
    }
    
    // Adjust for high DPI displays
    if (devicePixelRatio > 2) {
      scale = Math.min(scale, devicePixelRatio);
    }

    return {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      width: rect.width,
      height: rect.height,
    };
  }
}

export default ImageGenerator;
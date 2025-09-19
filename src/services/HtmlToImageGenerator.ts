import * as htmlToImage from 'html-to-image';

export interface HtmlToImageOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
  quality?: number;
  cacheBust?: boolean;
  includeQueryParams?: boolean;
  style?: Partial<CSSStyleDeclaration>;
  filter?: (node: Element) => boolean;
  skipAutoScale?: boolean;
  preferredFontFormat?: 'woff' | 'woff2' | 'truetype' | 'opentype';
}

export interface HtmlToImageResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export class HtmlToImageGenerator {
  private static readonly DEFAULT_OPTIONS: HtmlToImageOptions = {
    backgroundColor: '#ffffff',
    pixelRatio: 2, // High DPI for better quality
    quality: 1.0,
    cacheBust: true,
    includeQueryParams: true,
    skipAutoScale: false,
    preferredFontFormat: 'woff2',
  };

  /**
   * Generates a high-quality image from a DOM element using html-to-image
   * @param element - The DOM element to capture
   * @param options - Configuration options for image generation
   * @returns Promise resolving to image generation result
   */
  static async generateImage(
    element: HTMLElement,
    options: HtmlToImageOptions = {}
  ): Promise<HtmlToImageResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      const width = mergedOptions.width || rect.width;
      const height = mergedOptions.height || rect.height;

      // Configure html-to-image options
      const htmlToImageOptions = {
        width: width * (mergedOptions.pixelRatio || 2),
        height: height * (mergedOptions.pixelRatio || 2),
        backgroundColor: mergedOptions.backgroundColor,
        pixelRatio: mergedOptions.pixelRatio,
        quality: mergedOptions.quality,
        cacheBust: mergedOptions.cacheBust,
        includeQueryParams: mergedOptions.includeQueryParams,
        style: {
          transform: `scale(${mergedOptions.pixelRatio || 2})`,
          transformOrigin: 'top left',
          ...mergedOptions.style,
        },
        filter: mergedOptions.filter,
        skipAutoScale: mergedOptions.skipAutoScale,
        preferredFontFormat: mergedOptions.preferredFontFormat,
      };

      // Generate data URL using html-to-image
      const dataUrl = await htmlToImage.toPng(element, htmlToImageOptions);
      
      // Convert data URL to blob
      const blob = await this.dataUrlToBlob(dataUrl);
      
      return {
        dataUrl,
        blob,
        width: width * (mergedOptions.pixelRatio || 2),
        height: height * (mergedOptions.pixelRatio || 2),
      };
    } catch (error) {
      throw new Error(`Failed to generate image with html-to-image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    options: HtmlToImageOptions = {}
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
    options: HtmlToImageOptions = {}
  ): Promise<Blob> {
    try {
      const result = await this.generateImage(element, options);
      return result.blob;
    } catch (error) {
      throw new Error(`Failed to get image blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates image using different formats
   * @param element - The DOM element to capture
   * @param format - Image format ('png', 'jpeg', 'svg')
   * @param options - Configuration options
   * @returns Promise resolving to data URL
   */
  static async generateImageByFormat(
    element: HTMLElement,
    format: 'png' | 'jpeg' | 'svg' = 'png',
    options: HtmlToImageOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      const rect = element.getBoundingClientRect();
      const htmlToImageOptions = {
        width: (mergedOptions.width || rect.width) * (mergedOptions.pixelRatio || 2),
        height: (mergedOptions.height || rect.height) * (mergedOptions.pixelRatio || 2),
        backgroundColor: mergedOptions.backgroundColor,
        pixelRatio: mergedOptions.pixelRatio,
        quality: mergedOptions.quality,
        cacheBust: mergedOptions.cacheBust,
        style: {
          transform: `scale(${mergedOptions.pixelRatio || 2})`,
          transformOrigin: 'top left',
          ...mergedOptions.style,
        },
        filter: mergedOptions.filter,
      };

      switch (format) {
        case 'png':
          return await htmlToImage.toPng(element, htmlToImageOptions);
        case 'jpeg':
          return await htmlToImage.toJpeg(element, htmlToImageOptions);
        case 'svg':
          return await htmlToImage.toSvg(element, htmlToImageOptions);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to generate ${format} image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Converts a data URL to a blob
   * @param dataUrl - The data URL to convert
   * @returns Promise resolving to blob
   */
  private static async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    try {
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      throw new Error('Failed to convert data URL to blob');
    }
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
   * Validates browser compatibility for html-to-image
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

    if (!URL.createObjectURL) {
      missingFeatures.push('URL.createObjectURL()');
    }

    if (!document.createElement) {
      missingFeatures.push('document.createElement()');
    }

    if (!window.fetch) {
      missingFeatures.push('Fetch API');
    }

    // Check for potential issues
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      warnings.push('Safari may have CORS restrictions with external resources');
    }

    if (window.devicePixelRatio > 2) {
      warnings.push('High DPI display detected - image generation may be slower');
    }

    // Check for html-to-image specific requirements
    if (!window.MutationObserver) {
      warnings.push('MutationObserver not available - some features may not work');
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
  static getOptimizedOptions(element: HTMLElement): HtmlToImageOptions {
    const rect = element.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate optimal pixel ratio based on element size and device
    let pixelRatio = 2; // Default high quality
    
    // Reduce pixel ratio for very large elements to prevent memory issues
    if (rect.width * rect.height > 1000000) { // > 1MP
      pixelRatio = 1;
    } else if (rect.width * rect.height > 500000) { // > 0.5MP
      pixelRatio = 1.5;
    }
    
    // Adjust for high DPI displays
    if (devicePixelRatio > 2) {
      pixelRatio = Math.min(pixelRatio, devicePixelRatio);
    }

    return {
      backgroundColor: '#ffffff',
      pixelRatio,
      quality: 1.0,
      cacheBust: true,
      includeQueryParams: true,
      width: rect.width,
      height: rect.height,
      style: {
        // Ensure fonts are rendered properly
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      } as any,
    };
  }
}

export default HtmlToImageGenerator;
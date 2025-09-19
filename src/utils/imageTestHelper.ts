import { ImageGenerator } from '../services/ImageGenerator';

/**
 * Helper function to test image generation in development
 */
export const testImageGeneration = async (element: HTMLElement): Promise<void> => {
  try {
    console.log('Testing image generation...');
    console.log('Element:', element);
    console.log('Element dimensions:', {
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    });

    const compatibility = ImageGenerator.checkBrowserCompatibility();
    console.log('Browser compatibility:', compatibility);

    if (!compatibility.isSupported) {
      console.error('Browser not supported:', compatibility.missingFeatures);
      return;
    }

    const optimizedOptions = ImageGenerator.getOptimizedOptions(element);
    console.log('Optimized options:', optimizedOptions);

    const result = await ImageGenerator.generateImage(element, optimizedOptions);
    console.log('Image generation result:', {
      width: result.width,
      height: result.height,
      dataUrlLength: result.dataUrl.length,
      blobSize: result.blob.size,
    });

    // Create a temporary link to test the image
    const url = URL.createObjectURL(result.blob);
    console.log('Generated image URL:', url);
    
    // You can uncomment this to automatically download for testing
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'test-image.png';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Image generation failed:', error);
  }
};

export default testImageGeneration;
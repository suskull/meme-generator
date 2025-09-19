import { useRef, useState } from 'react';
import { EditableSMSContainer } from './components/EditableSMSContainer';
import { MemeImageGenerator, MemeImageGeneratorRef } from './components/MemeImageGenerator';
import { MetadataEditor } from './components/MetadataEditor';
import { useHtmlToImage } from './hooks/useHtmlToImage';
import { useImageGeneration } from './hooks/useImageGeneration';
import { useMemeState } from './hooks/useMemeState';

function App() {
  const {
    memeState,
    updateMessage,
    addImageToMessage,
    removeImageFromMessage,
    addMessage,
    deleteMessage,
    updateMetadata,
    resetToDefault
  } = useMemeState();

  const {
    isGenerating,
    error: imageError,
    downloadImage,
    clearError
  } = useImageGeneration({
    defaultFilename: 'vietnamese-meme.png'
  });

  const {
    isGenerating: isGeneratingHtml,
    error: htmlImageError,
    downloadImage: downloadHtmlImage,
    clearError: clearHtmlError
  } = useHtmlToImage({
    defaultFilename: 'vietnamese-meme-html.png'
  });

  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const imageGeneratorRef = useRef<MemeImageGeneratorRef>(null);

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Văn mẫu đòi tiền
        </h1>

        {/* Toggle Button */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <button
            onClick={() => setShowMetadataEditor(!showMetadataEditor)}
            className={`px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg transition-colors ${showMetadataEditor
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            {showMetadataEditor ? 'Hide' : 'Show'} Advanced Settings
          </button>
        </div>

        <div className={`flex flex-col gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto ${showMetadataEditor ? 'xl:flex-row' : 'lg:flex-row'
          }`}>
          {/* Editor Panel */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Edit Your Meme</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Click on any message, contact name, or timestamp to edit it. Use Enter to save, Esc to cancel.
              </p>

              <EditableSMSContainer
                memeState={memeState}
                onMessageChange={updateMessage}
                onMetadataChange={updateMetadata}
                onImageAdd={addImageToMessage}
                onImageRemove={removeImageFromMessage}
                onAddMessage={addMessage}
                onDeleteMessage={deleteMessage}
              />

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={resetToDefault}
                  className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset to Original
                </button>

                <button
                  onClick={async () => {
                    const generator = imageGeneratorRef.current;
                    if (generator) {
                      try {
                        console.log('HTML-to-Image download button clicked');

                        // Show the element for capture
                        generator.showForCapture();

                        // Wait for DOM to update and render
                        await new Promise(resolve => setTimeout(resolve, 200));

                        const imageElement = generator.getImageElement();
                        if (imageElement) {
                          console.log('Image element:', imageElement);
                          console.log('Element dimensions:', {
                            offsetWidth: imageElement.offsetWidth,
                            offsetHeight: imageElement.offsetHeight,
                            scrollWidth: imageElement.scrollWidth,
                            scrollHeight: imageElement.scrollHeight,
                          });

                          // Use optimized options for better capture with html-to-image
                          const options = {
                            backgroundColor: '#ffffff',
                            pixelRatio: 2,
                            quality: 1.0,
                            cacheBust: true,
                            style: {
                              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                            },
                          };

                          await downloadHtmlImage(imageElement, 'vietnamese-meme.png', options);
                          console.log('HTML-to-Image download completed successfully');
                        } else {
                          console.error('No image element found');
                        }
                      } catch (error) {
                        console.error('HTML-to-Image download failed:', error);
                      } finally {
                        // Always hide the element after capture
                        generator.hideAfterCapture();
                      }
                    } else {
                      console.error('No generator found');
                    }
                  }}
                  disabled={isGeneratingHtml}
                  className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGeneratingHtml ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>HTML-to-Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Editor Panel - Conditionally Rendered */}
          {showMetadataEditor && (
            <div className="w-full xl:w-80">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Advanced Settings</h3>
                  <button
                    onClick={() => setShowMetadataEditor(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Close advanced settings"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <MetadataEditor
                  metadata={memeState.metadata}
                  onMetadataChange={updateMetadata}
                />
              </div>
            </div>
          )}

          {/* Enhanced Live Preview Panel - Hidden as requested */}
          {/* <div className="flex-1">
            <EnhancedPreview memeState={memeState} />
          </div> */}
        </div>

        {/* Error Message */}
        {(imageError || htmlImageError) && (
          <div className="max-w-4xl mx-auto mt-4 sm:mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Image Generation Error
                  </h3>
                  <div className="mt-1 text-sm text-red-700">
                    {imageError || htmlImageError}
                  </div>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => {
                      clearError();
                      clearHtmlError();
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Image Generator Component */}
        <MemeImageGenerator ref={imageGeneratorRef} memeState={memeState} />
      </div>
    </div>
  )
}

export default App
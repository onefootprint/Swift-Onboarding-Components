import { useToast } from '@onefootprint/ui';
import imageCompression from 'browser-image-compression';

import compressImage from './utils/compress-image';
import convertHEICImage from './utils/convert-heic-image';
import imageFileToStrippedBase64 from './utils/image-file-to-stripped-base64';
import resizeImage from './utils/resize-image';

enum ImageProcessingStepError {
  heic = 'Error while converting HEIC image',
  resize = 'Error while resizing image',
  compress = 'Error while compressing image',
  other = 'Unknown Error',
}

type ProcessedImageType = { processedImageFile: File; mimeType: string };

const useProcessImage = () => {
  const toast = useToast();

  const handleError = (step: ImageProcessingStepError, error?: unknown) => {
    if (error) {
      console.error(error);
    }
    toast.show({
      title: 'Uh-oh',
      description: `${step}. Please upload try another image.`,
    });
  };

  const processImageFile = async (file: File) => {
    const output = await runProcessFileScript(file);

    return output;
  };

  const processImageUrl = async (
    url: string,
  ): Promise<ProcessedImageType | undefined> => {
    let file;
    try {
      file = await imageCompression.getFilefromDataUrl(url, 'imageFileName');
    } catch (error) {
      handleError(ImageProcessingStepError.other, error);
    }
    if (!file) {
      console.error('Image files undefined after image compression');
      return undefined;
    }

    const output = await runProcessFileScript(file);

    return output;
  };

  const runProcessFileScript = async (
    file: File,
  ): Promise<ProcessedImageType | undefined> => {
    let converted;
    try {
      converted = await convertHEICImage(file);
    } catch (e) {
      handleError(ImageProcessingStepError.heic, e);
      return undefined;
    }
    if (!converted) {
      handleError(ImageProcessingStepError.heic);
      return undefined;
    }

    const mimeType = converted.type;

    let resized;
    try {
      resized = await resizeImage(converted);
    } catch (e) {
      handleError(ImageProcessingStepError.resize, e);
      return undefined;
    }
    if (!resized) {
      handleError(ImageProcessingStepError.resize);
      return undefined;
    }

    let compressed;
    try {
      compressed = await compressImage(resized);
    } catch (e) {
      handleError(ImageProcessingStepError.compress, e);
      return undefined;
    }
    if (!compressed) {
      handleError(ImageProcessingStepError.compress);
      return undefined;
    }

    return {
      processedImageFile: compressed,
      mimeType,
    };
  };

  const convertImageFileToStrippedBase64 = async (
    file: File,
  ): Promise<string | undefined> => {
    let imageString;
    try {
      imageString = await imageFileToStrippedBase64(file);
    } catch (error) {
      handleError(ImageProcessingStepError.other, error);
    }

    return imageString;
  };

  return {
    processImageFile,
    processImageUrl,
    convertImageFileToStrippedBase64,
  };
};

export default useProcessImage;

import { useToast } from '@onefootprint/ui';
import imageCompression from 'browser-image-compression';
import partial from 'lodash/fp/partial';

import Logger from '../../../../utils/logger';
import { useImgProcessorsContext } from '../../components/image-processors';
import compressImage, {
  COMPRESS_EXTRA_MAX_SIZE_MB,
} from './utils/compress-image';
import imageFileToStrippedBase64 from './utils/image-file-to-stripped-base64';
import resizeImage from './utils/resize-image';

type ProcessedImageFile = { file: File; extraCompressed: boolean };
type Toast = ReturnType<typeof useToast>;
type HandleError = (step: ImageProcessingStepError, error?: unknown) => void;
type ImageProcessors = ReturnType<typeof useImgProcessorsContext>;
enum ImageProcessingStepError {
  heic = 'Error while converting HEIC image',
  resize = 'Error while resizing image',
  compress = 'Error while compressing image',
  other = 'Unknown Error',
}

const isHeicType = (x: unknown) => x === 'image/heic';

const stringify = (x: unknown) =>
  typeof x === 'string' ? x : JSON.stringify(x);

const errorHandler =
  (toast: Toast) => (step: ImageProcessingStepError, error?: unknown) => {
    if (error) {
      console.error(error);
      Logger.error(stringify(error), 'use-process-image');
    }
    toast.show({
      title: 'Uh-oh',
      description: `${step}. Please upload another image.`,
    });
  };

const runProcessFileScript = async (
  onError: HandleError,
  imageProcessors: ImageProcessors | undefined,
  file: File,
  extraCompress?: boolean,
): Promise<ProcessedImageFile | undefined> => {
  let converted: File;
  try {
    converted =
      isHeicType(file.type) && imageProcessors?.heic
        ? await imageProcessors
            .heic({ blob: file, toType: 'image/jpeg' })
            .then(res => {
              const blob = Array.isArray(res) ? res : [res];
              return new File(blob, file.name, {
                type: 'image/jpeg',
                lastModified: file.lastModified,
              });
            })
        : file;
  } catch (e) {
    onError(ImageProcessingStepError.heic, e);
    return undefined;
  }
  if (!converted) {
    onError(ImageProcessingStepError.heic);
    return undefined;
  }

  let resized;
  try {
    resized = await resizeImage(converted);
  } catch (e) {
    onError(ImageProcessingStepError.resize, e);
    return undefined;
  }
  if (!resized) {
    onError(ImageProcessingStepError.resize);
    return undefined;
  }

  let compressed;
  try {
    compressed = await compressImage(resized, extraCompress);
  } catch (e) {
    onError(ImageProcessingStepError.compress, e);
    return undefined;
  }
  if (!compressed) {
    onError(ImageProcessingStepError.compress);
    return undefined;
  }

  return {
    file: compressed,
    extraCompressed:
      resized.size > compressed.size &&
      !!extraCompress &&
      compressed.size <= COMPRESS_EXTRA_MAX_SIZE_MB,
  };
};

const convertImageFileToStrippedBase64 = async (
  onError: HandleError,
  file: File,
): Promise<string | undefined> => {
  let imageString;
  try {
    imageString = await imageFileToStrippedBase64(file);
  } catch (error) {
    onError(ImageProcessingStepError.other, error);
  }

  return imageString;
};

const processImageUrl = async (
  onError: HandleError,
  url: string,
  extraCompress?: boolean,
): Promise<ProcessedImageFile | undefined> => {
  let file;
  try {
    file = await imageCompression.getFilefromDataUrl(url, 'imageFileName');
  } catch (error) {
    onError(ImageProcessingStepError.other, error);
  }
  if (!file) {
    const str = 'Image files undefined after image compression';
    console.error(str);
    Logger.error(str, 'use-process-image');
    return undefined;
  }

  const output = await runProcessFileScript(
    onError,
    undefined,
    file,
    extraCompress,
  );
  return output;
};

const useProcessImage = () => {
  const toast = useToast();
  const imageProcessors = useImgProcessorsContext();
  const handleError = errorHandler(toast);

  return {
    convertImageFileToStrippedBase64: partial(
      convertImageFileToStrippedBase64,
      [handleError],
    ),
    processImageFile: partial(runProcessFileScript, [
      handleError,
      imageProcessors,
    ]),
    processImageUrl: partial(processImageUrl, [handleError]),
  };
};

export default useProcessImage;

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
  let converted: File | undefined;
  try {
    if (!isHeicType(file.type)) {
      converted = file;
    } else if (imageProcessors?.heic && !imageProcessors.heicLoading) {
      converted = await imageProcessors
        .heic({ blob: file, toType: 'image/jpeg' })
        .then(res => {
          const blob = Array.isArray(res) ? res : [res];
          return new File(blob, file.name, {
            type: 'image/jpeg',
            lastModified: file.lastModified,
          });
        });
    }
  } catch (e) {
    onError(ImageProcessingStepError.heic, e);
    return undefined;
  }
  if (!converted) {
    onError(ImageProcessingStepError.heic);
    return undefined;
  }
  Logger.info(
    `Converted image size (before resizing): ${converted.size} bytes`,
  );

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
  Logger.info(
    `Image size after resizing before compression: ${resized.size} bytes`,
  );

  let compressed;
  try {
    compressed = await compressImage(resized, extraCompress);
  } catch (e) {
    onError(ImageProcessingStepError.compress, e);
    Logger.warn("Moving on with the image that wasn't compressed");
    compressed = resized;
  }
  if (!compressed) {
    onError(ImageProcessingStepError.compress);
    Logger.warn("Moving on with the image that wasn't compressed");
    compressed = resized;
  }
  const extraCompressed =
    resized.size > compressed.size &&
    !!extraCompress &&
    compressed.size <= COMPRESS_EXTRA_MAX_SIZE_MB;
  Logger.info(
    `Image size after compression: ${compressed.size} bytes, extraCompressed: ${extraCompressed}`,
  );

  return {
    file: compressed,
    extraCompressed,
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
    Logger.error(str, 'use-process-image');
    return undefined;
  }
  Logger.info(
    `Image file size read from url (getFilefromDataUrl): ${file.size} bytes`,
  );

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

  const acceptedFileFormats = ['image/*'];
  if (imageProcessors?.heic) {
    acceptedFileFormats.push('.heic', '.heif');
  }

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
    acceptedFileFormats: acceptedFileFormats.join(','),
  };
};

export default useProcessImage;

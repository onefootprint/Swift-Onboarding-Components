import { useToast } from '@onefootprint/ui';
import imageCompression from 'browser-image-compression';
import partial from 'lodash/fp/partial';

import Logger from '../../../../utils/logger';
import { useImgProcessorsContext } from '../../components/image-processors';
import {
  hasFileReaderSupport,
  isFileOrBlob,
  isString,
} from '../../utils/capture';
import compressImage, {
  COMPRESS_EXTRA_MAX_SIZE_MB,
} from './utils/compress-image';
import imageFileToStrippedBase64 from './utils/image-file-to-stripped-base64';
import resizeImage from './utils/resize-image';

type ProcessedImageFile = { file: File | Blob; extraCompressed: boolean };
type Toast = ReturnType<typeof useToast>;
type HandleError = (step: ImageProcessingStepError, error?: unknown) => void;
type ImageProcessors = ReturnType<typeof useImgProcessorsContext>;
enum ImageProcessingStepError {
  heic = 'Error while converting HEIC image',
  resize = 'Error while resizing image',
  compress = 'Error while compressing image',
  other = 'Unknown Error',
  final = 'Please try another image',
}

const isError = (x: unknown): x is Error => x instanceof Error;
const isHeicType = (x: unknown) => x === 'image/heic';
const logError = (e: string) =>
  Logger.error(e, { location: 'use-process-image' });
const logInfo = (e: string) =>
  Logger.info(e, { location: 'use-process-image' });
const logWarn = (e: string) =>
  Logger.warn(e, { location: 'use-process-image' });

const stringify = (x: unknown): string => {
  try {
    return isString(x) ? x : JSON.stringify(x);
  } catch (e: unknown) {
    if (isError(e)) {
      logWarn(`Error during JSON.stringify: ${e?.message}`);
    }
    return '';
  }
};

const errorHandler =
  (toast: Toast) => (step: ImageProcessingStepError, error?: unknown) => {
    if (error) {
      logError(stringify(error));
    }
    toast.show({
      title: 'Uh-oh',
      description: `${step}.`,
    });
  };

const convertImageFileToStrippedBase64 = async (
  onError: HandleError,
  file: File,
): Promise<string | undefined> => {
  try {
    return await imageFileToStrippedBase64(file);
  } catch (error) {
    onError(ImageProcessingStepError.other, error);
    return undefined;
  }
};

const stepHeicConversion = async (
  onError: HandleError,
  imageProcessors: ImageProcessors | undefined,
  file: File,
): Promise<File | Error> => {
  try {
    if (imageProcessors?.heic && !imageProcessors.heicLoading) {
      const res = await imageProcessors.heic({
        blob: file,
        toType: 'image/jpeg',
      });
      const blob = Array.isArray(res) ? res : [res];
      return new File(blob, file.name, {
        type: 'image/jpeg',
        lastModified: file.lastModified,
      });
    }

    logWarn('HEIC image processor not available');
    return new Error('HEIC image processor not available');
  } catch (e: unknown) {
    onError(ImageProcessingStepError.heic, e);
    return isError(e) ? e : new Error('HEIC processing failed');
  }
};

const stepImageResize = async (
  onError: HandleError,
  file: File,
): Promise<File | Blob | Error> => {
  try {
    const resized = await resizeImage(file);
    return resized || new Error('resize processing failed');
  } catch (e) {
    onError(ImageProcessingStepError.resize, e);
    return isError(e) ? e : new Error('resize processing failed');
  }
};

const stepImageCompression = async (
  onError: HandleError,
  file: File | Blob,
  extraCompress: boolean = false,
): Promise<File | Error> => {
  try {
    const compressed = await compressImage(file, extraCompress);
    return compressed || new Error('compress processing failed');
  } catch (e) {
    onError(ImageProcessingStepError.compress, e);
    return isError(e) ? e : new Error('compress processing failed');
  }
};

/**
 * Processes a file by performing HEIC conversion, image resizing, and compression.
 *
 * @param {HandleError} onError - Function to handle errors.
 * @param {ImageProcessors | undefined} imageProcessors - Image processors configuration.
 * @param {File} file - The input file to be processed.
 * @param {boolean} [extraCompressFlag] - Optional flag for extra compression.
 * @returns {Promise<ProcessedImageFile | undefined>} A Promise that resolves to the processed file
 * or undefined if an error occurs during processing.
 *
 * @typedef {Object} ProcessedImageFile - Object containing the processed file and extra compression flag.
 * @property {File} file - The processed file.
 * @property {boolean} extraCompressed - Indicates if extra compression was applied.
 */
const runProcessFileScript = async (
  onError: HandleError,
  imageProcessors: ImageProcessors | undefined,
  file: File,
  extraCompressFlag?: boolean,
): Promise<ProcessedImageFile | undefined> => {
  logInfo(`Original file type | size: ${file.type} | ${file.size}`);

  if (file.type === 'application/pdf') {
    return { file, extraCompressed: false };
  }

  const heicOutput = isHeicType(file.type)
    ? await stepHeicConversion(onError, imageProcessors, file)
    : file;

  if (!isError(heicOutput)) {
    logInfo(`HEIC conversion size: ${heicOutput.size} bytes`);
  }

  const resizeInput = isFileOrBlob(heicOutput) ? heicOutput : file;
  let resizeOutput;
  if (isHeicType(resizeInput.type)) {
    resizeOutput = resizeInput;
  } else {
    resizeOutput = hasFileReaderSupport()
      ? await stepImageResize(onError, resizeInput)
      : new Error('Unsupported FileReader in this browser');
  }

  if (isError(resizeOutput)) {
    logWarn(`Proceeding with not resized image: ${stringify(resizeOutput)}`);
  } else {
    logInfo(`Resized image size: ${resizeOutput.size} bytes`);
  }

  const prevFile = [resizeOutput, heicOutput].find(isFileOrBlob);
  const compressionInput = prevFile && !isError(prevFile) ? prevFile : file;
  const compressOutput = await stepImageCompression(
    onError,
    compressionInput,
    extraCompressFlag,
  );

  if (isError(compressOutput)) {
    logWarn(`Proceeding with uncompressed image: ${stringify(compressOutput)}`);
  } else {
    logInfo(`Compressed image size: ${compressOutput.size} bytes`);
  }

  const extraCompressed =
    !isError(resizeOutput) &&
    !isError(compressOutput) &&
    resizeOutput.size > compressOutput.size &&
    Boolean(extraCompressFlag) &&
    compressOutput.size <= COMPRESS_EXTRA_MAX_SIZE_MB;

  logInfo(`extraCompressed: ${extraCompressed}`);

  const final = [compressOutput, resizeOutput, heicOutput].find(isFileOrBlob);
  if (!final || isError(final)) {
    onError(ImageProcessingStepError.final);
  }
  return final && !isError(final)
    ? { file: final, extraCompressed }
    : undefined;
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
    logError('Image files undefined after image compression');
    return undefined;
  }
  logInfo(
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

const useProcessImage = (options?: { allowPdf?: boolean }) => {
  const toast = useToast();
  const imageProcessors = useImgProcessorsContext();
  const handleError = errorHandler(toast);

  const acceptedFileFormats = ['image/*'];
  if (imageProcessors?.heic) {
    acceptedFileFormats.push('.heic', '.heif');
  }
  if (options?.allowPdf) {
    acceptedFileFormats.push('application/pdf');
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

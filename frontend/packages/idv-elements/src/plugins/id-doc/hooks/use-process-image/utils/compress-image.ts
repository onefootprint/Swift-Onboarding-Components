import imageCompression from 'browser-image-compression';

import { isBlob } from '../../../utils/capture';

/*
  From idology:
  - Put the image format at 90% quality if possible within the sizing constraints.
  - Compress both images, front and back; each image must not exceed 5 megabytes.
*/

const JPEG = 'image/jpeg';
const MAX_SIZE_MB = 1;
const QUALITY = 90;
export const COMPRESS_EXTRA_MAX_SIZE_MB = 0.3;

// Input: Non-HEIC Image File. Output: Compressed JPEG Image File.
const compressImage = async (
  fileOrBlob: File | Blob,
  extraCompress?: boolean,
): Promise<File | undefined> => {
  const options = {
    maxSizeMB: extraCompress ? COMPRESS_EXTRA_MAX_SIZE_MB : MAX_SIZE_MB,
    intialQuality: QUALITY,
    useWebWorker: true,
    fileType: JPEG,
  };

  const file = isBlob(fileOrBlob)
    ? new File(
        Array.isArray(fileOrBlob) ? fileOrBlob : [fileOrBlob],
        'file-to-compress',
        { type: JPEG, lastModified: new Date().getTime() },
      )
    : fileOrBlob;

  return imageCompression(file, options);
};

export default compressImage;

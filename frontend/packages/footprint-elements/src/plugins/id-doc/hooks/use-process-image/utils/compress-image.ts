import imageCompression from 'browser-image-compression';

/*
  From idology:
  - Put the image format at 90% quality if possible within the sizing constraints.
  - Compress both images, front and back; each image must not exceed 5 megabytes.
*/

const QUALITY = 90;
const MAX_SIZE_MB = 5;

// Input: Non-HEIC Image File. Output: Compressed JPEG Image File.
const compressImage = async (imageFile: File): Promise<File | undefined> => {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    intialQuality: QUALITY,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  return imageCompression(imageFile, options);
};

export default compressImage;

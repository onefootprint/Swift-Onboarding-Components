import FileResizer from 'react-image-file-resizer';

import { isFileOrBlob, isString } from '../../../utils/capture';

/*
  From idology:
  - Ensure that the image has a minimum of 2048x1536 pixel resolution but is no larger than 4288x3216.
*/

const MAX_WIDTH = 4288;
const MAX_HEIGHT = 3216;
const QUALITY = 100;
const ROTATION = 0;
const MIN_WIDTH = 2048;
const MIN_HEIGHT = 1536;
const OUTPUT_FORMAT = 'file';
const FORMAT = 'JPEG';

// Input: Non-HEIC Image File. Resized JPEG Image File.
const resizeImage = async (imageFile: Blob): Promise<File | Blob | undefined> =>
  new Promise(resolve => {
    FileResizer.imageFileResizer(
      imageFile,
      MAX_WIDTH,
      MAX_HEIGHT,
      FORMAT,
      QUALITY,
      ROTATION,
      (uri: string | Blob | File | ProgressEvent<FileReader>) => {
        if (isFileOrBlob(uri)) {
          resolve(uri);
        } else if (isString(uri)) {
          const file = new File([uri], 'resized-image', { type: 'image/jpeg' });
          resolve(file);
        } else {
          resolve(undefined);
        }
      },
      OUTPUT_FORMAT,
      MIN_WIDTH,
      MIN_HEIGHT,
    );
  });

export default resizeImage;

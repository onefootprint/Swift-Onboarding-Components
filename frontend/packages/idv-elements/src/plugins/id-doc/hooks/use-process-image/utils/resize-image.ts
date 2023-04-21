import FileResizer from 'react-image-file-resizer';

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
const resizeImage = async (imageFile: File): Promise<File | undefined> =>
  new Promise(resolve => {
    FileResizer.imageFileResizer(
      imageFile,
      MAX_WIDTH,
      MAX_HEIGHT,
      FORMAT,
      QUALITY,
      ROTATION,
      uri => {
        resolve(uri as File);
      },
      OUTPUT_FORMAT,
      MIN_WIDTH,
      MIN_HEIGHT,
    );
  });

export default resizeImage;

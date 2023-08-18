import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Image } from 'react-native';

const getImageSize = async (
  path: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      `file://${path}`,
      (width, height) => resolve({ width, height }),
      error => reject(error),
    );
  });
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
  });
};

const encodeImagePath = async (path: string) => {
  const originalSize = await getImageSize(path);
  const newWidth = originalSize.width / 2;
  const newHeight = originalSize.height / 2;
  const newImage = await ImageResizer.createResizedImage(
    path,
    newWidth,
    newHeight,
    'JPEG',
    80,
    0,
  );
  const response = await fetch(`file://${newImage.path}`);
  const blob = await response.blob();
  const base64Data = await blobToBase64(blob);
  return base64Data.replace('data:image/jpeg;base64,', '');
};

export default encodeImagePath;

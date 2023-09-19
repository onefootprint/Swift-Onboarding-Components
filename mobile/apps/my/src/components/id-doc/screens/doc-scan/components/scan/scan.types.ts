import { PhotoFile } from 'react-native-vision-camera';

export type ScanType = 'front' | 'back';

export type ScanSize = 'default' | 'large';

export type ScanPicture = {
  photo: PhotoFile | null;
  meta: Record<string, boolean>;
};

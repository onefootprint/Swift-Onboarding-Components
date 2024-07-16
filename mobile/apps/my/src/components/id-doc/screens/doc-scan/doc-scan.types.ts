import type { PhotoFile } from 'react-native-vision-camera';

export type Document = {
  photo: PhotoFile | null;
  meta: Record<string, boolean>;
};

export type Detection = {
  isDetected: boolean;
  feedback: string;
  data: Record<string, unknown>;
};

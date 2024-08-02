import type { FaceStatus } from './hooks/use-face-detection';
import type { CardCaptureStatus } from './utils/graphics-utils/graphics-processing-utils';

export type DeviceKind = 'mobile' | 'desktop';
export type AutoCaptureKind = 'idDoc' | 'face' | 'nonIdDoc';
export type Resolution = { width: number; height: number };
export type CaptureStatus = `${FaceStatus}` | `${CardCaptureStatus}`;
export type VideoRef = React.RefObject<HTMLVideoElement>;

export type DocSrcDimensions = {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
};

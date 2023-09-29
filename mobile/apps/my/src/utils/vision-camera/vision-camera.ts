import { Frame, VisionCameraProxy } from 'react-native-vision-camera';

const getPlugin = (name: string) =>
  VisionCameraProxy.getFrameProcessorPlugin(name);

const detectDocumentPlugin = getPlugin('detectDocument');
const detectFacePlugin = getPlugin('detectFace');
const detectBarcodePlugin = getPlugin('detectBarcodes');

type DetectDocumentResponse = {
  isDocument: boolean;
};

type DetectFaceResponse = {
  hasFace: boolean;
  isFaceInCenter: boolean;
  isFaceStraight: boolean;
  isStable: boolean;
};

// type DetectBarcodeResponse = {
//   barcodes: any[];
// };

export const detectDocument = (frame: Frame) => {
  'worklet';

  if (detectDocumentPlugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return detectDocumentPlugin.call(frame) as DetectDocumentResponse;
};

export const detectFace = (frame: Frame, options: any) => {
  'worklet';

  if (detectFacePlugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return detectFacePlugin.call(frame, options) as DetectFaceResponse;
};

export const detectBarcodes = (frame: Frame) => {
  'worklet';

  if (detectBarcodePlugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return detectBarcodePlugin.call(frame) as any;
};

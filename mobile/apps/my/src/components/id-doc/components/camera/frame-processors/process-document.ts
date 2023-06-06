import type { Frame } from 'react-native-vision-camera';

function processDocument(frame: Frame, args: any) {
  'worklet';

  // @ts-expect-error because this function is dynamically injected by VisionCamera
  return __processDocument(frame, args);
}

export default processDocument;

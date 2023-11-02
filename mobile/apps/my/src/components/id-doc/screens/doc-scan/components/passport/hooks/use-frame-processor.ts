import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor as useVCFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { detectDocument } from '@/utils/vision-camera';

import type { Detection } from '../../../doc-scan.types';

const detected = {
  isDetected: true,
  feedback: '',
  data: {},
};

const useFrameProcessor = () => {
  const detector = useSharedValue(false);
  const [object, setObject] = useState<Detection>({
    isDetected: false,
    feedback: '',
    data: {},
  });
  const setObjectJs = Worklets.createRunInJsFn(setObject);
  const setDetectorJs = Worklets.createRunInJsFn((value: boolean) => {
    detector.value = value;
  });
  const frameProcessor = useVCFrameProcessor(
    frame => {
      'worklet';

      const result = detectDocument(frame);
      if (result.isDocument) {
        setDetectorJs(true);
        setObjectJs(detected);
      } else {
        setDetectorJs(false);
        setObjectJs({
          isDetected: false,
          feedback: 'Position the document in view',
          data: {},
        });
      }
    },
    [detector],
  );

  return { object, detector, frameProcessor };
};

export default useFrameProcessor;

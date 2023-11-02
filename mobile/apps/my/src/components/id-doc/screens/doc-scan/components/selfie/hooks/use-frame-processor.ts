import { useState } from 'react';
import { Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor as useVCFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { detectFace } from '@/utils/vision-camera';

import type { Detection } from '../../../doc-scan.types';

const detected = {
  isDetected: true,
  feedback: '',
  data: {},
};

const useFrameProcessor = () => {
  const { width, height } = Dimensions.get('window');
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

      const options = { width, height };
      const result = detectFace(frame, options);
      if (result.hasFace && result.isFaceInCenter && result.isFaceStraight) {
        setDetectorJs(true);
        setObjectJs(detected);
      } else {
        setDetectorJs(false);
        const data = {
          hasFace: result.hasFace,
          isFaceInCenter: result.hasFace,
          isFaceStraight: result.isFaceInCenter,
        };
        if (!result.hasFace) {
          setObjectJs({
            isDetected: false,
            feedback: 'Position face, stay steady',
            data,
          });
          return;
        }
        if (!result.isFaceInCenter) {
          setObjectJs({
            isDetected: false,
            feedback: 'Face is outside the frame outline',
            data,
          });
          return;
        }
        if (!result.isFaceStraight) {
          setObjectJs({
            isDetected: false,
            feedback: 'Face is tilted or looking other way',
            data,
          });
        }
      }
    },
    [detector],
  );

  return { frameProcessor, object, detector };
};

export default useFrameProcessor;

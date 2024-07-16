import type { UploadDocumentSide } from '@onefootprint/types';
import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { runAtTargetFps, useFrameProcessor as useVCFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { detectDocument } from '@/utils/vision-camera';

import type { Detection } from '../../../doc-scan.types';

export type DefaultDocumentProps = {
  side: UploadDocumentSide;
  documentName: string;
};

const detected = {
  isDetected: true,
  feedback: '',
  data: {},
};

const useFrameProcessor = ({ side, documentName }: DefaultDocumentProps) => {
  const [object, setObject] = useState<Detection>({
    isDetected: false,
    feedback: '',
    data: {},
  });
  const detector = useSharedValue(false);
  const setObjectJs = Worklets.createRunInJsFn(setObject);
  const setDetectorJs = Worklets.createRunInJsFn((value: boolean) => {
    detector.value = value;
  });
  const [shouldDetect, setShouldDetect] = useState(true);

  const frameProcessor = useVCFrameProcessor(
    frame => {
      'worklet';

      runAtTargetFps(30, () => {
        'worklet';

        if (!shouldDetect) return;
        const result = detectDocument(frame);
        if (result.isDocument) {
          setDetectorJs(true);
          setObjectJs(detected);
        } else {
          setDetectorJs(false);
          setObjectJs({
            isDetected: false,
            feedback: `Scan the ${side.toUpperCase()} of your ${documentName}`,
            data: {},
          });
        }
      });
    },
    [detector, shouldDetect],
  );

  return {
    object,
    detector,
    frameProcessor,
    disableDetection: () => setShouldDetect(false),
  };
};

export default useFrameProcessor;

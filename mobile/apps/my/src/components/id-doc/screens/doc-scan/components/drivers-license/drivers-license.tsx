import { SubmitDocumentSide } from '@onefootprint/types';
import React, { useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import DocInstructions from '../doc-instructions';
import Scan from '../scan';

export type DriversLicenseProps = {
  side: SubmitDocumentSide;
};

const DEFAULT_ASPECT_RATIO = 1.586;

const DriversLicense = ({ side }: DriversLicenseProps) => {
  const { t, allT } = useTranslation('components.scan.drivers-license');
  const [feedback, setFeedback] = useState('');
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {};
      const result = detectDocument(frame, options);
      if (result.isDocument) {
        detector.value = true;
        runOnJS(setObjectDetected)(true);
        runOnJS(setFeedback)('Hold still...');
      } else {
        detector.value = false;
        runOnJS(setObjectDetected)(false);
        runOnJS(setFeedback)('Position the document in view');
      }
    },
    [detector],
  );

  return (
    <DocInstructions title={t(`instructions.${side}`)}>
      <Scan
        feedback={feedback}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        subtitle={allT(`doc-side.${side}`)}
        title={t('title')}
      >
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </DocInstructions>
  );
};

export default DriversLicense;

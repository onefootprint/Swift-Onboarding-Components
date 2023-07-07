import React, { useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import DocInstructions from '../doc-instructions';
import Scan from '../scan';

const Passport = () => {
  const { t } = useTranslation('components.scan.passport');
  const [feedback, setFeedback] = useState('');
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {};
      const result = detectDocument(frame, options);
      if (result.is_document) {
        detector.value = true;
        runOnJS(setObjectDetected)(true);
        runOnJS(setFeedback)('Hold still...');
      } else {
        detector.value = false;
        runOnJS(setFeedback)('Position the document in view');
        runOnJS(setObjectDetected)(false);
      }
    },
    [detector],
  );

  return (
    <DocInstructions title={t('instructions')}>
      <Scan
        feedback={feedback}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        title={t('title')}
      >
        <Frame detector={detector} />
      </Scan>
    </DocInstructions>
  );
};

export default Passport;

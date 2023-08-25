import React, { useContext, useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import Instructions from '../default-instructions';
import Scan from '../scan';
import ScanContext from '../scan-context';
import { StepperProps } from '../stepper';

const DEFAULT_ASPECT_RATIO = 1.586;

type VisaProps = {
  stepperValues: StepperProps;
};

const Visa = ({ stepperValues }: VisaProps) => {
  const { t } = useTranslation('components.scan.visa');
  const { country } = useContext(ScanContext);
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
        runOnJS(setFeedback)('Position the document in view');
        runOnJS(setObjectDetected)(false);
      }
    },
    [detector],
  );

  return (
    <Instructions
      title={t('instructions', { country: country.value3 })}
      stepperValues={stepperValues}
    >
      <Scan
        feedback={feedback}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        title={t('title')}
        stepperValues={stepperValues}
      >
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </Instructions>
  );
};

export default Visa;

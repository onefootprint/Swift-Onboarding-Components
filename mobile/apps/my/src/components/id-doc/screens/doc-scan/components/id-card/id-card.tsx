import { UploadDocumentSide } from '@onefootprint/types';
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

export type IdCardProps = {
  side: UploadDocumentSide;
  stepperValues: StepperProps;
};

const DEFAULT_ASPECT_RATIO = 1.586;

const IdCard = ({ side, stepperValues }: IdCardProps) => {
  const { t, allT } = useTranslation('components.scan.id-card');
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
        runOnJS(setObjectDetected)(false);
        runOnJS(setFeedback)('Position the document in view');
      }
    },
    [detector],
  );

  return (
    <Instructions
      title={t(`instructions.${side}`, { country: country.value3 })}
      stepperValues={stepperValues}
    >
      <Scan
        stepperValues={stepperValues}
        feedback={feedback}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        subtitle={allT(`doc-side.${side}`)}
        title={t('title')}
      >
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </Instructions>
  );
};

export default IdCard;

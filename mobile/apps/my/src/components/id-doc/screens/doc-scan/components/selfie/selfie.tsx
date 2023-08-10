import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectFace } from 'vision-camera-plugin-face-detection';

import useTranslation from '@/hooks/use-translation';

import Camera from '../scan';
import { StepperProps } from '../stepper';
import Frame from './components/frame';
import Instructions from './components/instructions';

export type SelfieProps = {
  stepperValues: StepperProps;
};

const Selfie = ({ stepperValues }: SelfieProps) => {
  const { width, height } = Dimensions.get('window');

  const { t } = useTranslation('components.scan.selfie');
  const [feedback, setFeedback] = useState('');
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = { width, height };
      const result = detectFace(frame, options);

      if (
        result.hasFace &&
        result.isFaceInCenter &&
        result.isFaceStraight &&
        result.isStable
      ) {
        detector.value = true;
        runOnJS(setObjectDetected)(true);
        runOnJS(setFeedback)('Hold still...');
      } else {
        detector.value = false;
        runOnJS(setObjectDetected)(false);

        if (!result.hasFace || !result.isStable) {
          runOnJS(setFeedback)('Position face, stay steady');
          return;
        }
        if (!result.isFaceInCenter) {
          runOnJS(setFeedback)('Face is outside the frame outline');
          return;
        }
        if (!result.isFaceStraight) {
          runOnJS(setFeedback)('Face is tilted or looking other way');
        }
      }
    },
    [detector],
  );

  return (
    <Instructions stepperValues={stepperValues}>
      <Camera
        feedback={feedback}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        size="large"
        title={t('title')}
        type="front"
        stepperValues={stepperValues}
      >
        <Frame detector={detector} />
      </Camera>
    </Instructions>
  );
};

export default Selfie;

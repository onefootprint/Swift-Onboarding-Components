import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectFace } from 'vision-camera-plugin-face-detection';

import { REVIEW_AUTH_TOKEN } from '@/config/constants';
import useTranslation from '@/hooks/use-translation';

import Camera from '../scan';
import ConsentDialog from './components/consent-dialog';
import Frame from './components/frame';

export type SelfieProps = {
  authToken: string;
};

const { width, height } = Dimensions.get('window');

const Selfie = ({ authToken }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');
  const shouldShowContent = authToken !== REVIEW_AUTH_TOKEN;
  const [feedback, setFeedback] = useState('');
  const [isCameraDisabled, setIsCameraDisable] = useState(shouldShowContent);
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = { width, height };
      const result = detectFace(frame, options);

      if (result.hasFace && result.isFaceInCenter && result.isFaceStraight) {
        detector.value = true;
        runOnJS(setObjectDetected)(true);
        runOnJS(setFeedback)('Hold still...');
      } else {
        detector.value = false;
        runOnJS(setObjectDetected)(false);

        if (!result.hasFace) {
          runOnJS(setFeedback)('Detecting...');
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
    <>
      <Camera
        disabled={isCameraDisabled}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        title={t('title')}
        type="front"
        feedback={feedback}
      >
        <Frame detector={detector} />
      </Camera>
      {shouldShowContent && (
        <ConsentDialog
          authToken={authToken}
          onSubmit={() => {
            setIsCameraDisable(false);
          }}
        />
      )}
    </>
  );
};

export default Selfie;

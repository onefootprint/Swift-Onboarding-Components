import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectFace } from 'vision-camera-plugin-face-detection';

import { REVIEW_AUTH_TOKEN } from '@/config/constants';
import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import ConsentDialog from './components/consent-dialog';
import Frame from './components/frame';

export type SelfieProps = {
  authToken: string;
};

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

      const options = {
        width: windowWidth - 32,
        height: 220,
      };
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
        detector={detector}
        disabled={isCameraDisabled}
        Frame={Frame}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        size="large"
        title={t('title')}
        type="front"
        feedback={feedback}
      />
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

const windowWidth = Dimensions.get('window').width;

export default Selfie;

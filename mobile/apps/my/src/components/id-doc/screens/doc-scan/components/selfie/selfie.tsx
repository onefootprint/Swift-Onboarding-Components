import { IcoEmojiHappy24 } from '@onefootprint/icons';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { hasFace } from 'vision-camera-plugin-face-detection';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import ConsentDialog from './components/consent-dialog';
import Frame from './components/frame';

export type SelfieProps = {
  authToken: string;
  loading: boolean;
  onSubmit: (image: string) => void;
  success?: boolean;
};

const Selfie = ({ authToken, loading, onSubmit, success }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');
  const [isCameraDisabled, setIsCameraDisable] = useState(true);
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {
        width: windowWidth - 32,
        height: 220,
      };
      const result = hasFace(frame, options);
      detector.value = result.has_face;
      if (result.has_face) {
        runOnJS(setObjectDetected)(true);
      } else {
        runOnJS(setObjectDetected)(false);
      }
    },
    [detector],
  );

  return (
    <>
      <Camera
        disabled={isCameraDisabled}
        instructions={{
          IconComponent: IcoEmojiHappy24,
          title: t('instructions.title'),
        }}
        detector={detector}
        Frame={Frame}
        frameProcessor={frameProcessor}
        isObjectDetected={objectedDetected}
        loading={loading}
        onSubmit={onSubmit}
        size="large"
        success={success}
        title={t('title')}
        type="front"
      />
      <ConsentDialog
        authToken={authToken}
        onSubmit={() => {
          setIsCameraDisable(false);
        }}
      />
    </>
  );
};

const windowWidth = Dimensions.get('window').width;

export default Selfie;

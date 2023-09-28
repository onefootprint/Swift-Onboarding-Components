import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectFace } from 'vision-camera-plugin-face-detection';

import useTranslation from '@/hooks/use-translation';

import Camera from '../scan';
import type { ScanObject } from '../scan/scan.types';
import Frame from './components/frame';
import Instructions from './components/instructions';

const Selfie = () => {
  const { width, height } = Dimensions.get('window');
  const { t } = useTranslation('components.scan.selfie');
  const detector = useSharedValue(false);
  const [object, setObject] = useState<ScanObject>({
    isDetected: false,
    feedback: '',
    data: {},
  });

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
        runOnJS(setObject)({
          isDetected: true,
          feedback: 'Hold still..',
          data: {},
        });
      } else {
        detector.value = false;

        if (!result.hasFace) {
          runOnJS(setObject)({
            isDetected: false,
            feedback: 'Position face, stay steady',
            data: {},
          });
          return;
        }
        if (!result.isFaceInCenter) {
          runOnJS(setObject)({
            isDetected: false,
            feedback: 'Face is outside the frame outline',
            data: {},
          });
          return;
        }
        if (!result.isFaceStraight) {
          runOnJS(setObject)({
            isDetected: false,
            feedback: 'Face is tilted or looking other way',
            data: {},
          });
        }
      }
    },
    [detector],
  );

  return (
    <Instructions>
      <Camera
        frameProcessor={frameProcessor}
        object={object}
        size="large"
        title={t('title')}
        type="front"
      >
        <Frame detector={detector} />
      </Camera>
    </Instructions>
  );
};

export default Selfie;

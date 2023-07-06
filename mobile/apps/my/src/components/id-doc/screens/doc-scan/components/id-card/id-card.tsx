import { SubmitDocumentSide } from '@onefootprint/types';
import React, { useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import Camera from '../scan';

export type IdCardProps = {
  side: SubmitDocumentSide;
};

const IdCard = ({ side }: IdCardProps) => {
  const { t } = useTranslation('components.scan.id-card');
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
        runOnJS(setFeedback)('Detecting...');
        runOnJS(setObjectDetected)(false);
      }
    },
    [detector],
  );

  return (
    <Camera
      feedback={feedback}
      frameProcessor={frameProcessor}
      isObjectDetected={objectedDetected}
      title={t(`title-${side}`)}
    >
      <Frame detector={detector} />
    </Camera>
  );
};

export default IdCard;

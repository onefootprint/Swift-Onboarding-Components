import { SubmitDocumentSide } from '@onefootprint/types';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { documentProcessor } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

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

      const options = {
        frame: { x: 16, y: 50, width: windowWidth - 32, height: 220 },
      };
      const result = documentProcessor(frame, options);
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
    />
  );
};

const windowWidth = Dimensions.get('window').width;

export default IdCard;

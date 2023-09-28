import { UploadDocumentSide } from '@onefootprint/types';
import React, { useContext, useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import Instructions from '../default-instructions';
import Scan from '../scan';
import type { ScanObject } from '../scan/scan.types';
import ScanContext from '../scan-context';

const DEFAULT_ASPECT_RATIO = 1.42;

export type PassportProps = {
  side: UploadDocumentSide;
};

const Passport = ({ side }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');
  const { country } = useContext(ScanContext);
  const detector = useSharedValue(false);
  const [object, setObject] = useState<ScanObject>({
    isDetected: false,
    feedback: '',
    data: {},
  });

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {};
      const result = detectDocument(frame, options);
      if (result.isDocument) {
        detector.value = true;
        runOnJS(setObject)({
          isDetected: true,
          feedback: 'Hold still..',
          data: {},
        });
      } else {
        detector.value = false;
        runOnJS(setObject)({
          isDetected: false,
          feedback: 'Position the document in view',
          data: {},
        });
      }
    },
    [detector],
  );

  return (
    <Instructions
      side={side}
      title={t('instructions', { country: country.value3 })}
    >
      <Scan object={object} frameProcessor={frameProcessor} title={t('title')}>
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </Instructions>
  );
};

export default Passport;

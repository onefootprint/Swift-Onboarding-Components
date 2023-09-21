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
import { StepperProps } from '../stepper';

export type ResidenceDocumentProps = {
  side: UploadDocumentSide;
  stepperValues: StepperProps;
};

const DEFAULT_ASPECT_RATIO = 1.586;

const ResidenceDocument = ({ side, stepperValues }: ResidenceDocumentProps) => {
  const { t, allT } = useTranslation('components.scan.residence-document');
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
      title={t(`instructions.${side}`, { country: country.value3 })}
      stepperValues={stepperValues}
    >
      <Scan
        frameProcessor={frameProcessor}
        object={object}
        stepperValues={stepperValues}
        subtitle={allT(`doc-side.${side}`)}
        title={t('title')}
      >
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </Instructions>
  );
};

export default ResidenceDocument;

import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';
import kebabCase from 'lodash/kebabCase';
import React, { useContext, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';
import { detectDocument } from '@/utils/vision-camera';

import Frame from '../default-frame';
import Instructions from '../default-instructions';
import Scan from '../scan';
import type { ScanObject } from '../scan/scan.types';
import ScanContext from '../scan-context';

const DEFAULT_ASPECT_RATIO = 1.586;

export type DefaultDocumentProps = {
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
};

const DefaultDocument = ({ side, type }: DefaultDocumentProps) => {
  const { t, allT } = useTranslation(`components.scan.${kebabCase(type)}`);
  const { country } = useContext(ScanContext);
  const [object, setObject] = useState<ScanObject>({
    isDetected: false,
    feedback: '',
    data: {},
  });
  const setObjectJs = Worklets.createRunInJsFn(setObject);
  const detector = useSharedValue(false);
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const result = detectDocument(frame);
      if (result.isDocument) {
        detector.value = true;
        setObjectJs({
          isDetected: true,
          feedback: 'Hold still..',
          data: {},
        });
      } else {
        detector.value = false;
        setObjectJs({
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
      title={t(`instructions.${side}`, { country: country.value3 })}
    >
      <Scan
        frameProcessor={frameProcessor}
        object={object}
        subtitle={allT(`doc-side.${side}`)}
        title={t('title')}
      >
        <Frame detector={detector} aspectRatio={DEFAULT_ASPECT_RATIO} />
      </Scan>
    </Instructions>
  );
};

export default DefaultDocument;

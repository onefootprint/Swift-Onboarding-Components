import { UploadDocumentSide } from '@onefootprint/types';
import React, { useContext, useState } from 'react';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { detectBarcode } from 'vision-camera-plugin-barcode-detection';
import { detectDocument } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Frame from '../default-frame';
import Instructions from '../default-instructions';
import Scan from '../scan';
import type { ScanObject } from '../scan/scan.types';
import ScanContext from '../scan-context';

export type DriversLicenseProps = {
  side: UploadDocumentSide;
};

const DEFAULT_ASPECT_RATIO = 1.586;
const DEFAULT_BARCODE_RESULT = { barcodes: [] };

const DriversLicense = ({ side }: DriversLicenseProps) => {
  const { t, allT } = useTranslation('components.scan.drivers-license');
  const { country } = useContext(ScanContext);
  const detector = useSharedValue(false);
  const [object, setObject] = useState<ScanObject>({
    isDetected: false,
    feedback: '',
    data: {},
  });
  const requiresCode =
    side === UploadDocumentSide.Back && country.value === 'US';

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const documentResult = detectDocument(frame, {});
      const barcodeResult = requiresCode
        ? detectBarcode(frame, {})
        : DEFAULT_BARCODE_RESULT;

      const hasBarcode = barcodeResult.barcodes.length > 0;
      const isDetected =
        documentResult.isDocument && (requiresCode ? hasBarcode : true);
      runOnJS(setObject)({
        isDetected,
        feedback: isDetected
          ? 'Hold still...'
          : 'Position the document in view',
        data: {
          barcodes: barcodeResult.barcodes,
        },
      });
      detector.value = isDetected;
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

export default DriversLicense;

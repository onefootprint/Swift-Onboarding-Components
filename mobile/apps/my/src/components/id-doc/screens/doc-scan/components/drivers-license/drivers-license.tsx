import { UploadDocumentSide } from '@onefootprint/types';
import React, { useContext, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';
import { detectBarcodes, detectDocument } from '@/utils/vision-camera';

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
  const setObjectJs = Worklets.createRunInJsFn(setObject);
  const setDetectorJs = Worklets.createRunInJsFn((value: boolean) => {
    detector.value = value;
  });

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';

    const documentResult = detectDocument(frame);
    const barcodeResult = requiresCode
      ? detectBarcodes(frame)
      : DEFAULT_BARCODE_RESULT;

    const hasBarcode = barcodeResult.barcodes.length > 0;
    const isDetected =
      documentResult.isDocument && (requiresCode ? hasBarcode : true);

    setObjectJs({
      isDetected,
      feedback: isDetected ? '' : 'Position the document in view',
      data: {
        barcodes: barcodeResult.barcodes,
      },
    });

    setDetectorJs(isDetected);
  }, []);

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

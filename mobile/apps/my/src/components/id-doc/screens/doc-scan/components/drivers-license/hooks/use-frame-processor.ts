import type { CountryRecord } from '@onefootprint/global-constants';
import { UploadDocumentSide } from '@onefootprint/types';
import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import {
  runAtTargetFps,
  useFrameProcessor as useVCFrameProcessor,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';

import { detectBarcodes, detectDocument } from '@/utils/vision-camera';

import type { Detection } from '../../../doc-scan.types';

const DEFAULT_BARCODE_RESULT = { barcodes: [] };

const useFrameProcessor = (
  side: UploadDocumentSide,
  country: CountryRecord,
) => {
  const detector = useSharedValue(false);
  const [object, setObject] = useState<Detection>({
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

  const frameProcessor = useVCFrameProcessor(frame => {
    'worklet';

    runAtTargetFps(30, () => {
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
        feedback: isDetected
          ? ''
          : `Scan the ${side.toUpperCase()} of your driver's license`,
        data: {
          barcodes: barcodeResult.barcodes,
        },
      });

      setDetectorJs(isDetected);
    });
  }, []);

  return { object, detector, frameProcessor };
};

export default useFrameProcessor;

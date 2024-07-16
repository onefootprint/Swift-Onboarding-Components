import type { CountryRecord } from '@onefootprint/global-constants';
import { UploadDocumentSide } from '@onefootprint/types';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import type { Document } from '../../doc-scan.types';
import Camera from '../camera';
import Countdown from '../countdown';
import Frame from '../frame';
import useFrameProcessor from './hooks/use-frame-processor';

export type DriversLicenseProps = {
  country: CountryRecord;
  onBack?: () => void;
  onSubmit?: (doc: Document) => void;
  side: UploadDocumentSide;
};

const DEFAULT_ASPECT_RATIO = 1.586;

const DriversLicense = ({ country, onBack, onSubmit, side }: DriversLicenseProps) => {
  const { t } = useTranslation('scan.drivers-license');
  const { object, detector, frameProcessor, disableDetection } = useFrameProcessor(side, country);
  const hasBackButton = side === UploadDocumentSide.Front;

  return (
    <Camera
      frameProcessor={frameProcessor}
      object={object}
      onBack={hasBackButton ? onBack : undefined}
      onSubmit={onSubmit}
      title={t(`title-${side}`)}
      onCapture={disableDetection}
    >
      {value => (
        <Frame aspectRatio={DEFAULT_ASPECT_RATIO} detector={detector}>
          {value && <Countdown value={value} />}
        </Frame>
      )}
    </Camera>
  );
};

export default DriversLicense;

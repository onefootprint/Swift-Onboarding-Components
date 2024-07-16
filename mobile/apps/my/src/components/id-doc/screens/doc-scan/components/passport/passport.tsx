import React from 'react';

import useTranslation from '@/hooks/use-translation';

import type { Document } from '../../doc-scan.types';
import Camera from '../camera';
import Countdown from '../countdown';
import Frame from '../frame';
import useFrameProcessor from './hooks/use-frame-processor';

const DEFAULT_ASPECT_RATIO = 1.42;

export type PassportProps = {
  onBack?: () => void;
  onSubmit?: (doc: Document) => void;
};

const Passport = ({ onBack, onSubmit }: PassportProps) => {
  const { t } = useTranslation('scan.passport');
  const { object, detector, frameProcessor, disableDetection } = useFrameProcessor();

  return (
    <Camera
      frameProcessor={frameProcessor}
      object={object}
      onBack={onBack}
      onSubmit={onSubmit}
      title={t('title')}
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

export default Passport;

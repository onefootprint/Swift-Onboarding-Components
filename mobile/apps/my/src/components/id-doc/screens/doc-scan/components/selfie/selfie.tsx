import React from 'react';

import useTranslation from '@/hooks/use-translation';

import type { Document } from '../../doc-scan.types';
import Camera from '../camera';
import Countdown from '../countdown';
import Frame from '../frame';
import useFrameProcessor from './hooks/use-frame-processor';

export type SelfieProps = {
  onSubmit?: (doc: Document) => void;
};

const Selfie = ({ onSubmit }: SelfieProps) => {
  const { t } = useTranslation('scan.selfie');
  const { object, detector, frameProcessor, disableDetection } = useFrameProcessor();

  return (
    <Camera
      frameProcessor={frameProcessor}
      object={object}
      onSubmit={onSubmit}
      title={t('title')}
      type="front"
      onCapture={disableDetection}
    >
      {value => (
        <Frame aspectRatio={0.9} detector={detector}>
          {value && <Countdown value={value} />}
        </Frame>
      )}
    </Camera>
  );
};

export default Selfie;

import type { SupportedIdDocTypes } from '@onefootprint/types';
import { UploadDocumentSide } from '@onefootprint/types';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import type { Document } from '../../doc-scan.types';
import Camera from '../camera';
import Countdown from '../countdown';
import Frame from '../frame';
import useFrameProcessor from './hooks/use-frame-processor';

const DEFAULT_ASPECT_RATIO = 1.586;

export type DefaultDocumentProps = {
  onBack?: () => void;
  onSubmit?: (doc: Document) => void;
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
};

const DefaultDocument = ({
  onBack,
  onSubmit,
  side,
  type,
}: DefaultDocumentProps) => {
  const { t } = useTranslation(`scan.${kebabCase(type)}`);
  const { object, detector, frameProcessor } = useFrameProcessor();
  const hasBackButton = side === UploadDocumentSide.Front;

  return (
    <Camera
      frameProcessor={frameProcessor}
      object={object}
      onBack={hasBackButton ? onBack : undefined}
      onSubmit={onSubmit}
      title={t(`title-${side}`)}
    >
      {value => (
        <Frame
          aspectRatio={DEFAULT_ASPECT_RATIO}
          description={t('instructions.description')}
          detector={detector}
          title={t(`instructions.title-${side}`)}
        >
          {value && <Countdown value={value} />}
        </Frame>
      )}
    </Camera>
  );
};

export default DefaultDocument;

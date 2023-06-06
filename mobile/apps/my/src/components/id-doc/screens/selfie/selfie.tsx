import { IcoEmojiHappy24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../components/camera';
import Frame from './components/frame';

export type SelfieProps = {
  onSubmit: () => void;
};

const Selfie = ({ onSubmit }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');

  return (
    <Camera
      Frame={Frame}
      instructions={{
        IconComponent: IcoEmojiHappy24,
        title: t('instructions.title'),
      }}
      onSubmit={onSubmit}
      title={t('title')}
      type="front"
    />
  );
};

export default Selfie;

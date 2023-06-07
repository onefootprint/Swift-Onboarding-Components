import { IcoEmojiHappy24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from './components/frame';

export type SelfieProps = {
  loading: boolean;
  onSubmit: (image: string) => void;
};

const Selfie = ({ loading, onSubmit }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');

  return (
    <Camera
      Frame={Frame}
      instructions={{
        IconComponent: IcoEmojiHappy24,
        title: t('instructions.title'),
      }}
      loading={loading}
      onSubmit={onSubmit}
      title={t('title')}
      type="front"
    />
  );
};

export default Selfie;

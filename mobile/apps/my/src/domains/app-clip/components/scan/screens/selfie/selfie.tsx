import { IcoEmojiHappy24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera, { CameraKind } from '../../components/camera';

export type SelfieProps = {
  onSubmit: () => void;
};

const Selfie = ({ onSubmit }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');

  return (
    <Camera
      instructions={{
        IconComponent: IcoEmojiHappy24,
        title: t('instructions.title'),
      }}
      kind={CameraKind.Passport}
      onSubmit={onSubmit}
      title={t('title')}
    />
  );
};

export default Selfie;

import { IcoPassport24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera, { CameraKind } from '../../components/camera';

export type PassportProps = {
  onSubmit: () => void;
};

const Passport = ({ onSubmit }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');

  return (
    <Camera
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoPassport24,
        title: t('instructions.title'),
      }}
      kind={CameraKind.Passport}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
    />
  );
};

export default Passport;

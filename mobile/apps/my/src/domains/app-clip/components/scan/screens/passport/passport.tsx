import { IcoPassport24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../components/camera';
import Frame from './components/frame';

export type PassportProps = {
  onSubmit: () => void;
};

const Passport = ({ onSubmit }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');

  return (
    <Camera
      Frame={Frame}
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoPassport24,
        title: t('instructions.title'),
      }}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
      type="back"
    />
  );
};

export default Passport;

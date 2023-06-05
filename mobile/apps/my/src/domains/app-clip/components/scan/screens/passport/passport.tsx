import { IcoPassport24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../components/camera';

export type PassportProps = {
  onSubmit: () => void;
};

const Passport = ({ onSubmit }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');

  return (
    <Camera
      type="back"
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoPassport24,
        title: t('instructions.title'),
      }}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
    />
  );
};

export default Passport;

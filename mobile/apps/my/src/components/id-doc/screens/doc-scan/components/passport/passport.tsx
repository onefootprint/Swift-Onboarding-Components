import { IcoPassport24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from './components/frame';

export type PassportProps = {
  loading?: boolean;
  onSubmit: (image: string) => void;
};

const Passport = ({ loading, onSubmit }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');

  return (
    <Camera
      Frame={Frame}
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoPassport24,
        title: t('instructions.title'),
      }}
      loading={loading}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
    />
  );
};

export default Passport;

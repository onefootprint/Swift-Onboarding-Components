import { IcoIdCard24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../components/camera';
import Frame from './components/frame';

export type DriversLicenseProps = {
  onSubmit: () => void;
};

const DriversLicense = ({ onSubmit }: DriversLicenseProps) => {
  const { t } = useTranslation('components.scan.drivers-license');

  return (
    <Camera
      Frame={Frame}
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoIdCard24,
        title: t('instructions.title'),
      }}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
      type="back"
    />
  );
};

export default DriversLicense;

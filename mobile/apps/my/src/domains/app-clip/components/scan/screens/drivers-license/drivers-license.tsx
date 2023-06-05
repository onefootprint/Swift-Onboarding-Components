import { IcoIdCard24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../components/camera';

export type DriversLicenseProps = {
  onSubmit: () => void;
};

const DriversLicense = ({ onSubmit }: DriversLicenseProps) => {
  const { t } = useTranslation('components.scan.drivers-license');

  return (
    <Camera
      type="back"
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoIdCard24,
        title: t('instructions.title'),
      }}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
    />
  );
};

export default DriversLicense;

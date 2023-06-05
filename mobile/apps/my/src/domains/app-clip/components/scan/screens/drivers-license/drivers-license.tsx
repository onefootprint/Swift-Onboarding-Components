import { IcoIdCard24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera, { CameraKind } from '../../components/camera';

export type DriversLicenseProps = {
  onSubmit: () => void;
};

const DriversLicense = ({ onSubmit }: DriversLicenseProps) => {
  const { t } = useTranslation('components.scan.drivers-license');

  return (
    <Camera
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoIdCard24,
        title: t('instructions.title'),
      }}
      kind={CameraKind.DriversLicense}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      title={t('title')}
    />
  );
};

export default DriversLicense;

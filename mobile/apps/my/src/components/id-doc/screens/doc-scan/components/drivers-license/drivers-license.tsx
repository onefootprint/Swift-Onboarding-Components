import { IcoIdCard24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../../../components/camera';
import { DocSide } from '../../../../id-doc.types';
import Frame from '../default-frame';

export type DriversLicenseProps = {
  onSubmit: (image: string) => void;
  side: DocSide;
};

const DriversLicense = ({ onSubmit, side }: DriversLicenseProps) => {
  const { t } = useTranslation('components.scan.drivers-license');
  const { t: sideT } = useTranslation(
    `components.scan.drivers-license.${side}`,
  );

  return (
    <Camera
      Frame={Frame}
      instructions={{
        description: sideT('instructions.description'),
        IconComponent: IcoIdCard24,
        title: sideT('instructions.title'),
      }}
      onSubmit={onSubmit}
      subtitle={sideT('subtitle')}
      title={t('title')}
    />
  );
};

export default DriversLicense;

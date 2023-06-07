import { IcoIdCard24 } from '@onefootprint/icons';
import { SubmitDocumentSide } from '@onefootprint/types';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from '../default-frame';

export type DriversLicenseProps = {
  loading?: boolean;
  onSubmit: (image: string) => void;
  side: SubmitDocumentSide;
  success?: boolean;
};

const DriversLicense = ({
  loading,
  onSubmit,
  side,
  success,
}: DriversLicenseProps) => {
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
      loading={loading}
      onSubmit={onSubmit}
      subtitle={sideT('subtitle')}
      success={success}
      title={t('title')}
    />
  );
};

export default DriversLicense;

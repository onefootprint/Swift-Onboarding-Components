import { IcoIdCard24 } from '@onefootprint/icons';
import { SubmitDocumentSide } from '@onefootprint/types';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from '../default-frame';

export type IdCardProps = {
  loading?: boolean;
  onSubmit: (image: string) => void;
  side: SubmitDocumentSide;
};

const IdCard = ({ loading, onSubmit, side }: IdCardProps) => {
  const { t } = useTranslation('components.scan.id-card');
  const { t: sideT } = useTranslation(`components.scan.id-card.${side}`);

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
      title={t('title')}
      type="back"
    />
  );
};

export default IdCard;

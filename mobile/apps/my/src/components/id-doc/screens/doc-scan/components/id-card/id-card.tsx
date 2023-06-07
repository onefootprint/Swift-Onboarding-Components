import { IcoIdCard24 } from '@onefootprint/icons';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../../../../components/camera';
import { DocSide } from '../../../../id-doc.types';
import Frame from '../default-frame';

export type IdCardProps = {
  onSubmit: (image: string) => void;
  side: DocSide;
};

const IdCard = ({ onSubmit, side }: IdCardProps) => {
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
      onSubmit={onSubmit}
      subtitle={sideT('subtitle')}
      title={t('title')}
      type="back"
    />
  );
};

export default IdCard;

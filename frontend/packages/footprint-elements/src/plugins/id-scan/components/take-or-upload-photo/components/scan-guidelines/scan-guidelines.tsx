import { useTranslation } from '@onefootprint/hooks';
import {
  IcoSmartphone24,
  IcoSquareFrame24,
  IcoSun24,
} from '@onefootprint/icons';
import React from 'react';

import InfoBox from '../../../../../../components/info-box';

const ScanGuidelines = () => {
  const { t } = useTranslation('components.scan-guidelines');
  return (
    <InfoBox
      items={[
        {
          title: t('check-lighting.title'),
          description: t('check-lighting.description'),
          Icon: IcoSun24,
        },
        {
          title: t('device-steady.title'),
          description: t('device-steady.description'),
          Icon: IcoSmartphone24,
        },
        {
          title: t('whole-document.title'),
          description: t('whole-document.description'),
          Icon: IcoSquareFrame24,
        },
      ]}
    />
  );
};

export default ScanGuidelines;

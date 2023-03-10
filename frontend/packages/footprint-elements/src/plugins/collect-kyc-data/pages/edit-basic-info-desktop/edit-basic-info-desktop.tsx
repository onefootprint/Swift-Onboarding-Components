import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../../../components/edit-data-container-desktop';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import BasicInformation from '../basic-information';

const EditBasicInfoDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <EditDataContainerDesktop
      onClickPrev={handlePrev}
      title={t('edit-sheet.title', {
        name: t('basic-info.title').toLowerCase(),
      })}
    >
      <BasicInformation
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditBasicInfoDesktop;

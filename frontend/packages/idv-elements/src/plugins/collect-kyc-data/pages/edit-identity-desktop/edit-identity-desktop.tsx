import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../../../components/edit-data-container-desktop';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import SSN from '../ssn';

const EditIdentityDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <EditDataContainerDesktop
      onClickPrev={handlePrev}
      title={t('edit-sheet.title', { name: t('identity.title').toLowerCase() })}
    >
      <SSN
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideDisclaimer
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditIdentityDesktop;

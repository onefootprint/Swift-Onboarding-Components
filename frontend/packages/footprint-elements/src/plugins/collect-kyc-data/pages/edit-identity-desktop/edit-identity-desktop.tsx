import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../components/edit-data-container-desktop/edit-data-container-desktop';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import SSN from '../ssn';

const EditIdentityDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: Events.returnToSummary });
  };

  return (
    <EditDataContainerDesktop name={t('identity.title').toLowerCase()}>
      <SSN
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideDisclaimer
        hideTitle
        hideNavHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditIdentityDesktop;

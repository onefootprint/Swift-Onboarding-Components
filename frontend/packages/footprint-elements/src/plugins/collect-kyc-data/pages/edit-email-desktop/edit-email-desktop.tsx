import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../components/edit-data-container-desktop';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import Email from '../email';

const EditEmailDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: Events.returnToSummary });
  };

  return (
    <EditDataContainerDesktop name={t('email.title').toLowerCase()}>
      <Email
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditEmailDesktop;

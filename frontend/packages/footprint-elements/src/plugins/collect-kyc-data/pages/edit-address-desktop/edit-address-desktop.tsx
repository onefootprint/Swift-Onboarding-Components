import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../components/edit-data-container-desktop/edit-data-container-desktop';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import ResidentialAddress from '../residential-address';

const EditAddressDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: Events.returnToSummary });
  };

  return (
    <EditDataContainerDesktop name={t('address.title').toLowerCase()}>
      <ResidentialAddress
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditAddressDesktop;

import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../../../components/edit-data-container-desktop';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BusinessAddress from '../business-address';

const EditBusinessAddressDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKybDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <EditDataContainerDesktop
      onClickPrev={handlePrev}
      title={t('edit-sheet.title', {
        name: t('business-address.title').toLowerCase(),
      })}
    >
      <BusinessAddress
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditBusinessAddressDesktop;

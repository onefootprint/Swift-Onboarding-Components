import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../../../components/edit-data-container-desktop';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BeneficialOwners from '../beneficial-owners';

const EditBeneficialOwnersDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKybDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <EditDataContainerDesktop
      onClickPrev={handlePrev}
      title={t('edit-sheet.title', {
        name: t('beneficial-owners.title').toLowerCase(),
      })}
    >
      <BeneficialOwners
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditBeneficialOwnersDesktop;

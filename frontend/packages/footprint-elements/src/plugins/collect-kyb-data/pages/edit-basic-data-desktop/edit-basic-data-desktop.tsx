import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import EditDataContainerDesktop from '../../../../components/edit-data-container-desktop';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import BasicData from '../basic-data';

const EditBasicDataDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKybDataMachine();

  const handlePrev = () => {
    send({ type: 'returnToSummary' });
  };

  return (
    <EditDataContainerDesktop
      onClickPrev={handlePrev}
      title={t('edit-sheet.title', {
        name: t('basic-data.title').toLowerCase(),
      })}
    >
      <BasicData
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideHeader
      />
    </EditDataContainerDesktop>
  );
};

export default EditBasicDataDesktop;

import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import BasicInformation from '../basic-information';

const EditBasicInfoDesktop = () => {
  const { t } = useTranslation('pages.confirm');
  const [, send] = useCollectKycDataMachine();

  const handlePrev = () => {
    send({ type: Events.returnToSummary });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'back', onClick: handlePrev }}>
        <Typography variant="label-2">
          {t('edit-sheet.title', { name: t('basic-info.title').toLowerCase() })}
        </Typography>
      </NavigationHeader>
      <BasicInformation
        ctaLabel={t('edit-sheet.save')}
        onComplete={handlePrev}
        hideTitle
        hideNavHeader
      />
    </>
  );
};

export default EditBasicInfoDesktop;

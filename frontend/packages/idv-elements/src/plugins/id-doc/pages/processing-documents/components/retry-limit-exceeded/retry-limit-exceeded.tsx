import { useTranslation } from '@onefootprint/hooks';
import { IcoClose40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import useIdDocMachine from '../../../../hooks/use-id-doc-machine';
import TRANSITION_DELAY from '../../transition-delay.constants';

const RetryLimitExceeded = () => {
  const { t } = useTranslation('pages.processing-documents');
  const [, send] = useIdDocMachine();

  useTimeout(() => {
    send({
      type: 'retryLimitExceeded',
    });
  }, TRANSITION_DELAY);

  return (
    <>
      <IcoClose40 color="error" />
      <Typography variant="label-3" color="error" sx={{ textAlign: 'center' }}>
        {t('error')}
      </Typography>
    </>
  );
};

export default RetryLimitExceeded;

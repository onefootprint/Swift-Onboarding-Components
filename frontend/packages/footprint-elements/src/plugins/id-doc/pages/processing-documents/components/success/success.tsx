import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import useIdDocMachine, { Events } from '../../../../hooks/use-id-doc-machine';
import TRANSITION_DELAY from '../../transition-delay.constants';

const Success = () => {
  const { t } = useTranslation('pages.processing-documents');
  const [, send] = useIdDocMachine();

  useTimeout(() => {
    send({
      type: Events.succeeded,
    });
  }, TRANSITION_DELAY);

  return (
    <>
      <IcoCheckCircle40 color="success" />
      <Typography
        variant="label-3"
        color="success"
        sx={{ textAlign: 'center' }}
      >
        {t('success')}
      </Typography>
    </>
  );
};

export default Success;

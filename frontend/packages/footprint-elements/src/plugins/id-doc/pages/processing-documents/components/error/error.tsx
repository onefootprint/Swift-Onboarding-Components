import { useTranslation } from '@onefootprint/hooks';
import { IcoClose40 } from '@onefootprint/icons';
import { IdDocBadImageError } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import useIdDocMachine, { Events } from '../../../../hooks/use-id-doc-machine';
import TRANSITION_DELAY from '../../transition-delay.constants';

type ErrorProps = {
  errors?: IdDocBadImageError[];
};

const Error = ({ errors }: ErrorProps) => {
  const { t } = useTranslation('pages.processing-documents');
  const [, send] = useIdDocMachine();

  useTimeout(() => {
    send({
      type: Events.errored,
      payload: {
        errors: errors ?? [],
      },
    });
  }, TRANSITION_DELAY);

  return (
    <>
      <IcoClose40 color="error" />
      <Typography variant="label-3" color="error">
        {t('error')}
      </Typography>
    </>
  );
};

export default Error;

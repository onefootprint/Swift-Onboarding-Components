import { useTranslation } from '@onefootprint/hooks';
import { IcoRepeat40, IcoWarning16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import FeedbackIcon from '../../../../components/feedback-icon';
import { useIdDocMachine } from '../../../../components/machine-provider';
import TRANSITION_DELAY from '../../../../constants/transition-delay.constants';

const RetryLimitExceeded = () => {
  const { t } = useTranslation('pages.retry-limit-exceeded');

  const [, send] = useIdDocMachine();

  useTimeout(() => {
    send({
      type: 'retryLimitExceeded',
    });
  }, TRANSITION_DELAY);

  return (
    <Container>
      <NavigationHeader />
      <FeedbackIcon
        imageIcon={{ component: IcoRepeat40 }}
        statusIndicator={{
          component: <IcoWarning16 color="error" />,
          status: 'error',
        }}
      />
      <ErrorMessage>
        <Typography
          variant="label-1"
          color="error"
          sx={{ textAlign: 'center' }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="body-2"
          color="secondary"
          sx={{
            textAlign: 'center',
          }}
        >
          {t('description')}
        </Typography>
      </ErrorMessage>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
  `}
`;

const ErrorMessage = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default RetryLimitExceeded;

import { IcoRepeat40, IcoWarning16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { TRANSITION_DELAY_LONG } from '../../constants/transition-delay.constants';
import FadeInContainer from '../fade-in-container';
import FeedbackIcon from '../feedback-icon';

type RetryLimitExceededProps = {
  onRetryLimitExceeded: () => void;
};

const RetryLimitExceeded = ({ onRetryLimitExceeded }: RetryLimitExceededProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.retry-limit-exceeded',
  });

  useTimeout(() => {
    onRetryLimitExceeded();
  }, TRANSITION_DELAY_LONG);

  return (
    <FadeInContainer>
      <ErrorContainer>
        <NavigationHeader />
        <FeedbackIcon
          imageIcon={{ component: IcoRepeat40 }}
          statusIndicator={{
            component: <IcoWarning16 color="error" />,
            status: 'error',
          }}
        />
        <ErrorMessage>
          <Text variant="label-1" color="error" textAlign="center">
            {t('title')}
          </Text>
          <Text variant="body-2" color="secondary" textAlign="center">
            {t('description')}
          </Text>
        </ErrorMessage>
      </ErrorContainer>
    </FadeInContainer>
  );
};

const ErrorContainer = styled.div`
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

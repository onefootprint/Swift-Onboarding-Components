import { IcoRepeat40, IcoWarning16 } from '@onefootprint/icons';
import { Box, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'usehooks-ts';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { TRANSITION_DELAY_LONG } from '../../constants';
import FadeInContainer from '../fade-in-container';
import FeedbackIcon from '../feedback-icon';

type RetryLimitExceededProps = {
  onRetryLimitExceeded: () => void;
};

const RetryLimitExceeded = ({ onRetryLimitExceeded }: RetryLimitExceededProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow.components.retry-limit-exceeded' });

  useTimeout(() => {
    onRetryLimitExceeded();
  }, TRANSITION_DELAY_LONG);

  return (
    <FadeInContainer>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={5}>
        <NavigationHeader />
        <FeedbackIcon
          imageIcon={{ component: IcoRepeat40 }}
          statusIndicator={{
            component: <IcoWarning16 color="error" />,
            status: 'error',
          }}
        />
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={3}>
          <Text variant="label-1" color="error" textAlign="center">
            {t('title')}
          </Text>
          <Text variant="body-2" color="secondary" textAlign="center">
            {t('description')}
          </Text>
        </Box>
      </Box>
    </FadeInContainer>
  );
};

export default RetryLimitExceeded;

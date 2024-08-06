import { Box, SuccessCheck, Text } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { TRANSITION_DELAY_DEFAULT } from '../../constants';

type SuccessProps = {
  onComplete?: () => void;
};

const Success = ({ onComplete }: SuccessProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.success',
  });

  useEffect(() => {
    // This conditional should satisfy only when we are done with the flow
    if (onComplete) {
      setTimeout(onComplete, TRANSITION_DELAY_DEFAULT);
    }
  }, [onComplete]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <SuccessCheck animationStart />
      <Text variant="label-1" textAlign="center" marginTop={5} color="success">
        {t('title')}
      </Text>
    </Box>
  );
};

export default Success;

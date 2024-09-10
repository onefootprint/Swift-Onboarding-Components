import { Box, LoadingSpinner, SuccessCheck } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

const Validating = () => {
  const { t } = useTranslation('common');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timeoutRef = window.setTimeout(() => {
      setShowSuccess(true);
    }, 1000);

    return () => window.clearTimeout(timeoutRef);
  }, []);

  return (
    <Notification title={t('validating-your-information')} subtitle={t('only-few-seconds')}>
      <Box display="flex" flexDirection="column" alignItems="center" paddingTop={7}>
        {showSuccess ? <SuccessCheck animationStart size={32} /> : <LoadingSpinner />}
      </Box>
    </Notification>
  );
};

export default Validating;

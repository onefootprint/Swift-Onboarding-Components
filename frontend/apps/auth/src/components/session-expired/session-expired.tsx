import { Box, Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const handleClick = () => {
  window.close();
};

const SessionExpired = () => {
  const { t } = useTranslation('common');

  return (
    <Notification variant="error" title={t('session-expired')} subtitle={t('session-expired-reason')}>
      <Box paddingTop={7}>
        <Button onClick={handleClick} fullWidth>
          {t('close')}
        </Button>
      </Box>
    </Notification>
  );
};

export default SessionExpired;

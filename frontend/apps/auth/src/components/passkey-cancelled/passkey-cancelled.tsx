import { Box, Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Notification from '../notification';

const PasskeyCancelled = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useTranslation('common');
  const showButton = typeof onClick === 'function';
  const subtitle = showButton ? undefined : t('try-again-later');

  return (
    <Notification variant="error" title={t('passkey-registration-cancelled')} subtitle={subtitle}>
      {showButton ? (
        <Box paddingTop={7}>
          <Button onClick={onClick} fullWidth>
            {t('do-later')}
          </Button>
        </Box>
      ) : null}
    </Notification>
  );
};

export default PasskeyCancelled;

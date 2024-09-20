import { Stack, SuccessCheck } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';

const Success = () => {
  const { t } = useTranslation('common');

  return (
    <Notification title={t('success')} subtitle={t('you-can-close-this-window')}>
      <Stack flexDirection="column" alignItems="center" paddingTop={7}>
        <SuccessCheck animationStart size={32} />
      </Stack>
    </Notification>
  );
};

export default Success;

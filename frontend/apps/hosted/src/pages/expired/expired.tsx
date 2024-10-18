import { HeaderTitle } from '@onefootprint/idv';
import { HostedUrlType } from '@onefootprint/types';
import { Button, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';

const Expired = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.expired' });
  const [state, send] = useHostedMachine();
  const { urlType } = state.context;

  const handleClick = () => {
    send({ type: 'reset' });
  };

  return (
    <Stack flexDirection="column" justifyContent="center" alignItems="center" rowGap={7} paddingTop={8}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {urlType === HostedUrlType.onboardingConfigPublicKey && (
        <Button fullWidth onClick={handleClick}>
          {t('cta')}
        </Button>
      )}
    </Stack>
  );
};

export default Expired;

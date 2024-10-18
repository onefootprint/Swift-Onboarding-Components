import { Button, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Header from './components/header';

const Intro = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro' });
  const [, send] = useHostedMachine();

  const handleClick = () => {
    send({ type: 'introductionCompleted' });
  };

  return (
    <Stack flexDirection="column" alignItems="center" justifyContent="center" rowGap={7} paddingTop={8}>
      <Header />
      <Button fullWidth onClick={handleClick} size="large">
        {t('cta')}
      </Button>
    </Stack>
  );
};

export default Intro;

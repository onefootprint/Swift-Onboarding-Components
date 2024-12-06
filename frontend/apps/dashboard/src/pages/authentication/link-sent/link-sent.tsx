import { Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'react-i18next';

import PenguinWinkContainer from '../components/penguin-wink-container';

const LinkSent = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'link-sent' });
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <PenguinWinkContainer>
        <Stack center gap={5} direction="column" align="center">
          <Text variant="label-2">{t('title')}</Text>
          <Text variant="body-2" textAlign="center" color="secondary" maxWidth="350px">
            <Trans
              ns="authentication"
              i18nKey="link-sent.instructions"
              values={{ email: router.query.email }}
              components={{
                b: <Text variant="label-2" tag="span" color="primary" />,
              }}
            />
          </Text>
        </Stack>
      </PenguinWinkContainer>
    </>
  );
};

export default LinkSent;

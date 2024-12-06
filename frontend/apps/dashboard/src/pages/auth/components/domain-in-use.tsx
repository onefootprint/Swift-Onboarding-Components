import { Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import PenguinWinkContainer from '../../authentication/components/penguin-wink-container';

export type ConflictingTenantDomainErrorContext = {
  tenantId: string;
  tenantName: string;
  domain: string;
};

type DomainInUseProps = {
  errorContext: ConflictingTenantDomainErrorContext;
};

const DomainInUse = ({ errorContext }: DomainInUseProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.auth.tenant-domain-conflict' });

  return (
    <>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <PenguinWinkContainer>
        <Stack center gap={5} direction="column" align="center">
          <Text variant="label-2">{t('title')}</Text>
          <Text variant="body-2" textAlign="center" color="secondary" maxWidth="350px">
            {t('description', {
              tenantName: errorContext.tenantName,
              domain: errorContext.domain,
            })}
          </Text>
        </Stack>
      </PenguinWinkContainer>
    </>
  );
};

export default DomainInUse;

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
        <div className="flex flex-col items-center gap-5">
          <div className="text-label-2">{t('title')}</div>
          <div className="text-body-2 text-center text-secondary max-w-[350px]">
            {t('description', {
              tenantName: errorContext.tenantName,
              domain: errorContext.domain,
            })}
          </div>
        </div>
      </PenguinWinkContainer>
    </>
  );
};

export default DomainInUse;

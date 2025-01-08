import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { Divider } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import SectionHeader from 'src/components/section-header';

import Content from './components/content';
import ErrorDisplay from './components/error-display';
import Loading from './components/loading';

const BusinessProfile = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile' });
  const { isPending, data, error } = useQuery(getOrgOptions());

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <section>
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2">{t('meta-title')}</h2>
        </header>
        <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')} />
        <Divider className="mb-8" />
        <div className="flex flex-col justify-center gap-8" aria-busy={isPending} aria-live="polite">
          <>
            {error && <ErrorDisplay message={getErrorMessage(error)} />}
            {isPending && <Loading />}
            {data && <Content organization={data} />}
          </>
        </div>
      </section>
    </>
  );
};

export default BusinessProfile;

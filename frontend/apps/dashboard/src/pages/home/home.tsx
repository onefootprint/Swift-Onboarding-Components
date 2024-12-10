import { getOrgMetricsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Content from './components/content';
import DateFilter from './components/date-filter';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import PlaybooksFilter from './components/playbooks-filter';
import useFilters from './hooks/use-filters';

const Home = () => {
  const { t } = useTranslation('home');
  const filters = useFilters();
  const metricsQuery = useQuery(getOrgMetricsOptions({ query: filters.requestParams }));

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <h2 className="text-heading-2 mb-6">{t('header.title')}</h2>
      <div aria-busy={metricsQuery.isPending}>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-solid border-tertiary">
          <h1 className="text-heading-5">{t('onboarding-metrics.title')}</h1>
          <div className="flex gap-3">
            <DateFilter />
            <PlaybooksFilter />
          </div>
        </div>
        {metricsQuery.isPending ? <Loading /> : null}
        {metricsQuery.error ? <ErrorComponent error={metricsQuery.error} /> : null}
        {metricsQuery.data ? <Content metrics={metricsQuery.data} /> : null}
      </div>
    </>
  );
};

export default Home;

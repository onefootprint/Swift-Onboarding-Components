import { getOrgWebhookPortalOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { cx } from 'class-variance-authority';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useFakeSpinnerTimeout from './hooks/use-fake-spinner-timeout';

const Webhooks = () => {
  const { t } = useTranslation('webhooks');
  const { data, error, isPending } = useQuery(getOrgWebhookPortalOptions());
  const showSpinner = useFakeSpinnerTimeout();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <div aria-busy={isPending}>
        <div className="flex flex-col gap-2 mb-7">
          <h2 className="text-heading-2 text-primary">{t('header.title')}</h2>
          <h3 className="text-body-2 text-secondary">{t('header.subtitle')}</h3>
        </div>
        <div
          className={cx({
            hidden: showSpinner,
            block: !showSpinner,
          })}
        >
          {data && <Content data={data} />}
          {error && <ErrorComponent message={getErrorMessage(error)} />}
          {isPending && <Loading />}
        </div>
        {showSpinner && <Loading />}
      </div>
    </>
  );
};

export default Webhooks;

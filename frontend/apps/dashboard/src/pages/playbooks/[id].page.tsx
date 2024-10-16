import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Details from '../../components/playbook-details';

const PlaybookDetails = () => {
  const { t } = useTranslation('playbook-details');

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <Details />
    </>
  );
};

export default PlaybookDetails;

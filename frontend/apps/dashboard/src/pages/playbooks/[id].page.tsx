import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Details from '../../components/playbook-details';

const PlaybookDetails = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details' });

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

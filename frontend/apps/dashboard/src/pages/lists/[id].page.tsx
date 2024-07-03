import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Details from '../../components/playbook-details';

const ListDetails = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'details' });

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <Details />
    </>
  );
};

export default ListDetails;

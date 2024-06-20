import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDetails } from 'src/components/entities';

const Details = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user' });

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntityDetails kind={EntityKind.person} listPath="/users" />
    </>
  );
};

export default Details;

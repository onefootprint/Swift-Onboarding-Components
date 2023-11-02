import { useTranslation } from '@onefootprint/hooks';
import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { EntityDetails } from 'src/components/entities';

const Details = () => {
  const { t } = useTranslation('pages.user');

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

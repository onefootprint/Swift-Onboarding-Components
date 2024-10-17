import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { EntityDetails } from 'src/components/entities';

const Details = () => {
  const { t } = useTranslation('business-details');

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntityDetails kind={EntityKind.business} listPath="/businesses" />
    </>
  );
};

export default Details;

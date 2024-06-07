import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import NotFound from 'src/components/404';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useDocument from './hooks/use-document';

const Documents = () => {
  const { t } = useTranslation('entity-documents');
  const { meta, isLoading, errorMessage, data } = useDocument();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {meta.notFound ? (
        <NotFound />
      ) : (
        <Box aria-busy={isLoading}>
          {data && <Content documents={data} meta={meta} />}
          {isLoading && <Loading />}
          {errorMessage && <ErrorComponent message={errorMessage} />}
        </Box>
      )}
    </>
  );
};

export default Documents;

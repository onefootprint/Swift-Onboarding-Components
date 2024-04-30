import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import NotFound from 'src/components/404';

import type { WithEntityProps } from '@/entity/components/with-entity';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useDocument from './hooks/use-document';

type DocumentsProps = WithEntityProps;

const Documents = ({ entity }: DocumentsProps) => {
  const { meta, isLoading, errorMessage, data } = useDocument(entity);
  const { t } = useTranslation('entity-documents');

  if (meta.notFound) {
    return <NotFound />;
  }

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {data && <Content doc={data} meta={meta} />}
      {isLoading && <Loading />}
      {errorMessage && <Error message={errorMessage} />}
    </>
  );
};

export default Documents;

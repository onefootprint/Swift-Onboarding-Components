import React from 'react';
import NotFound from 'src/components/404';

import type { WithEntityProps } from '@/entity/components/with-entity';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useDocument from './hooks/use-document';

type DocumentsProps = WithEntityProps;

const Documents = ({ entity }: DocumentsProps) => {
  const { meta, isLoading, errorMessage, data } = useDocument(entity);

  if (meta.notFound) {
    return <NotFound />;
  }

  return (
    <>
      {data && <Content doc={data} meta={meta} />}
      {isLoading && <Loading />}
      {errorMessage && <Error message={errorMessage} />}
    </>
  );
};

export default Documents;

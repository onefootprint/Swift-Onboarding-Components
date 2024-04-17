import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useDocument from './hooks/use-document';

const Documents = () => {
  const { data, error, isLoading } = useDocument();

  return (
    <>
      {data && <Content document={data} />}
      {isLoading && <Loading />}
      {error && <Error message="Lorem" />}
    </>
  );
};

export default Documents;

import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import usePlaybook from './hooks/use-playbook';

const PlaybookDetails = () => {
  const { data, isLoading, errorMessage } = usePlaybook();

  return (
    <>
      {data && <Content playbook={data} />}
      {isLoading && <Loading />}
      {errorMessage && <Error message={errorMessage} />}
    </>
  );
};

export default PlaybookDetails;

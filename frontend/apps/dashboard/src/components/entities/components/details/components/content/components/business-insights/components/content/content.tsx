import useCurrentEntityBusinessInsights from '@/entity/hooks/use-current-entity-business-insights';
import React from 'react';
import { ErrorComponent } from 'src/components';
import DecryptedContent from '../decrypted-content';

const Content = () => {
  const { data, error } = useCurrentEntityBusinessInsights();

  return (
    <>
      {error && <ErrorComponent error={error} />}
      {data && <DecryptedContent insights={data} />}
    </>
  );
};

export default Content;

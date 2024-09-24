import useCurrentEntityBusinessInsights from '@/entity/hooks/use-current-entity-business-insights';
import { ErrorComponent } from 'src/components';
import DecryptedContent from '../decrypted-content';
import Loading from '../loading';

const Content = () => {
  const { error, isPending, data } = useCurrentEntityBusinessInsights();

  return (
    <>
      {error && <ErrorComponent error={error} />}
      {isPending && <Loading />}
      {data && <DecryptedContent insights={data} />}
    </>
  );
};

export default Content;

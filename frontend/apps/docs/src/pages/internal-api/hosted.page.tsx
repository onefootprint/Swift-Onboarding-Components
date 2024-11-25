import PrivateGate from '../../components/private-gate';
import hostedApiData from '../api-reference/assets/hosted-api-docs.json';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import InternalApiDocsPage from './components/internal-api-docs-page';

const ApiReference = () => {
  const hostedArticles = useHydrateArticles(hostedApiData);

  return (
    <PrivateGate firmEmployeesOnly>
      <InternalApiDocsPage apis={hostedArticles} />
    </PrivateGate>
  );
};

export default ApiReference;

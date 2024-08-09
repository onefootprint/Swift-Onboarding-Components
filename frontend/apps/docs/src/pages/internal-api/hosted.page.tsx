import hostedApiData from '../api-reference/assets/hosted-api-docs.json';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import getArticles from '../api-reference/utils/get-articles';
import InternalApiDocsPage from './components/internal-api-docs-page';

const staticHostedArticles = getArticles(hostedApiData);

const ApiReference = () => {
  const hostedArticles = useHydrateArticles(staticHostedArticles);
  return <InternalApiDocsPage title="Hosted APIs" apis={hostedArticles} />;
};

export default ApiReference;

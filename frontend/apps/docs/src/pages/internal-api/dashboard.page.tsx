import dashboardApiData from '../api-reference/assets/dashboard-api-docs.json';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import InternalApiDocsPage from './components/internal-api-docs-page';

const ApiReference = () => {
  const DashboardArticles = useHydrateArticles(dashboardApiData);
  return <InternalApiDocsPage apis={DashboardArticles} />;
};

export default ApiReference;

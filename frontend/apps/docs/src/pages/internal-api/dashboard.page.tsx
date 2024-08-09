import dashboardApiData from '../api-reference/assets/dashboard-api-docs.json';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import getArticles from '../api-reference/utils/get-articles';
import InternalApiDocsPage from './components/internal-api-docs-page';

const staticDashboardArticles = getArticles(dashboardApiData);

const ApiReference = () => {
  const DashboardArticles = useHydrateArticles(staticDashboardArticles);
  return <InternalApiDocsPage title="Dashboard APIs" apis={DashboardArticles} />;
};

export default ApiReference;

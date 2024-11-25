import PrivateGate from '../../components/private-gate';
import dashboardApiData from '../api-reference/assets/dashboard-api-docs.json';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import InternalApiDocsPage from './components/internal-api-docs-page';

const ApiReference = () => {
  const DashboardArticles = useHydrateArticles(dashboardApiData);

  return (
    <PrivateGate firmEmployeesOnly>
      <InternalApiDocsPage apis={DashboardArticles} />
    </PrivateGate>
  );
};

export default ApiReference;

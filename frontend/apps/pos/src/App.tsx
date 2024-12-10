import { getHostedOnboardingConfigOptions } from '@onefootprint/axios';
import { useQuery } from '@tanstack/react-query';

import Router from './pages/router';

const App = () => {
  const { data, isPending } = useQuery(getHostedOnboardingConfigOptions());
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (data) {
    return <Router onboardingConfig={data} />;
  }
  return null;
};

export default App;

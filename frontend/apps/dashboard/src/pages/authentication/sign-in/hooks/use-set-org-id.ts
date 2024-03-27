import { useEffect } from 'react';
import useFilters from 'src/hooks/use-filters';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';

type LoginFilters = {
  orgId?: string;
};

const useSetOrgId = () => {
  const { query, isReady } = useFilters<LoginFilters>({});
  const { setOrgId, data } = useLoggedOutStorage();
  useEffect(() => {
    if (!isReady || data.orgId === query.orgId) {
      return;
    }
    setOrgId(query.orgId);
    // Save the orgId from the querystring into local storage
  }, [isReady, query, setOrgId, data]);
};

export default useSetOrgId;

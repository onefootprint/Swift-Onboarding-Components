import { useEffect } from 'react';
import useFilters from 'src/hooks/use-filters';
import useLoggedOutStorage from 'src/hooks/use-logged-out-storage';

type LoginFilters = {
  orgId?: string;
  redirectUrl?: string;
};

/**
 * Sometimes we are sent to the login page with arguments that specify what to do after login is complete,
 * like redirecting to the last visited page.
 * Since the login flow requires redirecting and we'll lose the querystring, let's capture the querystring
 * arguments and save them into local storage for when login is complete.
 * */
const useCaptureQueryParams = () => {
  const { query, isReady } = useFilters<LoginFilters>({});
  const { update } = useLoggedOutStorage();

  useEffect(() => {
    if (!isReady) {
      return;
    }
    // Save the orgId and redirectUrl from the querystring into local storage
    update({
      orgId: query.orgId,
      redirectUrl: query.redirectUrl,
    });
  }, [isReady, query, update]);
};

export default useCaptureQueryParams;

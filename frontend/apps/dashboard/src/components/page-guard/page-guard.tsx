import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import {
  DEFAULT_LOGGED_IN_ROUTE,
  DEFAULT_LOGGED_OUT_ROUTE,
  LOGGED_OUT_ROUTES,
} from '../../config/constants';
import useSessionUser from '../../hooks/use-session-user';

export type PageGuardProps = {
  children: JSX.Element;
};

const PageGuard = ({ children }: PageGuardProps) => {
  const { isLoggedIn, setReturnUrl } = useSessionUser();
  const router = useRouter();
  const isLoggedOutRoute = LOGGED_OUT_ROUTES.includes(router.pathname);
  const isLoggedInRoute = !isLoggedOutRoute;
  const hasAccessToThePage =
    (isLoggedInRoute && isLoggedIn) || (isLoggedOutRoute && !isLoggedIn);

  useEffect(() => {
    if (!hasAccessToThePage) {
      if (!isLoggedIn) {
        // Save the url we were trying to visit before being redirected
        setReturnUrl(router.asPath);
      }
      router.push(
        isLoggedIn ? DEFAULT_LOGGED_IN_ROUTE : DEFAULT_LOGGED_OUT_ROUTE,
      );
    }
  }, [hasAccessToThePage, isLoggedIn, router, setReturnUrl]);

  return hasAccessToThePage ? children : <div />;
};

export default PageGuard;

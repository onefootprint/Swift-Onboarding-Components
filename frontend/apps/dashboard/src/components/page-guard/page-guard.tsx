import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import {
  DEFAULT_LOGGED_IN_ROUTE,
  DEFAULT_LOGGED_OUT_ROUTE,
  LOGGED_OUT_ROUTES,
} from '../../config/constants';
import useSessionUser from '../../hooks/use-session-user';

export type PageGuardProps = {
  children: React.ReactNode;
};

const PageGuard = ({ children }: PageGuardProps) => {
  const { isLoggedIn } = useSessionUser();
  const router = useRouter();
  const isLoggedOutRoute = LOGGED_OUT_ROUTES.includes(router.asPath);
  const isLoggedInRoute = !isLoggedOutRoute;
  const hasAccessToThePage =
    (isLoggedInRoute && isLoggedIn) || (isLoggedOutRoute && !isLoggedIn);

  useEffect(() => {
    if (!hasAccessToThePage) {
      router.push(
        isLoggedIn ? DEFAULT_LOGGED_IN_ROUTE : DEFAULT_LOGGED_OUT_ROUTE,
      );
    }
  }, [hasAccessToThePage, isLoggedIn, router]);

  return hasAccessToThePage ? children : null;
};

export default PageGuard;

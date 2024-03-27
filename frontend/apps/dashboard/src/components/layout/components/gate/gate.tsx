import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';

import usePermissionsByRoute from './hooks/use-permissions';

export type GateProps = {
  children: JSX.Element;
};

const Gate = ({ children }: GateProps) => {
  const router = useRouter();
  const [shouldShowPage, setShowPage] = useState(false);

  const next = () => {
    setShowPage(true);
  };

  const redirect = (url: string) => {
    const waitPageChangeAndNext = () => {
      next();
      router.events.on('routeChangeComplete', waitPageChangeAndNext);
    };
    router.events.on('routeChangeComplete', waitPageChangeAndNext);
    router.push(url);
  };

  usePermissionsByRoute({
    publicRoute: {
      onSuccess: () => {
        next();
      },
      onError: () => {
        redirect(DEFAULT_PUBLIC_ROUTE);
      },
    },
    privateRoute: {
      onSuccess: () => {
        next();
      },
      onError: ({ isLoggedIn, requiresOnboarding }) => {
        if (!isLoggedIn) {
          redirect('/authentication/sign-in');
          return;
        }
        if (requiresOnboarding) {
          redirect('/onboarding');
          return;
        }
        redirect(DEFAULT_PUBLIC_ROUTE);
      },
    },
  });

  return shouldShowPage ? children : <div />;
};

export default Gate;

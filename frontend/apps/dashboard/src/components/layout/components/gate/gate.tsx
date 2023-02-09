import { useRouter } from 'next/router';
import React, { useState } from 'react';

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
        redirect('/users');
      },
    },
    privateRoute: {
      onSuccess: () => {
        next();
      },
      onError: ({ isLoggedIn, requiresOnboarding }) => {
        if (!isLoggedIn) {
          redirect('/login');
          return;
        }
        if (requiresOnboarding) {
          redirect('/onboarding');
          return;
        }
        redirect('/users');
      },
    },
  });

  return shouldShowPage ? children : <div />;
};

export default Gate;

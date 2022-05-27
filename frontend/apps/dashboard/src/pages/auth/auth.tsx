import useSessionUser from '@src/hooks/use-session-user';
import { NextRouter, useRouter } from 'next/router';
import React, { useEffect } from 'react';

// TODO: this page will be obsolete once we refactor flow from workOS,
// but for now gets us working authentication
const Auth = () => {
  const router = useRouter();
  const session = useSessionUser();

  // https://github.com/vercel/next.js/issues/8259
  function isRouterReady(nextRouter: NextRouter) {
    return nextRouter.asPath !== nextRouter.route;
  }

  useEffect(() => {
    if (isRouterReady(router)) {
      const { auth, email } = router.query;
      const loginInfoSet =
        auth && email && !Array.isArray(auth) && !Array.isArray(email);
      if (loginInfoSet) {
        session.logIn({ auth, email });
        router.push('/users');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return <div />;
};

export default Auth;

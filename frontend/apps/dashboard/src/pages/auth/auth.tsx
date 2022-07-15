import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useLogin, { LoginResponse } from 'src/hooks/login/login';
import useSessionUser from 'src/hooks/use-session-user';

const Auth = () => {
  const router = useRouter();
  const { isLoggedIn, logIn } = useSessionUser();
  const login = useLogin();
  const {
    query: { code },
    isReady,
  } = router;

  useEffect(() => {
    if (
      isLoggedIn ||
      login.isLoading ||
      !isReady ||
      !code ||
      Array.isArray(code)
    ) {
      return;
    }
    login.mutate(code, {
      onSuccess({ auth, email }: LoginResponse) {
        logIn({ auth, email });
        router.push('/');
      },
    });
  });

  return <div />;
};

export default Auth;

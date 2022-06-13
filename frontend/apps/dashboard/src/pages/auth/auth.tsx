import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useLogin, { LoginResponse } from 'src/hooks/login/login';
import useSessionUser from 'src/hooks/use-session-user';

const Auth = () => {
  const router = useRouter();
  const session = useSessionUser();
  const login = useLogin();
  const {
    query: { code },
    isReady,
  } = router;

  useEffect(() => {
    if (!isReady || !code || Array.isArray(code)) {
      return;
    }
    login.mutate(code, {
      onSuccess({ auth, email }: LoginResponse) {
        session.logIn({ auth, email });
        router.push('/users');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, code, router]);

  return <div />;
};

export default Auth;

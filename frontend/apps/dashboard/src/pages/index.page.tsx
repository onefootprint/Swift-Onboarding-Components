import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSessionUser from 'src/hooks/use-session-user';

const Page = () => {
  const router = useRouter();
  const { returnUrl, setReturnUrl } = useSessionUser();

  // Redirect to the URL that was initially attempted to be visited before we were redirected to login
  // Otherwise, default to /users
  useEffect(() => {
    const actualReturnUrl =
      !returnUrl || returnUrl === '/' ? '/users' : returnUrl;
    router.push(actualReturnUrl);
    return () => {
      setReturnUrl(undefined);
    };
  }, [returnUrl, router, setReturnUrl]);
};

export default Page;

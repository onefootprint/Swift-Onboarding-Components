import { AssumeRolePurpose } from '@onefootprint/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import useAssumeAuthRole from 'src/hooks/use-assume-auth-role';
import useSession from 'src/hooks/use-session';

const useRedirect = () => {
  const router = useRouter();
  const assumeRoleMutation = useAssumeAuthRole();
  const { data, logIn } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectToHome = () => {
    router.push(DEFAULT_PUBLIC_ROUTE);
  };

  const assumeAndRedirect = async (options: {
    tenantId: string;
    mode: string;
    redirectUrl: string;
    authToken: string;
  }) => {
    const response = await assumeRoleMutation.mutateAsync({
      tenantId: options.tenantId,
      authToken: options.authToken,
      purpose: AssumeRolePurpose.dashboard,
    });
    await logIn({ auth: response.token, newIsLive: options.mode === 'live' });
    router.replace(options.redirectUrl);
  };

  useEffect(() => {
    if (router.isReady) {
      const tenantId = router.query.tenant_id as string | undefined;
      const mode = router.query.mode as string | undefined;
      const redirectUrl = router.query.redirect_url as string | undefined;
      const authToken = data?.auth;

      const isValid = tenantId && mode && redirectUrl && authToken;
      if (isValid) {
        assumeAndRedirect({ tenantId, mode, redirectUrl, authToken });
      } else {
        redirectToHome();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  return { tenantName: router.query.tenant_name as string };
};

export default useRedirect;

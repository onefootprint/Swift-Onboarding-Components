import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { AssumeRolePurpose, OrgAssumeRoleRequest } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import { assumeRole } from './use-assume-auth-role/use-assume-auth-role';

/**
 * Creates the absolute URL to the docs site that will log the user into the docs site as the
 * currently authenticated dashboard user using a docs-site-specific token.
 * After login, the user will be redirected to the relative `docsRedirectUrl` on the docs site.
 */
const useComposeDocsLoginUrl = () => {
  const {
    data: { auth, org },
  } = useSession();

  return useMutation(async (docsRedirectUrl: string) => {
    if (!org?.id || !auth) {
      throw Error('User is not logged in');
    }
    const response = await assumeRole({
      tenantId: org?.id,
      authToken: auth,
      purpose: AssumeRolePurpose.docs,
    });
    return `${DOCS_BASE_URL}/login?redirectUrl=${docsRedirectUrl}#${response.token}`;
  });
};

export default useComposeDocsLoginUrl;

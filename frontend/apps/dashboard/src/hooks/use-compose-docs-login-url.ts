import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { AssumeRolePurpose } from '@onefootprint/types';
import useAssumeRole from 'src/hooks/use-assume-auth-role';
import useSession from 'src/hooks/use-session';

const useComposeDocsLoginUrl = () => {
  const {
    data: { auth, org },
  } = useSession();
  const assumeRole = useAssumeRole();

  const composeDocsLoginUrl = async (docsRedirectUrl: string) => {
    if (!org?.id || !auth) {
      throw Error('User is not logged in');
    }
    const response = await assumeRole.mutateAsync({
      tenantId: org?.id,
      authToken: auth,
      purpose: AssumeRolePurpose.docs,
    });
    return `${DOCS_BASE_URL}/login?redirectUrl=${docsRedirectUrl}#${response.token}`;
  };

  return {
    /**
     * Creates the absolute URL to the docs site that will log the user into the docs site as the
     * currently authenticated dashboard user using a docs-site-specific token.
     * After login, the user will be redirected to the relative `docsRedirectUrl` on the docs site.
     */
    composeDocsLoginUrl,
  };
};

export default useComposeDocsLoginUrl;

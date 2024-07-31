import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

type DocsTokenResponse = {
  token: string;
};

const generateDocsToken = async (authToken: string) => {
  const response = await request<DocsTokenResponse>({
    method: 'POST',
    url: '/org/auth/docs_token',
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
  });
  return response.data;
};

/**
 * Creates the absolute URL to the docs site that will log the user into the docs site as the
 * currently authenticated dashboard user using a docs-site-specific token.
 * After login, the user will be redirected to the relative `docsRedirectUrl` on the docs site.
 */
const useComposeDocsLoginUrl = () => {
  const {
    data: { auth },
  } = useSession();

  return useMutation(async (docsRedirectUrl: string) => {
    if (!auth) {
      throw Error('User is not logged in');
    }
    const { token } = await generateDocsToken(auth);
    return `${DOCS_BASE_URL}/auth?redirectUrl=${docsRedirectUrl}#${token}`;
  });
};

export default useComposeDocsLoginUrl;

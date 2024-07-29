import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import useSession from 'src/hooks/use-session';

const useComposeDocsLoginUrl = () => {
  const {
    // TODO use downscoped token retrieved from the backend instead of dashboard auth token
    data: { auth },
  } = useSession();

  const composeDocsLoginUrl = (docsRedirectUrl: string) => {
    return `${DOCS_BASE_URL}/login?redirectUrl=${docsRedirectUrl}#${auth}`;
  };

  return {
    /**
     * Creates the absolute URL to the docs site that will log the user into the docs site as the
     * currently authenticated dashboard user.
     * After login, the user will be redirected to the relative `docsRedirectUrl` on the docs site.
     */
    composeDocsLoginUrl,
  };
};

export default useComposeDocsLoginUrl;

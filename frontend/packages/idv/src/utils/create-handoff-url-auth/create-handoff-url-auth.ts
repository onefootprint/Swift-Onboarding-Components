import { getSessionIdFromStorage } from '@onefootprint/dev-tools';
import { AUTH_BASE_URL } from '@onefootprint/global-constants';

const createHandoffUrlAuth = ({
  authToken,
  baseUrl = AUTH_BASE_URL,
  language = 'en',
}: { authToken?: string; baseUrl?: string; language?: string }) => {
  if (!authToken) return undefined;

  const newUrl = new URL(baseUrl);
  const params = new URLSearchParams();

  newUrl.pathname = 'handoff/';

  const fpSessionId = getSessionIdFromStorage();
  if (fpSessionId) {
    params.append('xfpsessionid', fpSessionId);
  }

  if (language !== 'en') {
    params.append('lng', language);
  }

  const randomSeed = Math.floor(Math.random() * 1000).toString();
  params.append('r', randomSeed);

  newUrl.search = params.toString();
  newUrl.hash = encodeURI(authToken);

  return newUrl;
};

export default createHandoffUrlAuth;

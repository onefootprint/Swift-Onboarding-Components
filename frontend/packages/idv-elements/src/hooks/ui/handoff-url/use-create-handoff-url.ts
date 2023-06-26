import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import { useEffect, useState } from 'react';

const useCreateHandoffUrl = (authToken?: string) => {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!authToken) {
      return;
    }

    // If the user opens a handoff url when there is an old handoff session,
    // the distinct query param will force the page to re-load.
    // For now, generate at most 3 digits to randomize the url. Chance of a
    // user generating the same url twice is 0.001^2.
    const randomSeed = Math.floor(Math.random() * 1000);
    const newUrl = `${HANDOFF_BASE_URL}/verify?r=${randomSeed}#${encodeURI(
      authToken,
    )}`;
    setUrl(newUrl);
  }, [authToken]);

  return url;
};

export default useCreateHandoffUrl;

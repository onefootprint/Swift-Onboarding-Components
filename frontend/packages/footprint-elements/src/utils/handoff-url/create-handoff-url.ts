import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';

import { HandoffUrlQuery } from './types';

const createHandoffUrl = (query: HandoffUrlQuery) => {
  const token = `#${encodeURI(query.authToken)}`;
  const opener = (query.opener && `?opener=${query.opener}`) || '';
  return `${HANDOFF_BASE_URL}${opener}${token}`;
};

export default createHandoffUrl;

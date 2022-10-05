import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';

import { HandoffUrlQuery } from './types';

const createHandoffUrl = (query: HandoffUrlQuery) =>
  `${HANDOFF_BASE_URL}#${encodeURI(JSON.stringify(query))}`;

export default createHandoffUrl;

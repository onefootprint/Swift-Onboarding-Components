import { client } from '@onefootprint/fetch';
import footprint from '@onefootprint/footprint-js';
import { API_BASE_URL, CLIENT_VERSION } from './config/constants';

client?.setConfig({
  baseUrl: API_BASE_URL,
  headers: {
    'x-fp-client-version': CLIENT_VERSION,
  },
});

/** @deprecated This component will be removed in the next major version */
export { default as FootprintButton } from './components/footprint-button';
export { default as FootprintForm } from './components/footprint-form';
export { default as FootprintRender } from './components/footprint-render';

export * from './components/onboarding-components';

export type { FormValues } from './types';
export { ApiError, InlineOtpNotSupported, InlineProcessError, type ApiErrorDetails } from './types';
export type { UserDataError } from './types';

export default footprint;

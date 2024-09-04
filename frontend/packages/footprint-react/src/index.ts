import footprint from '@onefootprint/footprint-js';

/** @deprecated This component will be removed in the next major version */
export { default as FootprintButton } from './components/footprint-button';
export { default as FootprintForm } from './components/footprint-form';
export { default as FootprintRender } from './components/footprint-render';

export * from './components/onboarding-components';

export type { FormValues, BootstrapData } from './types';
export { ApiError, type ApiErrorDetails } from './types';
export type { UserDataError } from './types';

export default footprint;

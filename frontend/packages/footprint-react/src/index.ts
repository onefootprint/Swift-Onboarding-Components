import footprint from '@onefootprint/footprint-js';

/** @deprecated This component will be removed in the next major version */
export { default as FootprintButton } from './components/footprint-button';
export { default as FootprintForm } from './components/footprint-form';
export { default as FootprintRender } from './components/footprint-render';
export { default as Fp } from './components/onboarding-components';
export { useFootprint } from './components/onboarding-components/hooks/use-footprint';
export { default as useOtp } from './components/onboarding-components/hooks/use-otp';

export type { FormValues, BootstrapData } from './types';
export { ApiError, type ApiErrorDetails } from './types';
export type { UserDataError } from './types';

export default footprint;

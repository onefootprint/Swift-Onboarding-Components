import type {
  FootprintVerifyAuthToken,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';

export type BifrostProps = Pick<
  FootprintVerifyProps,
  'userData' | 'options' | 'l10n'
> &
  FootprintVerifyAuthToken;

import { IdentifyTokenScope } from '@onefootprint/types/src/api/identify-verify';

import { IdentifyVariant } from '../state/types';

const variantToTokenScope: Record<IdentifyVariant, IdentifyTokenScope> = {
  [IdentifyVariant.auth]: IdentifyTokenScope.auth,
  [IdentifyVariant.updateLoginMethods]: IdentifyTokenScope.auth,
  [IdentifyVariant.verify]: IdentifyTokenScope.onboarding,
};

const getTokenScope = (variant: IdentifyVariant): IdentifyTokenScope =>
  variantToTokenScope[variant];

export default getTokenScope;

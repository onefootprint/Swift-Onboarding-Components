import { AuthMethodKind } from '../data/auth-method';

export type UserAuthMethodsResponse = {
  canUpdate?: boolean;
  isVerified: boolean;
  kind: AuthMethodKind;
}[];

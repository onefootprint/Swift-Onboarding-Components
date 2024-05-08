import type { Role } from './role';
import type { Rolebinding } from './rolebinding';

export type Member = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Exclude<Role, 'numActiveUsers' | 'numActiveApiKeys'>;
  // Optional since FirmEmployee sessions don't have a rolebinding
  rolebinding: Rolebinding | null;
};

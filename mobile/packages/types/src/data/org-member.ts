import { Role } from './role';
import { Rolebinding } from './rolebinding';

export type Member = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  // Optional since FirmEmployee sessions don't have a rolebinding
  rolebinding: Rolebinding | null;
};

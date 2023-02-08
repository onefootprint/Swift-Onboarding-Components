import { OrgRole } from './org-role';
import { OrgRolebinding } from './org-rolebinding';

export type OrgMember = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: OrgRole;
  // Optional since FirmEmployee sessions don't have a rolebinding
  rolebinding: OrgRolebinding | null;
};

export type OrgMember = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  roleName: string;
  roleId: string;
};

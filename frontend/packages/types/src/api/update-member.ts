import { OrgMember } from '../data';

export type UpdateMemberRequest = {
  roleId: string;
};

export type UpdateMemberResponse = OrgMember;

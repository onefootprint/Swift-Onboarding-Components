import type { Member } from '../data';

export type UpdateMemberRequest = {
  roleId: string;
};

export type UpdateMemberResponse = Member;

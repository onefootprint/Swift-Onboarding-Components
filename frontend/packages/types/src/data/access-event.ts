import type { Actor } from './actor';
import type { InsightEvent } from './insight-event';
import type { RoleScope } from './role';

export enum AccessEventKind {
  CreateOrgRole = 'create_org_role',
  DeactivateOrgRole = 'deactivate_org_role',
  UpdateOrgRole = 'update_org_role',
  UpdateUserData = 'update_user_data',
  DeleteUserData = 'delete_user_data',
  DecryptUserData = 'decrypt_user_data',
  CreateUserAnnotation = 'create_user_annotation',
  CreateOrgApiKey = 'create_org_api_key',
  DecryptOrgApiKey = 'decrypt_org_api_key',
  UpdateOrgApiKey = 'update_org_api_key',
  InviteOrgMember = 'invite_org_member',
  UpdateOrgMember = 'update_org_member',
  DeactivateOrgMember = 'deactivate_org_member',
  // TODO - none below in BE headers yet
  CreatePlaybook = 'create_playbook',
  DisablePlaybook = 'disable_playbook',
  EditPlaybook = 'edit_playbook',
  ManuallyReviewedUser = 'manually_reviewed_entity',
}

type AccessEventDetailWrapper<T> = {
  kind: AccessEventKind;
  data: T;
};

export type CreateOrgRoleDetail = AccessEventDetailWrapper<{
  roleName: string;
  scopes: RoleScope[];
  tenantRoleId: string;
}>;

export type UpdateUserDataDetail = AccessEventDetailWrapper<{
  roleName: string;
  newScopes: RoleScope[];
  prevScopes: RoleScope[];
}>;

export type DeleteUserDataDetail = AccessEventDetailWrapper<{}>;

export type DecryptUserDataDetail = AccessEventDetailWrapper<{
  fpId: string;
  reason: string;
  decryptedFields: string[];
}>;

export type UpdateOrgRoleDetail = AccessEventDetailWrapper<{
  roleName: string;
  prevScopes: RoleScope[];
  newScopes: RoleScope[];
  tenantRoleId: string;
}>;
export type CreateUserAnnotationDetail = AccessEventDetailWrapper<{}>;

export type CreateOrgApiKeyDetail = AccessEventDetailWrapper<{}>;

export type DecryptOrgApiKeyDetail = AccessEventDetailWrapper<{}>;

export type UpdateOrgApiKeyDetail = AccessEventDetailWrapper<{}>;

export type InviteOrgMemberDetail = AccessEventDetailWrapper<{
  email: string;
  tenantRoleName: string;
  tenantRoleId: string;
  firstName: string;
  lastName: string;
  scopes: RoleScope[];
}>;

export type UpdateOrgMemberDetail = AccessEventDetailWrapper<{
  tenant_role_id: string;
  prev_scopes: RoleScope[];
  new_scopes: RoleScope[];
}>;

export type DeactivateOrgMemberDetail = AccessEventDetailWrapper<{
  tenantRoleId: string;
  roleName: string;
}>;

export type CreatePlaybookDetail = AccessEventDetailWrapper<{}>;

export type DisablePlaybookDetail = AccessEventDetailWrapper<{}>;

export type EditPlaybookDetail = AccessEventDetailWrapper<{}>;

export type ManuallyReviewedUserDetail = AccessEventDetailWrapper<{}>;

export type DeactivateOrgRoleDetail = AccessEventDetailWrapper<{
  roleName: string;
  scopes: RoleScope[];
}>;

export type AccessEventDetailMap = {
  [AccessEventKind.CreateOrgRole]: CreateOrgRoleDetail;
  [AccessEventKind.UpdateUserData]: UpdateUserDataDetail;
  [AccessEventKind.DeleteUserData]: DeleteUserDataDetail;
  [AccessEventKind.DecryptUserData]: DecryptUserDataDetail;
  [AccessEventKind.CreateUserAnnotation]: CreateUserAnnotationDetail;
  [AccessEventKind.CreateOrgApiKey]: CreateOrgApiKeyDetail;
  [AccessEventKind.DecryptOrgApiKey]: DecryptOrgApiKeyDetail;
  [AccessEventKind.UpdateOrgApiKey]: UpdateOrgApiKeyDetail;
  [AccessEventKind.InviteOrgMember]: InviteOrgMemberDetail;
  [AccessEventKind.UpdateOrgMember]: UpdateOrgMemberDetail;
  [AccessEventKind.DeactivateOrgMember]: DeactivateOrgMemberDetail;
  [AccessEventKind.CreatePlaybook]: CreatePlaybookDetail;
  [AccessEventKind.DisablePlaybook]: DisablePlaybookDetail;
  [AccessEventKind.EditPlaybook]: EditPlaybookDetail;
  [AccessEventKind.ManuallyReviewedUser]: ManuallyReviewedUserDetail;
  [AccessEventKind.DeactivateOrgRole]: DeactivateOrgRoleDetail;
  [AccessEventKind.UpdateOrgRole]: UpdateOrgRoleDetail;
};

export type AccessEvent<T extends AccessEventKind = AccessEventKind> = {
  id: string;
  timestamp: string;
  tenantId: string;
  name: T;
  principal: Actor;
  insightEvent?: InsightEvent;
  detail: AccessEventDetailMap[T];
};

export type TransformedAccessEvent = {
  targets: string[];
  kind: AccessEventKind;
  fpId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: Actor;
  insightEvent?: InsightEvent;
};

import type { InsightEvent } from './insight-event';

export enum AccessEventKind {
  CreateOrgRole = 'create_org_role',
  UpdateUserData = 'update_user_data',
  DeleteUserData = 'delete_user_data',
  DecryptUserData = 'decrypt_user_data',
  CreateUserAnnotation = 'create_user_annotation',
  CreateOrgApiKey = 'create_org_api_key',
  DecryptOrgApiKey = 'decrypt_org_api_key',
  UpdateOrgApiKey = 'update_org_api_key',
  InviteOrgMember = 'invite_org_member',
  UpdateOrgMember = 'update_org_member',
  RemoveOrgMember = 'remove_org_member',
  // TODO - none below in BE headers yet
  CreatePlaybook = 'create_playbook',
  DisablePlaybook = 'disable_playbook',
  EditPlaybook = 'edit_playbook',
  ManuallyReviewedUser = 'manually_reviewed_entity',
  DeactivateOrgRole = 'deactivate_org_role',
}

export type AccessEvent = {
  id: string;
  timestamp: string;
  tenantId: string;
  name: AccessEventKind;
  principal: {
    kind: string;
    id?: string;
    name?: string;
    member?: string;
  };
  insightEvent?: InsightEvent;
  detail: {
    kind: AccessEventKind;
    data: {
      fpId: string;
      reason: string;
      decryptedFields: string[];
    };
  };
};

export type TransformedAccessEvent = {
  targets: string[];
  kind: AccessEventKind;
  fpId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: string;
  insightEvent?: InsightEvent;
};

import UserDataAttribute from './user-data-attribute';

export type OrgRoleScope =
  | 'read'
  // A special scope that gives permission to perform all actions.
  | 'admin'
  // Allows adding and editing onboarding configurations
  | 'onboarding_configuration'
  // Allows adding, editing, and decrypting tenant API keys
  | 'api_keys'
  // Allows updating org settings, roles, and users
  | 'org_settings'
  // Allows decrypting all custom attributes. TODO more fine-grained decryption controls
  | 'decrypt_custom'
  // Allows decrypting identity documents
  | 'decrypt_documents'
  // Allows decrypting identity data attributes belonging to the listed CollectedDataOptions
  | `decrypt.${UserDataAttribute}`
  //  Allows performing manual review actions on users, like making a new decision or adding an annotation
  | 'manual_review';

export type OrgRole = {
  id: string;
  name: string;
  scopes: OrgRoleScope[];
  isImmutable: boolean;
  createdAt: string;
};

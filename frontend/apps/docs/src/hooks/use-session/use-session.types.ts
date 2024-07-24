import { Organization, RoleScope } from '@onefootprint/types';

export type Session = {
  authToken?: string;
  user?: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    isAssumedSession?: boolean;
    isFirmEmployee?: boolean;
    scopes: RoleScope[];
    tenant: Organization;
  };
};

export const defaultSession = {
  authToken: undefined,
  user: undefined,
};

// Whenever changing this, make sure to read this guide:
// https://www.notion.so/onefootprint/Migrating-session-w-Zustand-92cc5a563d6747ca80fd689232c5b7b4
export type SessionState = {
  data: Session;
  update: (data: Partial<Session>) => void;
  reset: () => void;
};

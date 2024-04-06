import type { Organization, RoleScope } from '@onefootprint/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserSession = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  scopes: RoleScope[];
  isAssumedSession: boolean;
  isAssumedSessionEditMode?: boolean;
  isFirmEmployee?: boolean;
};

type OrgSession = {
  id: string;
  name: Organization['name'];
  logoUrl: Organization['logoUrl'];
  isSandboxRestricted: Organization['isSandboxRestricted'];
  isLive: boolean;
  isProdAuthPlaybookRestricted?: boolean;
  isProdKybPlaybookRestricted: boolean;
  isProdKycPlaybookRestricted: boolean;
};

type MetaSession = {
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
};

export type Session = {
  auth?: string;
  user?: UserSession;
  org?: OrgSession;
  meta: MetaSession;
};

type UserSessionState = {
  data: Session;
  reset: () => void;
  update: (data: Partial<Session>) => void;
};

const defaultSession = {
  auth: undefined,
  org: undefined,
  user: undefined,
  meta: {
    createdNewTenant: false,
    isFirstLogin: false,
    requiresOnboarding: false,
  },
};

const useClientStore = create<UserSessionState>()(
  persist(
    set => ({
      data: defaultSession,
      reset: () => set({ data: defaultSession }),
      update: (session: Partial<Session>) => {
        set(old => ({
          ...old,
          data: {
            ...old.data,
            ...session,
          },
        }));
      },
    }),
    { name: 'partners-storage', version: 1 },
  ),
);

export default useClientStore;

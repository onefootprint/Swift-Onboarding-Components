export type Session = {
  orgId?: string;
};

export const defaultSession = {
  orgId: undefined,
};

// Whenever changing this, make sure to read this guide:
// https://www.notion.so/onefootprint/Migrating-session-w-Zustand-92cc5a563d6747ca80fd689232c5b7b4
export type LoggedOutStorageState = {
  data: Session;
  update: (data: Partial<Session>) => void;
  reset: () => void;
};

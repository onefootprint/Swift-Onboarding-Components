export type SharedState = {
  authToken: string;
  startOnboarding: (inheritBusinessId?: string) => void;
  isLoading: boolean;
};

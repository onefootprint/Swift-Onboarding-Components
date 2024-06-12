import type { Di } from './dis';

export type UserDataError = {
  context: Partial<Record<keyof Di, string>> | string;
};

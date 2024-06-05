import type { Di } from './dis';

export type UserDataError = {
  error: {
    message: Partial<Record<keyof Di, string>> | string;
  };
};

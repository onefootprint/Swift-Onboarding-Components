export type UserUpdateRequest = {
  firstName: string | null;
  lastName: string | null;
};

export type UserUpdateResponse = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

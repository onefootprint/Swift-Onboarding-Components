// TODO probably deprecated
export type UserDecryptRequest = {
  attributes: string[];
  authToken: string;
};

export type UserDecryptResponse = {
  city: string | null;
  country: string | null;
  dob: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  state: string | null;
  streetAddress: string | null;
  streetAddress2: string | null;
  zip: string | null;
};

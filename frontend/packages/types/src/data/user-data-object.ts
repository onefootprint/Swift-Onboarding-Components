export type UserDataObj = {
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  zip_address?: {
    country?: string;
    zip?: string;
  };
  dob?: {
    day?: number;
    month?: number;
    year?: number;
  };
  name?: {
    firstName?: string;
    lastName?: string;
  };
  ssn9?: string;
  ssn4?: string;
};

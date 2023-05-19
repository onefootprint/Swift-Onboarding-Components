export type BusinessBoKycData = {
  name: string;
  inviter: {
    firstName: string;
    lastName: string;
  };
  invited: {
    email: string;
    phoneNumber: string;
  };
};

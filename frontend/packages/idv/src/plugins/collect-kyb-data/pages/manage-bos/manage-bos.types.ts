export type NewBusinessOwner = {
  uuid: string;
  firstName: string;
  lastName: string;
  ownershipStake: number;
  email: string;
  phoneNumber: string;
};

export type ManageBosFormData = {
  bos: NewBusinessOwner[];
  bosToDelete: string[];
};

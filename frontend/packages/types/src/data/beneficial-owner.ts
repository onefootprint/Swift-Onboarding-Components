// TODO: these are placeholder types
export enum BeneficialOwnerDataAttribute {
  firstName = 'first_name',
  lastName = 'last_name',
  ownershipStake = 'ownership_stake',
}

export type BeneficialOwner = {
  [BeneficialOwnerDataAttribute.firstName]: string;
  [BeneficialOwnerDataAttribute.lastName]: string;
  [BeneficialOwnerDataAttribute.ownershipStake]: number;
};

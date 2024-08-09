export enum BeneficialOwnerDataAttribute {
  firstName = 'first_name',
  // TODO we can rm this
  middleName = 'middle_name',
  lastName = 'last_name',
  ownershipStake = 'ownership_stake',
  email = 'email',
  phoneNumber = 'phone_number',
}

export type BeneficialOwner = {
  [BeneficialOwnerDataAttribute.firstName]: string;
  [BeneficialOwnerDataAttribute.middleName]?: string;
  [BeneficialOwnerDataAttribute.lastName]: string;
  [BeneficialOwnerDataAttribute.ownershipStake]: number;
  [BeneficialOwnerDataAttribute.email]?: string;
  [BeneficialOwnerDataAttribute.phoneNumber]?: string;
};

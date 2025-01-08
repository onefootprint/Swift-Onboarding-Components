export const isBeneficialOwnerDI = (di: string) => di.includes('business.beneficial_owners');
export const isBOStakeDI = (di: string) => isBeneficialOwnerDI(di) && di.includes('ownership_stake');
export const isBONameDI = (di: string) => isBeneficialOwnerDI(di) && di.includes('business_owner');

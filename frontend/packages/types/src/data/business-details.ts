export type RawBusinessDetails = {
  entityType: string | null;
  formationDate: string | null;
  formationState: string | null;
  phoneNumbers: BusinessDetailPhoneNumber[];
  tin: BusinessDetailTin | null;
  website: BusinessDetailWebsite | null;
};

export type BusinessDetails = {
  [BusinessDetail.entityType]: string;
  [BusinessDetail.formationDate]: string;
  [BusinessDetail.formationState]: string;
  [BusinessDetail.phoneNumbers]: BusinessDetailPhoneNumber[];
  [BusinessDetail.tin]: BusinessDetailTin;
  [BusinessDetail.website]: BusinessDetailWebsite;
};

export type BusinessDetailPhoneNumber = {
  phone: string;
  submitted: boolean | null;
  verified: boolean | null;
};

export type BusinessDetailTin = {
  tin: string;
  verified: boolean | null;
};

export type BusinessDetailWebsite = {
  url: string;
  verified: boolean | null;
};

export type BusinessDetailValue = string | BusinessDetailPhoneNumber | BusinessDetailTin | BusinessDetailWebsite;

export enum BusinessDetail {
  formationDate = 'formationDate',
  formationState = 'formationState',
  tin = 'tin',
  entityType = 'entityType',
  phoneNumber = 'phoneNumber',
  phoneNumbers = 'phoneNumbers',
  website = 'website',
}

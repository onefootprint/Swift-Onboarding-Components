export type RawBusinessDetails = {
  entityType: string | null;
  formationDate: string | null;
  formationState: string | null;
  phoneNumbers: BusinessDetailPhoneNumber[];
  tin: BusinessDetailTin | null;
  website: BusinessDetailWebsite | null;
};

export type BusinessDetails = {
  entityType: string;
  formationDate: string;
  formationState: string;
  phoneNumbers: BusinessDetailPhoneNumber[];
  tin: BusinessDetailTin;
  website: BusinessDetailWebsite;
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

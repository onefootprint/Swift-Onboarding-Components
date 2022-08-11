import { DataKinds } from 'src/types/data-kind';

export type NameFormData = {
  name: string;
};

export type CollectFormData = {
  name: boolean;
  [DataKinds.city]: boolean;
  [DataKinds.country]: boolean;
  [DataKinds.dob]: boolean;
  [DataKinds.email]: boolean;
  [DataKinds.lastFourSsn]: boolean;
  [DataKinds.phoneNumber]: boolean;
  [DataKinds.ssn]: boolean;
  [DataKinds.state]: boolean;
  [DataKinds.streetAddress]: boolean;
  [DataKinds.streetAddress2]: boolean;
  [DataKinds.zip]: boolean;
};

export type AccessFormData = CollectFormData;

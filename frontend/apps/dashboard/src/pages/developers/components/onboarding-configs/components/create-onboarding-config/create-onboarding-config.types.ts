import { DataKinds, VirtualDataKinds } from 'src/types/data-kind';

export type NameFormData = {
  name: string;
};

export type DataKindForm = {
  [DataKinds.dob]: boolean;
  [DataKinds.email]: boolean;
  [DataKinds.lastFourSsn]: boolean;
  [DataKinds.phoneNumber]: boolean;
  [DataKinds.ssn]: boolean;
  [VirtualDataKinds.addressFull]: boolean;
  [VirtualDataKinds.addressPartial]: boolean;
  [VirtualDataKinds.name]: boolean;
};
